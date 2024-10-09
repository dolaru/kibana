/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
  TestStep,
} from '@playwright/test/reporter';

import path from 'node:path';
import { ToolingLog } from '@kbn/tooling-log';
import { generateTestRunId, getTestIDForTitle, ScoutReport, ScoutReportEventAction } from '.';
import { environmentMetadata } from '../datasources';
import { SCOUT_REPORT_OUTPUT_ROOT } from '../..';

/**
 * Configuration options for the Scout Playwright reporter
 */
export interface ScoutPlaywrightReporterOptions {
  outputPath?: string;
}

/**
 * Scout Playwright reporter
 */
export class ScoutPlaywrightReporter implements Reporter {
  readonly log: ToolingLog;
  readonly runId: string;
  private report: ScoutReport;

  constructor(private reporterOptions: ScoutPlaywrightReporterOptions = {}) {
    this.log = new ToolingLog({
      level: 'info',
      writeTo: process.stdout,
    });

    this.runId = generateTestRunId();
    this.log.info(`Scout test run ID: ${this.runId}`);

    this.report = new ScoutReport(this.log);
  }

  /**
   * Root path of this reporter's output
   */
  public get reportRootPath(): string {
    const outputPath = this.reporterOptions.outputPath || SCOUT_REPORT_OUTPUT_ROOT;
    return path.join(outputPath, `scout-${this.runId}`);
  }

  printsToStdio(): boolean {
    return true;
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.report.logEvent({
      ...environmentMetadata,
      test_run: {
        id: this.runId,
      },
      event: {
        action: ScoutReportEventAction.RUN_BEGIN,
      },
    });
  }

  onTestBegin(test: TestCase, result: TestResult) {
    this.report.logEvent({
      '@timestamp': result.startTime,
      ...environmentMetadata,
      test_run: {
        id: this.runId,
      },
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: getTestIDForTitle(test.titlePath().join(' ')),
        title: test.title,
        tags: test.tags,
        annotations: test.annotations,
        expected_status: test.expectedStatus,
      },
      event: {
        action: ScoutReportEventAction.TEST_BEGIN,
      },
    });
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    this.report.logEvent({
      '@timestamp': step.startTime,
      ...environmentMetadata,
      test_run: {
        id: this.runId,
      },
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: getTestIDForTitle(test.titlePath().join(' ')),
        title: test.title,
        tags: test.tags,
        annotations: test.annotations,
        expected_status: test.expectedStatus,
        step: {
          title: step.titlePath().join(' '),
          category: step.category,
        },
      },
      event: {
        action: ScoutReportEventAction.TEST_STEP_BEGIN,
      },
    });
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    this.report.logEvent({
      ...environmentMetadata,
      test_run: {
        id: this.runId,
      },
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: getTestIDForTitle(test.titlePath().join(' ')),
        title: test.title,
        tags: test.tags,
        annotations: test.annotations,
        expected_status: test.expectedStatus,
        step: {
          title: step.titlePath().join(' '),
          category: step.category,
          duration: step.duration,
        },
      },
      event: {
        action: ScoutReportEventAction.TEST_STEP_END,
        error: {
          message: step.error?.message,
          stack_trace: step.error?.stack,
        },
      },
    });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.report.logEvent({
      ...environmentMetadata,
      test_run: {
        id: this.runId,
      },
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: getTestIDForTitle(test.titlePath().join(' ')),
        title: test.title,
        tags: test.tags,
        annotations: test.annotations,
        expected_status: test.expectedStatus,
        status: result.status,
        duration: result.duration,
      },
      event: {
        action: ScoutReportEventAction.TEST_END,
        error: {
          message: result.error?.message,
          stack_trace: result.error?.stack,
        },
      },
    });
  }

  onEnd(result: FullResult) {
    this.report.logEvent({
      ...environmentMetadata,
      test_run: {
        id: this.runId,
        status: result.status,
        duration: result.duration,
      },
      event: {
        action: ScoutReportEventAction.RUN_END,
      },
    });

    // Save & conclude the report
    try {
      this.report.save(this.reportRootPath);
    } finally {
      this.report.conclude();
    }
  }

  async onExit() {
    // noop
  }

  onError(error: TestError) {
    this.report.logEvent({
      ...environmentMetadata,
      test_run: {
        id: this.runId,
      },
      event: {
        action: ScoutReportEventAction.ERROR,
        error: {
          message: error.message,
          stack_trace: error.stack,
        },
      },
    });
  }
}

// eslint-disable-next-line import/no-default-export
export default ScoutPlaywrightReporter;
