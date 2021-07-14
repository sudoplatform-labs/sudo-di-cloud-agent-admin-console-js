import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { WebDriver } from 'selenium-webdriver';
import {
  buildDriver,
  cleanupDrivers,
  combineCoverage,
  coverageReport,
} from './config';
import { CoverageMapData } from 'istanbul-lib-coverage';
import { env } from './config';

expect.extend({ toMatchImageSnapshot });

// increased default timeout to allow for slow running / complex tests
jest.setTimeout(120000);
export let driver: WebDriver;

beforeEach(async () => {
  jest.clearAllMocks();
  // Force to base page at start of each test.
  // NOTE : Do that once here and then NEVER in test cases
  // since it causes the browser to reset coverage maps.
  await driver.get(`${env.BASE_URL}/console`);
});

afterEach(async () => {
  const coverageData: CoverageMapData = await driver.executeScript(
    'return  (globalThis.__coverage__);',
  );
  combineCoverage(coverageData);
  // Delay each test to be visible.
  await new Promise((r) => setTimeout(r, 1000));
});

beforeAll(async () => {
  driver = await buildDriver();
});

// increased default timeout of 5 seconds to 15 seconds to allow for slow running tests
afterAll(async () => {
  await cleanupDrivers();
  coverageReport();
}, 15000);
