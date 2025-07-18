/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { SavedObject } from '@kbn/core/server';

import Boom from '@hapi/boom';
import type { RawRule } from '../../../../types';
import { WriteOperations, AlertingAuthorizationEntity } from '../../../../authorization';
import { retryIfConflicts } from '../../../../lib/retry_if_conflicts';
import { ruleAuditEvent, RuleAuditAction } from '../../../../rules_client/common/audit_events';
import type { RulesClientContext } from '../../../../rules_client/types';
import {
  untrackRuleAlerts,
  updateMeta,
  bulkMigrateLegacyActions,
} from '../../../../rules_client/lib';
import { RULE_SAVED_OBJECT_TYPE } from '../../../../saved_objects';
import type { DisableRuleParams } from './types';
import { disableRuleParamsSchema } from './schemas';

export async function disableRule(
  context: RulesClientContext,
  { id, untrack = false }: DisableRuleParams
): Promise<void> {
  return await retryIfConflicts(
    context.logger,
    `rulesClient.disableRule('${id}')`,
    async () => await disableWithOCC(context, { id, untrack })
  );
}

async function disableWithOCC(
  context: RulesClientContext,
  { id, untrack = false }: DisableRuleParams
) {
  let attributes: RawRule;
  let version: string | undefined;

  try {
    disableRuleParamsSchema.validate({ id, untrack });
  } catch (error) {
    throw Boom.badRequest(`Error validating disable rule parameters - ${error.message}`);
  }
  let alert: SavedObject<RawRule>;
  try {
    const decryptedAlert =
      await context.encryptedSavedObjectsClient.getDecryptedAsInternalUser<RawRule>(
        RULE_SAVED_OBJECT_TYPE,
        id,
        {
          namespace: context.namespace,
        }
      );
    attributes = decryptedAlert.attributes;
    version = decryptedAlert.version;
    alert = decryptedAlert;
  } catch (e) {
    context.logger.error(`disable(): Failed to load API key of alert ${id}: ${e.message}`);
    // Still attempt to load the attributes and version using SOC
    alert = await context.unsecuredSavedObjectsClient.get<RawRule>(RULE_SAVED_OBJECT_TYPE, id);
    attributes = alert.attributes;
    version = alert.version;
  }

  try {
    await context.authorization.ensureAuthorized({
      ruleTypeId: attributes.alertTypeId,
      consumer: attributes.consumer,
      operation: WriteOperations.Disable,
      entity: AlertingAuthorizationEntity.Rule,
    });
  } catch (error) {
    context.auditLogger?.log(
      ruleAuditEvent({
        action: RuleAuditAction.DISABLE,
        savedObject: { type: RULE_SAVED_OBJECT_TYPE, id, name: attributes.name },
        error,
      })
    );
    throw error;
  }

  if (untrack) {
    await untrackRuleAlerts(context, id, attributes);
  }

  context.auditLogger?.log(
    ruleAuditEvent({
      action: RuleAuditAction.DISABLE,
      outcome: 'unknown',
      savedObject: { type: RULE_SAVED_OBJECT_TYPE, id, name: attributes.name },
    })
  );

  context.ruleTypeRegistry.ensureRuleTypeEnabled(attributes.alertTypeId);

  if (attributes.enabled === true) {
    const migratedIds = await bulkMigrateLegacyActions({ context, rules: [alert] });

    await context.unsecuredSavedObjectsClient.update(
      RULE_SAVED_OBJECT_TYPE,
      id,
      updateMeta(context, {
        ...attributes,
        enabled: false,
        scheduledTaskId: attributes.scheduledTaskId === id ? attributes.scheduledTaskId : null,
        updatedBy: await context.getUserName(),
        updatedAt: new Date().toISOString(),
        nextRun: null,
      }),
      {
        version,
        ...(migratedIds.includes(alert.id) ? { references: alert.references } : {}),
      }
    );
    const { autoRecoverAlerts: isLifecycleAlert } = context.ruleTypeRegistry.get(
      attributes.alertTypeId
    );

    // If the scheduledTaskId does not match the rule id, we should
    // remove the task, otherwise mark the task as disabled
    if (attributes.scheduledTaskId) {
      if (attributes.scheduledTaskId !== id) {
        await context.taskManager.removeIfExists(attributes.scheduledTaskId);
      } else {
        await context.taskManager.bulkDisable(
          [attributes.scheduledTaskId],
          Boolean(isLifecycleAlert)
        );
      }
    }
  }
}
