/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AnalyticsServiceSetup, RootSchema } from '@kbn/core/public';
import type { SecurityCellActionMetadata } from '../../../app/actions/types';
import type { ML_JOB_TELEMETRY_STATUS, TelemetryEventTypes } from './constants';
import type {
  AlertsGroupingTelemetryEvent,
  ReportAlertsGroupingChangedParams,
  ReportAlertsGroupingTelemetryEventParams,
  ReportAlertsGroupingToggledParams,
  ReportAlertsTakeActionParams,
} from './events/alerts_grouping/types';
import type {
  ReportDataQualityCheckAllCompletedParams,
  ReportDataQualityIndexCheckedParams,
  DataQualityTelemetryEvents,
} from './events/data_quality/types';
import type {
  EntityAnalyticsTelemetryEvent,
  ReportAddRiskInputToTimelineClickedParams,
  ReportEntityAlertsClickedParams,
  ReportEntityAnalyticsTelemetryEventParams,
  ReportEntityDetailsClickedParams,
  ReportEntityRiskFilteredParams,
  ReportRiskInputsExpandedFlyoutOpenedParams,
  ReportToggleRiskSummaryClickedParams,
  ReportAssetCriticalityCsvPreviewGeneratedParams,
  ReportAssetCriticalityFileSelectedParams,
  ReportAssetCriticalityCsvImportedParams,
  ReportEntityStoreEnablementParams,
  ReportEntityStoreInitParams,
} from './events/entity_analytics/types';
import type {
  AssistantTelemetryEvent,
  ReportAssistantTelemetryEventParams,
  ReportAssistantInvokedParams,
  ReportAssistantQuickPromptParams,
  ReportAssistantMessageSentParams,
  ReportAssistantSettingToggledParams,
} from './events/ai_assistant/types';
import type {
  DocumentDetailsTelemetryEvents,
  ReportDocumentDetailsTelemetryEventParams,
  ReportDetailsFlyoutOpenedParams,
  ReportDetailsFlyoutTabClickedParams,
} from './events/document_details/types';
import type {
  OnboardingHubStepFinishedParams,
  OnboardingHubStepLinkClickedParams,
  OnboardingHubStepOpenParams,
  OnboardingHubTelemetryEvent,
} from './events/onboarding/types';
import type {
  ManualRuleRunTelemetryEvent,
  ReportManualRuleRunOpenModalParams,
  ReportManualRuleRunExecuteParams,
  ReportManualRuleRunCancelJobParams,
  ReportManualRuleRunTelemetryEventParams,
} from './events/manual_rule_run/types';
import type {
  EventLogTelemetryEvent,
  ReportEventLogFilterByRunTypeParams,
  ReportEventLogShowSourceEventDateRangeParams,
  ReportEventLogTelemetryEventParams,
} from './events/event_log/types';
import type {
  AddNoteFromExpandableFlyoutClickedParams,
  NotesTelemetryEventParams,
  NotesTelemetryEvents,
  OpenNoteInExpandableFlyoutClickedParams,
} from './events/notes/types';
import type { PreviewRuleParams, PreviewRuleTelemetryEvent } from './events/preview_rule/types';

export * from './events/ai_assistant/types';
export * from './events/alerts_grouping/types';
export * from './events/data_quality/types';
export * from './events/onboarding/types';
export * from './events/entity_analytics/types';
export * from './events/document_details/types';
export * from './events/manual_rule_run/types';
export * from './events/event_log/types';
export * from './events/preview_rule/types';

export interface TelemetryServiceSetupParams {
  analytics: AnalyticsServiceSetup;
}

export interface ReportMLJobUpdateParams {
  jobId: string;
  isElasticJob: boolean;
  status: ML_JOB_TELEMETRY_STATUS;
  moduleId?: string;
  errorMessage?: string;
}

export interface ReportCellActionClickedParams {
  metadata: SecurityCellActionMetadata | undefined;
  displayName: string;
  actionId: string;
  fieldName: string;
}

export interface ReportAnomaliesCountClickedParams {
  jobId: string;
  count: number;
}

export interface ReportBreadcrumbClickedParams {
  title: string;
}

export type TelemetryEventParams =
  | ReportAlertsGroupingTelemetryEventParams
  | ReportAssistantTelemetryEventParams
  | ReportEntityAnalyticsTelemetryEventParams
  | ReportMLJobUpdateParams
  | ReportCellActionClickedParams
  | ReportAnomaliesCountClickedParams
  | ReportDataQualityIndexCheckedParams
  | ReportDataQualityCheckAllCompletedParams
  | ReportBreadcrumbClickedParams
  | ReportDocumentDetailsTelemetryEventParams
  | OnboardingHubStepOpenParams
  | OnboardingHubStepFinishedParams
  | OnboardingHubStepLinkClickedParams
  | ReportManualRuleRunTelemetryEventParams
  | ReportEventLogTelemetryEventParams
  | PreviewRuleParams
  | NotesTelemetryEventParams;

