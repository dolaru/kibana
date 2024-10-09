/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { subj } from '@kbn/test-subj-selector';
import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { DiscoverApp, DatePicker } from '../page_objects';

test.describe('Discover app - value suggestions', () => {
  test.beforeAll(async ({ esArchiver, kbnClient }) => {
    await esArchiver.loadIfNeeded('x-pack/test/functional/es_archives/logstash_functional');
    await kbnClient.importExport.load(
      'x-pack/test/functional/fixtures/kbn_archiver/dashboard_drilldowns/drilldowns'
    );
    await kbnClient.uiSettings.update({
      'doc_table:legacy': false,
    });
  });

  test.afterAll(async ({ esArchiver, kbnClient }) => {
    await esArchiver.unload('x-pack/test/functional/es_archives/logstash_functional');
    await kbnClient.uiSettings.unset('doc_table:legacy');
    await kbnClient.savedObjects.cleanStandardList();
  });

  test.beforeEach(async ({ page, kbnUrl, browserAuth }) => {
    await browserAuth.loginAs('editor');
    await new DiscoverApp(page, kbnUrl).goto();
  });

  test("don't show up if outside of range", async ({ page }) => {
    // Set time picker range
    await new DatePicker(page).setAbsoluteRange(
      /* from */ 'Mar 1, 2020 @ 00:00:00.000',
      /* to */ 'Nov 1, 2020 @ 00:00:00.000'
    );

    // Input partial query
    await page.locator(subj('queryInput')).fill('extension.raw: ');

    // Check suggestions
    await expect(page.locator(subj('autoCompleteSuggestionText'))).toHaveCount(0);
  });

  test('show up if in range', async ({ page }) => {
    // Set time picker range
    await new DatePicker(page).setAbsoluteRange(
      /* from */ 'Sep 19, 2015 @ 06:31:44.000',
      /* to */ 'Sep 23, 2015 @ 18:31:44.000'
    );

    // Input partial query
    await page.locator(subj('queryInput')).fill('extension.raw: ');

    // Check suggestions
    const suggestions = page.locator(subj('autoCompleteSuggestionText'));
    await expect(suggestions).toHaveText(['"css"', '"gif"', '"jpg"', '"php"', '"png"']);
  });
});
