/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: SIEM Rule Migration components
 *   version: not applicable
 */

import { z } from '@kbn/zod';

import { NonEmptyString } from '../../api/model/primitives.gen';
import { RuleResponse } from '../../api/detection_engine/model/rule_schema/rule_schemas.gen';

/**
 * The original rule vendor identifier.
 */
export type OriginalRuleVendor = z.infer<typeof OriginalRuleVendor>;
export const OriginalRuleVendor = z.literal('splunk');

/**
 * The original rule annotations containing additional information.
 */
export type OriginalRuleAnnotations = z.infer<typeof OriginalRuleAnnotations>;
export const OriginalRuleAnnotations = z
  .object({
    /**
     * The original rule Mitre Attack IDs.
     */
    mitre_attack: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

/**
 * The original rule to migrate.
 */
export type OriginalRule = z.infer<typeof OriginalRule>;
export const OriginalRule = z.object({
  /**
   * The original rule id.
   */
  id: NonEmptyString,
  /**
   * The original rule vendor identifier.
   */
  vendor: OriginalRuleVendor,
  /**
   * The original rule name.
   */
  title: NonEmptyString,
  /**
   * The original rule description.
   */
  description: z.string(),
  /**
   * The original rule query.
   */
  query: z.string().min(1),
  /**
   * The original rule query language.
   */
  query_language: z.string(),
  /**
   * The original rule annotations containing additional information.
   */
  annotations: OriginalRuleAnnotations.optional(),
});

/**
 * The migrated elastic rule.
 */
export type ElasticRule = z.infer<typeof ElasticRule>;
export const ElasticRule = z.object({
  /**
   * The migrated rule title.
   */
  title: z.string(),
  /**
   * The migrated rule description.
   */
  description: z.string().optional(),
  /**
   * The migrated rule severity.
   */
  severity: z.string().optional(),
  /**
   * The translated elastic query.
   */
  query: z.string().optional(),
  /**
   * The translated elastic query language.
   */
  query_language: z.literal('esql').optional(),
  /**
   * The Elastic prebuilt rule id matched.
   */
  prebuilt_rule_id: NonEmptyString.optional(),
  /**
   * The Elastic integration IDs related to the rule.
   */
  integration_ids: z.array(z.string()).optional(),
  /**
   * The Elastic rule id installed as a result.
   */
  id: NonEmptyString.optional(),
});

/**
 * The partial version of the migrated elastic rule.
 */
export type ElasticRulePartial = z.infer<typeof ElasticRulePartial>;
export const ElasticRulePartial = ElasticRule.partial();

/**
 * The prebuilt rule version.
 */
export type PrebuiltRuleVersion = z.infer<typeof PrebuiltRuleVersion>;
export const PrebuiltRuleVersion = z.object({
  /**
   * The latest available version of prebuilt rule.
   */
  target: RuleResponse,
  /**
   * The currently installed version of prebuilt rule.
   */
  current: RuleResponse.optional(),
});

/**
 * The rule translation result.
 */
export type RuleMigrationTranslationResult = z.infer<typeof RuleMigrationTranslationResult>;
export const RuleMigrationTranslationResult = z.enum(['full', 'partial', 'untranslatable']);
export type RuleMigrationTranslationResultEnum = typeof RuleMigrationTranslationResult.enum;
export const RuleMigrationTranslationResultEnum = RuleMigrationTranslationResult.enum;

/**
 * The status of each rule migration.
 */
export type RuleMigrationStatus = z.infer<typeof RuleMigrationStatus>;
export const RuleMigrationStatus = z.enum(['pending', 'processing', 'completed', 'failed']);
export type RuleMigrationStatusEnum = typeof RuleMigrationStatus.enum;
export const RuleMigrationStatusEnum = RuleMigrationStatus.enum;

/**
 * The comments for the migration including a summary from the LLM in markdown.
 */
export type RuleMigrationComments = z.infer<typeof RuleMigrationComments>;
export const RuleMigrationComments = z.array(z.string());

/**
 * The rule migration document object.
 */
export type RuleMigrationData = z.infer<typeof RuleMigrationData>;
export const RuleMigrationData = z.object({
  /**
   * The moment of creation
   */
  '@timestamp': z.string(),
  /**
   * The migration id.
   */
  migration_id: NonEmptyString,
  /**
   * The username of the user who created the migration.
   */
  created_by: NonEmptyString,
  /**
   * The original rule to migrate.
   */
  original_rule: OriginalRule,
  /**
   * The migrated elastic rule.
   */
  elastic_rule: ElasticRule.optional(),
  /**
   * The rule translation result.
   */
  translation_result: RuleMigrationTranslationResult.optional(),
  /**
   * The status of the rule migration process.
   */
  status: RuleMigrationStatus.default('pending'),
  /**
   * The comments for the migration including a summary from the LLM in markdown.
   */
  comments: RuleMigrationComments.optional(),
  /**
   * The moment of the last update
   */
  updated_at: z.string().optional(),
  /**
   * The user who last updated the migration
   */
  updated_by: z.string().optional(),
});

/**
 * The rule migration document object.
 */
export type RuleMigration = z.infer<typeof RuleMigration>;
export const RuleMigration = z
  .object({
    /**
     * The rule migration id
     */
    id: NonEmptyString,
  })
  .merge(RuleMigrationData);

/**
 * The status of the migration task.
 */
export type RuleMigrationTaskStatus = z.infer<typeof RuleMigrationTaskStatus>;
export const RuleMigrationTaskStatus = z.enum(['ready', 'running', 'stopped', 'finished']);
export type RuleMigrationTaskStatusEnum = typeof RuleMigrationTaskStatus.enum;
export const RuleMigrationTaskStatusEnum = RuleMigrationTaskStatus.enum;

/**
 * The rule migration task stats object.
 */
export type RuleMigrationTaskStats = z.infer<typeof RuleMigrationTaskStats>;
export const RuleMigrationTaskStats = z.object({
  /**
   * The migration id
   */
  id: NonEmptyString,
  /**
   * Indicates if the migration task status.
   */
  status: RuleMigrationTaskStatus,
  /**
   * The rules migration stats.
   */
  rules: z.object({
    /**
     * The total number of rules to migrate.
     */
    total: z.number().int(),
    /**
     * The number of rules that are pending migration.
     */
    pending: z.number().int(),
    /**
     * The number of rules that are being migrated.
     */
    processing: z.number().int(),
    /**
     * The number of rules that have been migrated successfully.
     */
    completed: z.number().int(),
    /**
     * The number of rules that have failed migration.
     */
    failed: z.number().int(),
  }),
  /**
   * The moment the migration was created.
   */
  created_at: z.string(),
  /**
   * The moment of the last update.
   */
  last_updated_at: z.string(),
});

/**
 * The rule migration translation stats object.
 */
export type RuleMigrationTranslationStats = z.infer<typeof RuleMigrationTranslationStats>;
export const RuleMigrationTranslationStats = z.object({
  /**
   * The migration id
   */
  id: NonEmptyString,
  /**
   * The rules migration translation stats.
   */
  rules: z.object({
    /**
     * The total number of rules to migrate.
     */
    total: z.number().int(),
    /**
     * The number of rules that matched Elastic prebuilt rules.
     */
    prebuilt: z.number().int(),
    /**
     * The number of rules that did not match Elastic prebuilt rules and will be installed as custom rules.
     */
    custom: z.number().int(),
    /**
     * The number of rules that can be installed.
     */
    installable: z.number().int(),
  }),
});

/**
 * The rule migration data object for rule update operation
 */
export type UpdateRuleMigrationData = z.infer<typeof UpdateRuleMigrationData>;
export const UpdateRuleMigrationData = z.object({
  /**
   * The rule migration id
   */
  id: NonEmptyString,
  /**
   * The migrated elastic rule attributes to update.
   */
  elastic_rule: ElasticRulePartial.optional(),
  /**
   * The rule translation result.
   */
  translation_result: RuleMigrationTranslationResult.optional(),
  /**
   * The comments for the migration including a summary from the LLM in markdown.
   */
  comments: RuleMigrationComments.optional(),
});

/**
 * The type of the rule migration resource.
 */
export type RuleMigrationResourceType = z.infer<typeof RuleMigrationResourceType>;
export const RuleMigrationResourceType = z.enum(['macro', 'list']);
export type RuleMigrationResourceTypeEnum = typeof RuleMigrationResourceType.enum;
export const RuleMigrationResourceTypeEnum = RuleMigrationResourceType.enum;

/**
 * The rule migration resource data provided by the vendor.
 */
export type RuleMigrationResourceData = z.infer<typeof RuleMigrationResourceData>;
export const RuleMigrationResourceData = z.object({
  type: RuleMigrationResourceType,
  /**
   * The resource name identifier.
   */
  name: z.string(),
  /**
   * The resource content value.
   */
  content: z.string().optional(),
  /**
   * The resource arbitrary metadata.
   */
  metadata: z.object({}).optional(),
});

/**
 * The rule migration resource document object.
 */
export type RuleMigrationResource = z.infer<typeof RuleMigrationResource>;
export const RuleMigrationResource = RuleMigrationResourceData.merge(
  z.object({
    /**
     * The rule resource migration id
     */
    id: NonEmptyString,
    /**
     * The migration id
     */
    migration_id: NonEmptyString,
    /**
     * The moment of the last update
     */
    updated_at: z.string().optional(),
    /**
     * The user who last updated the resource
     */
    updated_by: z.string().optional(),
  })
);
