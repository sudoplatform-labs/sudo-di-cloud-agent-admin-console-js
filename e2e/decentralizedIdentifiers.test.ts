import { By, until } from 'selenium-webdriver';
import {
  e2eAcceptTAAForm,
  e2eCancelTAAForm,
  e2eCheckMessageDisplays,
  e2eHoverOverCardInfoIcon,
  e2eWaitElementVisible,
} from './commonHelpers';
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
    await (
      await e2eWaitElementVisible(
        By.css('#DecentralizedIdentifiersCard__create-btn > span'),
        didWaitDefault,
      )
    ).click();

    // Make sure the dialog appears
    await e2eWaitElementVisible(
      By.css('.ant-modal-confirm-title'),
      didWaitDefault,
    );
    // Cancel create dialog
    await (
      await e2eWaitElementVisible(
        By.css('#DecentralizedIdentifiersCard__create-cancel-btn > span'),
        didWaitDefault,
      )
    ).click();

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
    // Locate an unwritten DID row in the table and activate write to ledger dialog
    await (
      await e2eWaitElementVisible(
        By.xpath("//span[contains(.,'Write to Ledger')]"),
        didWaitDefault,
      )
    ).click();

    await e2eCancelTAAForm(didWaitDefault);

    // Locate an unwritten DID row in the table and activate write to ledger dialog
    await (
      await e2eWaitElementVisible(
        By.xpath("//span[contains(.,'Write to Ledger')]"),
        didWaitDefault,
      )
    ).click();

    await e2eAcceptTAAForm(didWaitDefault);

    // Check we get a success message
    await e2eCheckMessageDisplays(
      'Decentralized Identifier written to public ledger',
      didWaitDefault,
    );
  });
});
