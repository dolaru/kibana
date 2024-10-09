/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { ClusterPutComponentTemplateRequest } from '@elastic/elasticsearch/lib/api/types';
import {
  buildkiteProperties,
  testRunProperties,
  suiteProperties,
  testProperties,
} from './mappings';

export const buildkiteMappings: ClusterPutComponentTemplateRequest = {
  name: 'scout-test-event.mappings.buildkite',
  template: {
    mappings: {
      properties: {
        buildkite: {
          type: 'object',
          properties: buildkiteProperties,
        },
      },
    },
  },
};

export const testRunMappings: ClusterPutComponentTemplateRequest = {
  name: 'scout-test-event.mappings.test-run',
  template: {
    mappings: {
      properties: {
        test_run: {
          type: 'object',
          properties: testRunProperties,
        },
      },
    },
  },
};

export const suiteMappings: ClusterPutComponentTemplateRequest = {
  name: 'scout-test-event.mappings.suite',
  template: {
    mappings: {
      properties: {
        suite: {
          type: 'object',
          properties: suiteProperties,
        },
      },
    },
  },
};

export const testMappings: ClusterPutComponentTemplateRequest = {
  name: 'scout-test-event.mappings.test',
  template: {
    mappings: {
      properties: {
        test: {
          type: 'object',
          properties: testProperties,
        },
      },
    },
  },
};
