/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

// eslint-disable-next-line max-classes-per-file
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { ToolingLog } from '@kbn/tooling-log';

/**
 * AppEx QA Playwright reporter event type
 */
export enum AppExQAReportEventAction {
  RUN_BEGIN = 'run-begin',
  RUN_END = 'run-end',
  TEST_BEGIN = 'test-begin',
  TEST_END = 'test-end',
  TEST_STEP_BEGIN = 'test-step-begin',
  TEST_STEP_END = 'test-step-end',
  ERROR = 'error',
}

/**
 * Document that records an event to be logged by the AppEx QA Playwright reporter
 */
export interface AppExQAReportEvent {
  '@timestamp'?: Date;
  event: {
    action: AppExQAReportEventAction;
    outcome?: ['failure', 'success', 'unknown'];
    error?: {
      message?: string;
      id?: string;
      code?: string;
      stack_trace?: string;
      type?: string;
    };
  };
  labels?: { [id: string]: any };
  test_run?: {
    status: string;
    duration: number;
  };
  suite?: {
    title: string;
    type: string;
  };
  test?: {
    id: string;
    title: string;
    tags: string[];
    annotations?: Array<{
      type: string;
      description?: string;
    }>;
    expected_status?: string;
    duration?: number;
    status?: string;
    step?: {
      title: string;
      category?: string;
      duration?: number;
    };
  };
}

/**
 * Generic error raised by an AppEx QA report
 */
export class AppExQAReportError extends Error {}

/**
 *
 */
export class AppExQAReport {
  logger: ToolingLog;
  workDir: string;
  concluded = false;
  events: AppExQAReportEvent[];

  constructor(logger?: ToolingLog) {
    this.logger =
      logger ||
      new ToolingLog({
        level: 'info',
        writeTo: process.stdout,
      });
    this.events = [];
    this.workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'appex-qa-report-'));
  }

  public get eventLogPath(): string {
    return path.join(this.workDir, 'event-log.ndjson');
  }

  private raiseIfConcluded(additionalInfo?: string) {
    if (this.concluded) {
      let message = `Report at ${this.workDir} was concluded`;

      if (additionalInfo) {
        message += `: ${additionalInfo}`;
      }

      throw new AppExQAReportError(message);
    }
  }

  /**
   * Logs an event to be processed by this reporter
   *
   * @param event {AppExQAReportEvent} - Event to record
   */
  logEvent(event: AppExQAReportEvent) {
    this.raiseIfConcluded('logging new events is no longer allowed');

    if (event['@timestamp'] === undefined) {
      event['@timestamp'] = new Date();
    }

    this.events.push(event);
    fs.appendFileSync(this.eventLogPath, JSON.stringify(event) + '\n');
  }

  /**
   * Save the report to a non-ephemeral location
   *
   * @param destination - Full path to the save location. Must not exist.
   */
  save(destination: string) {
    this.raiseIfConcluded('nothing to save because workdir has been cleared');

    if (fs.existsSync(destination)) {
      throw new AppExQAReportError(`Save destination path '${destination}' already exists`);
    }

    // Create the destination directory
    this.logger.info(`Saving AppEx QA report to ${destination}`);
    fs.mkdirSync(destination, { recursive: true });

    // Copy the workdir data to the destination
    fs.cpSync(this.workDir, destination, { recursive: true });
  }

  /**
   * Call this when you're done adding information to this report.
   *
   * ⚠️**This will delete all the contents of the report's working directory**
   */
  conclude() {
    // Remove the working directory
    this.logger.info(`Removing AppEx QA report working directory ${this.workDir}`);
    fs.rmSync(this.workDir, { recursive: true, force: true });

    // Mark this report as concluded
    this.concluded = true;
    this.logger.success('AppEx QA report has concluded.');
  }
}
