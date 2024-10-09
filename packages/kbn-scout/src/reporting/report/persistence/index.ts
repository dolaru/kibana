/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { ToolingLog } from '@kbn/tooling-log';
import { Client as ESClient } from '@elastic/elasticsearch';
import { ScoutReportEvent } from '../event';
import * as componentTemplates from './component_templates';
import * as indexTemplates from './index_templates';

export const dataStreamName = 'scout-test-events-kibana';

export class ScoutReportDataStream {
  private log: ToolingLog;

  constructor(private es: ESClient, log?: ToolingLog) {
    this.log = log || new ToolingLog();
  }

  async exists() {
    return await this.es.indices.exists({ index: dataStreamName });
  }

  async createIfMissing() {
    await this.setupComponentTemplates();
    await this.setupIndexTemplate();

    if (await this.exists()) {
      return;
    }

    this.log.info(`Creating data stream '${dataStreamName}'`);
    await this.es.indices.createDataStream({
      name: dataStreamName,
    });
  }

  async setupComponentTemplates() {
    for (const template of [
      componentTemplates.buildkiteMappings,
      componentTemplates.testRunMappings,
      componentTemplates.suiteMappings,
      componentTemplates.testMappings,
    ]) {
      if (await this.es.cluster.existsComponentTemplate({ name: template.name })) {
        return;
      }

      this.log.info(`Creating component template '${template.name}'`);
      await this.es.cluster.putComponentTemplate(template);
    }
  }

  async setupIndexTemplate() {
    if (await this.es.indices.existsIndexTemplate({ name: indexTemplates.testEvents.name })) {
      return;
    }

    this.log.info(`Creating index template '${indexTemplates.testEvents.name}'`);
    await this.es.indices.putIndexTemplate(indexTemplates.testEvents);
  }

  async addEvent(event: ScoutReportEvent) {
    await this.es.index({ index: dataStreamName, document: event });
  }

  async addEventsFromFile(eventLogPath: string) {
    // Make the given event log path absolute
    eventLogPath = path.resolve(eventLogPath);

    const events = async function* () {
      const lineReader = readline.createInterface({
        input: fs.createReadStream(eventLogPath),
        crlfDelay: Infinity,
      });

      for await (const line of lineReader) {
        yield line;
      }
    };

    this.log.info(`Uploading events from file ${eventLogPath} to data stream '${dataStreamName}'`);

    const stats = await this.es.helpers.bulk({
      datasource: events(),
      onDocument: () => {
        return { create: { _index: dataStreamName } };
      },
    });

    this.log.info(`Uploaded ${stats.total} events in ${stats.time / 1000}s.`);

    if (stats.failed > 0) {
      this.log.warning(`Failed to upload ${stats.failed} events`);
    }
  }
}
