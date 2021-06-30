import { By, until } from 'selenium-webdriver';
import { e2eHoverOverCardInfoIcon } from './commonHelpers';
import {
  createPrivateDID,
  didWaitDefault,
  e2eNavigateToDIDCard,
} from './decentralizedIdentifiersHelpers';
import { driver } from './setup-tests';

describe('Decentralized Identifiers', function () {
  it('DI-0001 Navigate and render decentralized identifiers page', async () => {
    await e2eNavigateToDIDCard();
  });

  it('DI-0005 Hover over pop-up icon and check displays info', async function () {
    await e2eNavigateToDIDCard();
    await e2eHoverOverCardInfoIcon('DecentralizedIdentifiersCard');
  });

  it('DI-0010 Initiate private did creation then cancel dialog', async function () {
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
    // Cancel create dialog
    await driver
      .findElement(
        By.css('#DecentralizedIdentifiersCard__create-cancel-btn > span'),
      )
      .click();
    // Make sure the dialog dissapears
    await driver.wait(
      until.stalenessOf(
        await driver.findElement(By.css('.ant-modal-confirm-title')),
      ),
      didWaitDefault,
    );
  });

  it('DI-0102 Create private DID', async function () {
    // Use common routine to create DID
    await createPrivateDID();
  });

  it('DI-0103 Write private DID to Ledger', async function () {
    // We make sure there is at least one writeable DID since we don't know what order tests will be run in
    await createPrivateDID();
    // Use the side nav to get to the DID tab
    await driver
      .wait(
        until.elementLocated(By.linkText('Decentralized Identifiers')),
        didWaitDefault,
      )
      .click();
    // Locate an unwritten DID row in the table and activate write to ledger dialog
    await driver
      .wait(
        until.elementLocated(By.xpath("//span[contains(.,'Write to Ledger')]")),
        didWaitDefault,
      )
      .click();
    // NOTE: Need a way to verify that the written row changes button to non-selectable
    //       and text to indicate written
  });
});
