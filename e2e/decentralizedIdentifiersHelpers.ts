import { By, until } from 'selenium-webdriver';
import { e2eNavigateToCard } from './commonHelpers';
import { driver } from './setup-tests';

export const didWaitDefault = 20000;

/** 
 * Utility function to navigate to the Decenteralized Identifiers card
 * and verify presence.
 */
export async function e2eNavigateToDIDCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Decentralized Identifiers'],
    'DecentralizedIdentifiersCard',
    'My Decentralized Identifiers',
  );
}

/**
 * Utility function to create a private DID that can be used
 * by other tests.
 */
export async function createPrivateDID(): Promise<void> {
  await e2eNavigateToDIDCard();
  // Activate the create DID dialog button
  await driver
    .findElement(By.css('#DecentralizedIdentifiersCard__create-btn > span'))
    .click();
  // Make sure the dialog appears
  await driver.wait(
    until.elementIsVisible(
      await driver.findElement(By.css('.ant-modal-confirm-title')),
    ),
    didWaitDefault,
  );
  // Initiate the create
  await driver
    .findElement(By.css('#DecentralizedIdentifiersCard__create-ok-btn > span'))
    .click();
  // Make sure the dialog completes.
  // NOTE: Need mechanism to check table gets an extra DID
  await driver.wait(
    until.stalenessOf(
      await driver.findElement(By.css('.ant-modal-confirm-title')),
    ),
    didWaitDefault,
  );
}
