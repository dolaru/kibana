/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { Command } from '@kbn/dev-cli-runner';
import { initLogsDir } from '@kbn/test/src/functional_tests/lib';

import { startServers, parseFlags, FLAG_OPTIONS } from '../servers';

/**
 * Start servers
 */
export const startServer: Command<void> = {
  name: 'start-server',
  description: 'Start a Kibana instance for testing purposes',
  flags: FLAG_OPTIONS,
  run: async ({ flagsReader, log }) => {
    const options = parseFlags(flagsReader);

    if (options.logsDir) {
      initLogsDir(log, options.logsDir);
    }

    await startServers(log, options);
  },
};