export interface TelemetryClientStart {
  reportAlertsGroupingChanged(params: ReportAlertsGroupingChangedParams): void;
  reportAlertsGroupingToggled(params: ReportAlertsGroupingToggledParams): void;
  reportAlertsGroupingTakeAction(params: ReportAlertsTakeActionParams): void;

  // Assistant
  reportAssistantInvoked(params: ReportAssistantInvokedParams): void;
  reportAssistantMessageSent(params: ReportAssistantMessageSentParams): void;
  reportAssistantQuickPrompt(params: ReportAssistantQuickPromptParams): void;
  reportAssistantSettingToggled(params: ReportAssistantSettingToggledParams): void;

  // Entity Analytics
  reportEntityDetailsClicked(params: ReportEntityDetailsClickedParams): void;
  reportEntityAlertsClicked(params: ReportEntityAlertsClickedParams): void;
  reportEntityRiskFiltered(params: ReportEntityRiskFilteredParams): void;
  reportMLJobUpdate(params: ReportMLJobUpdateParams): void;
  // Entity Analytics inside Entity Flyout
  reportToggleRiskSummaryClicked(params: ReportToggleRiskSummaryClickedParams): void;
  reportRiskInputsExpandedFlyoutOpened(params: ReportRiskInputsExpandedFlyoutOpenedParams): void;
  reportAddRiskInputToTimelineClicked(params: ReportAddRiskInputToTimelineClickedParams): void;
  // Entity Analytics Asset Criticality
  reportAssetCriticalityFileSelected(params: ReportAssetCriticalityFileSelectedParams): void;
  reportAssetCriticalityCsvPreviewGenerated(
    params: ReportAssetCriticalityCsvPreviewGeneratedParams
  ): void;
  reportAssetCriticalityCsvImported(params: ReportAssetCriticalityCsvImportedParams): void;
  reportCellActionClicked(params: ReportCellActionClickedParams): void;
  // Entity Analytics Entity Store
  reportEntityStoreEnablement(params: ReportEntityStoreEnablementParams): void;
  reportEntityStoreInit(params: ReportEntityStoreInitParams): void;

  reportAnomaliesCountClicked(params: ReportAnomaliesCountClickedParams): void;
  reportDataQualityIndexChecked(params: ReportDataQualityIndexCheckedParams): void;
  reportDataQualityCheckAllCompleted(params: ReportDataQualityCheckAllCompletedParams): void;
  reportBreadcrumbClicked(params: ReportBreadcrumbClickedParams): void;

  // document details flyout
  reportDetailsFlyoutOpened(params: ReportDetailsFlyoutOpenedParams): void;
  reportDetailsFlyoutTabClicked(params: ReportDetailsFlyoutTabClickedParams): void;

  // onboarding hub
  reportOnboardingHubStepOpen(params: OnboardingHubStepOpenParams): void;
  reportOnboardingHubStepFinished(params: OnboardingHubStepFinishedParams): void;
  reportOnboardingHubStepLinkClicked(params: OnboardingHubStepLinkClickedParams): void;

  // manual rule run
  reportManualRuleRunOpenModal(params: ReportManualRuleRunOpenModalParams): void;
  reportManualRuleRunExecute(params: ReportManualRuleRunExecuteParams): void;
  reportManualRuleRunCancelJob(params: ReportManualRuleRunCancelJobParams): void;

  // event log
  reportEventLogFilterByRunType(params: ReportEventLogFilterByRunTypeParams): void;
  reportEventLogShowSourceEventDateRange(
    params: ReportEventLogShowSourceEventDateRangeParams
  ): void;

  // new notes
  reportOpenNoteInExpandableFlyoutClicked(params: OpenNoteInExpandableFlyoutClickedParams): void;
  reportAddNoteFromExpandableFlyoutClicked(params: AddNoteFromExpandableFlyoutClickedParams): void;

  // preview rule
  reportPreviewRule(params: PreviewRuleParams): void;
}

export type TelemetryEvent =
  | AssistantTelemetryEvent
  | AlertsGroupingTelemetryEvent
  | EntityAnalyticsTelemetryEvent
  | DataQualityTelemetryEvents
  | DocumentDetailsTelemetryEvents
  | {
      eventType: TelemetryEventTypes.MLJobUpdate;
      schema: RootSchema<ReportMLJobUpdateParams>;
    }
  | {
      eventType: TelemetryEventTypes.CellActionClicked;
      schema: RootSchema<ReportCellActionClickedParams>;
    }
  | {
      eventType: TelemetryEventTypes.AnomaliesCountClicked;
      schema: RootSchema<ReportAnomaliesCountClickedParams>;
    }
  | {
      eventType: TelemetryEventTypes.BreadcrumbClicked;
      schema: RootSchema<ReportBreadcrumbClickedParams>;
    }
  | OnboardingHubTelemetryEvent
  | ManualRuleRunTelemetryEvent
  | EventLogTelemetryEvent
  | PreviewRuleTelemetryEvent
  | NotesTelemetryEvents;
