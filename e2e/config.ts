import { WebDriver, Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import chrome from 'selenium-webdriver/chrome';
import {
  createCoverageMap,
  CoverageMap,
  CoverageMapData,
} from 'istanbul-lib-coverage';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export const env = {
  // The browser server accesses the admin console on the
  // internal docker-compose frontend network since it is running
  // inside the docker network context. So we can use a docker-compose
  // assigned name and the internal port value.
  BASE_URL: process.env['TEST_BASE_URL'] ?? 'http://admin-webserver:80',
  BROWSER: process.env['BROWSER_TYPE'] ?? 'chrome',
  // The browser server is accessed from scripts running
  // outside the docker network context on a mapped port.
  BROWSER_SERVER:
    process.env['BROWSER_SERVER_URL'] ?? 'http://localhost:4445/wd/hub',
  HEADLESS: process.env['HEADLESS_BROWSER'] ?? 'false',
};

const driversToCleanUp: WebDriver[] = [];

// Set up some coverage infrastructure to capture
// coverage on each test case since browsers will
// destroy this information on any URL change.
let coverageMap: CoverageMap = createCoverageMap();
const outputFolder = '.nyc_output';
const nycFilename = join(outputFolder, 'out.json');

if (!existsSync(outputFolder)) {
  mkdirSync(outputFolder);
  console.log('created folder %s for output coverage', outputFolder);
} else {
  // Assume that whatever is in the current output dir needs to be
  // merged
  const existingCoverage = JSON.parse(readFileSync(nycFilename).toString());
  combineCoverage(existingCoverage);
}

require('chromedriver');
require('geckodriver');

/** Configures a new WebDriver for e2e testing */
export async function buildDriver(): Promise<WebDriver> {
  try {
    const driver = await new Builder()
      .usingServer(env.BROWSER_SERVER)
      .forBrowser(env.BROWSER)
      .setFirefoxOptions(setCommonOptions(new firefox.Options()))
      .setChromeOptions(setCommonOptions(new chrome.Options()))
      .build();

    driversToCleanUp.push(driver);
    return driver;
  } catch (error) {
    console.log(`ERROR CREATING WebDriver : ${error}`);
    throw error;
  }
}

function setCommonOptions<T extends firefox.Options | chrome.Options>(
  options: T,
): T {
  options.windowSize({ width: 1600, height: 1200 });

  if (env.HEADLESS == 'true') {
    options.headless();
  }

  return options;
}

/** Cleans up all drivers created by this process */
export async function cleanupDrivers(): Promise<void> {
  await Promise.all(
    driversToCleanUp.map(async (driver) => {
      driver.quit();
    }),
  );
}

/**
 * Clear the current coverage figures completely
 */
export function resetCoverage(): void {
  coverageMap = createCoverageMap({});
}

/**
 * Combine coverage information from single test
 * with previously collected coverage.
 */
export function combineCoverage(coverage: CoverageMap | CoverageMapData): void {
  coverageMap.merge(coverage);
}

/**
 * Save coverage information as a JSON file
 */
export function coverageReport(): void {
  writeFileSync(nycFilename, JSON.stringify(coverageMap, null, 2));
}
