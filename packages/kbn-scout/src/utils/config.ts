/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import path from 'path';
import * as Fs from 'fs';
import { ServerlessProjectType } from '@kbn/es';
import getopts from 'getopts';
import { ToolingLog } from '@kbn/tooling-log';
import { ScoutServerConfig } from '../types';
import { SCOUT_SERVERS_ROOT } from '../paths';

export const getProjectType = (kbnServerArgs: string[]) => {
  const options = getopts(kbnServerArgs);
  return options.serverless as ServerlessProjectType;
};

export const saveTestServersConfigOnDisk = (
  testServersConfig: ScoutServerConfig,
  log: ToolingLog
) => {
  const jsonData = JSON.stringify(testServersConfig, null, 2);
  // create temp directory to store test servers confugration
  if (!Fs.existsSync(SCOUT_SERVERS_ROOT)) {
    log.debug(`scout: creating new config directory: ${SCOUT_SERVERS_ROOT}`);
    Fs.mkdirSync(SCOUT_SERVERS_ROOT, { recursive: true });
  }

  const serversConfigPath = path.join(SCOUT_SERVERS_ROOT, `local.json`);
  // saving file with local servers configuration
  Fs.writeFileSync(serversConfigPath, jsonData, 'utf-8');
  log.info(`scout: test configuration was saved to ${serversConfigPath}`);
};
