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

import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { AppExQAReport, AppExQAReportEventAction } from './appex_qa';

/**
 * Configuration options for the AppEx QA Playwright reporter
 */
export interface AppExQAReporterOptions {
  outputPath?: string;
}

/**
 * AppEx QA Playwright reporter
 */
export class AppExQAPlaywrightReporter implements Reporter {
  private reporterOptions: AppExQAReporterOptions;
  private report: AppExQAReport;

  constructor(options: AppExQAReporterOptions) {
    this.reporterOptions = options;
    this.report = new AppExQAReport();
  }

  /**
   * Root path of this reporter's output
   */
  public get reportRootPath(): string {
    const outputPath = this.reporterOptions.outputPath || '.';
    return path.join(outputPath, 'appex-qa');
  }

  getIdForTestCase(test: TestCase): string {
    return createHash('md5').update(test.titlePath().join(' ')).digest('hex');
  }

  printsToStdio(): boolean {
    return true;
  }

  onBegin(config: FullConfig, suite: Suite) {
    this.report.logEvent({
      event: {
        action: AppExQAReportEventAction.RUN_BEGIN,
      },
    });
  }

  onTestBegin(test: TestCase, result: TestResult) {
    this.report.logEvent({
      '@timestamp': result.startTime,
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: this.getIdForTestCase(test),
        title: test.title,
        tags: test.tags,
        annotations: test.annotations,
        expected_status: test.expectedStatus,
      },
      event: {
        action: AppExQAReportEventAction.TEST_BEGIN,
      },
    });
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    this.report.logEvent({
      '@timestamp': step.startTime,
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: this.getIdForTestCase(test),
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
        action: AppExQAReportEventAction.TEST_STEP_BEGIN,
      },
    });
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    this.report.logEvent({
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: this.getIdForTestCase(test),
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
        action: AppExQAReportEventAction.TEST_STEP_END,
        error: {
          message: step.error?.message,
          stack_trace: step.error?.stack,
        },
      },
    });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.report.logEvent({
      suite: {
        title: test.parent.titlePath().join(' '),
        type: test.parent.type,
      },
      test: {
        id: this.getIdForTestCase(test),
        title: test.title,
        tags: test.tags,
        annotations: test.annotations,
        expected_status: test.expectedStatus,
        status: result.status,
        duration: result.duration,
      },
      event: {
        action: AppExQAReportEventAction.TEST_END,
        error: {
          message: result.error?.message,
          stack_trace: result.error?.stack,
        },
      },
    });
  }

  onEnd(result: FullResult) {
    this.report.logEvent({
      test_run: {
        status: result.status,
        duration: result.duration,
      },
      event: {
        action: AppExQAReportEventAction.RUN_END,
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
      event: {
        action: AppExQAReportEventAction.ERROR,
        error: {
          message: error.message,
          stack_trace: error.stack,
        },
      },
    });
  }
}

// eslint-disable-next-line import/no-default-export
export default AppExQAPlaywrightReporter;
