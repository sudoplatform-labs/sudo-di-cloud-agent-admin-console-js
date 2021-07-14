import { By, until } from 'selenium-webdriver';
import { e2eNavigateToCard, e2eWaitElementVisible } from './commonHelpers';
import { driver } from './setup-tests';

export const dcWaitDefault = 20000;

/**
 * Utility function to navigate to the connections card
 * and verify presence.
 */
export async function e2eNavigateToConnectionsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Connections'],
    'ConnectionsCard',
    'DIDComm Connections',
  );
}

/**
 * Utility function to create an invitation and return the URL.
 *
 * @param {!string} alias the human readable label to assign to this
 * invitation.
 * @return {string} The URL encoded invitation string used to accept an
 * invitation.
 */
export async function e2eCreateInvitation(alias: string): Promise<string> {
  await e2eNavigateToConnectionsCard();
  await (
    await e2eWaitElementVisible(
      By.css('#ConnectionsCard__create-btn > span'),
      dcWaitDefault,
    )
  ).click();

  await e2eWaitElementVisible(By.id('CreateInvitationForm'), dcWaitDefault);

  const aliasElement = await e2eWaitElementVisible(
    By.id('CreateInvitationForm_alias'),
    dcWaitDefault,
  );

  await driver
    .actions({ bridge: true })
    .pause(500)
    .move({ origin: aliasElement })
    .pause(500)
    .click()
    .pause(500)
    .sendKeys(alias)
    .perform();

  await (
    await e2eWaitElementVisible(
      By.css('#CreateInvitationForm__submit-btn > span'),
      dcWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(
        until.elementLocated(By.id('CreateInvitationForm')),
        dcWaitDefault,
      ),
    ),
    dcWaitDefault,
  );

  // Make sure the invitation is created and displayed in the
  // modal dialog
  const invitation = await e2eWaitElementVisible(
    By.xpath("//span[contains(.,'Invitation Details')]"),
    dcWaitDefault,
  );

  // Get the invitation text to return.
  const invitationText = await (
    await driver.wait(until.elementLocated(By.xpath('//pre')), dcWaitDefault)
  ).getText();

  // Clear the confirm dialog
  await (
    await e2eWaitElementVisible(
      By.xpath("//span[contains(.,'Ok')]"),
      dcWaitDefault,
    )
  ).click();

  // Make sure the dialog dissapears
  await driver.wait(until.stalenessOf(invitation), dcWaitDefault);

  // Check the invitation appears in the list
  await e2eWaitElementVisible(
    By.xpath(`//td[contains(.,'${alias}')]`),
    dcWaitDefault,
  );

  return invitationText;
}

/**
 * Utility function to accept an invitation
 *
 * @param {!string} alias the human readable label to assign to this
 * invitation.
 * @param {!string} invitation the encoded URL for the invitation being
 * accepted.
 */
export async function e2eAcceptInvitation(
  alias: string,
  invitation: string,
): Promise<void> {
  await e2eNavigateToConnectionsCard();

  // Input the invitation into the acceptance dialog
  await (
    await e2eWaitElementVisible(
      By.css('#ConnectionsCard__accept-btn > span'),
      dcWaitDefault,
    )
  ).click();

  await e2eWaitElementVisible(By.id('AcceptInvitationForm'), dcWaitDefault);

  const aliasElement = await e2eWaitElementVisible(
    By.id('AcceptInvitationForm_alias'),
    dcWaitDefault,
  );

  await driver.wait(until.elementIsEnabled(aliasElement), dcWaitDefault);
  await driver
    .actions({ bridge: true })
    .pause(500)
    .move({ origin: aliasElement })
    .pause(500)
    .click()
    .pause(500)
    .sendKeys(alias)
    .perform();

  const textElement = await e2eWaitElementVisible(
    By.id('AcceptInvitationForm_invitation'),
    dcWaitDefault,
  );
  await driver
    .actions({ bridge: true })
    .pause(500)
    .move({ origin: textElement })
    .pause(500)
    .click()
    .pause(500)
    .sendKeys(invitation)
    .perform();

  // Accept invitation and make sure review dialog displayed
  await (
    await e2eWaitElementVisible(
      By.css('#AcceptInvitationForm__submit-btn > span'),
      dcWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(
        until.elementLocated(By.id('AcceptInvitationForm')),
        dcWaitDefault,
      ),
    ),
    dcWaitDefault,
  );

  await e2eWaitElementVisible(
    By.xpath("//span[contains(.,'Invitation Details')]"),
    dcWaitDefault,
  );

  // Complete connection set up
  await (
    await e2eWaitElementVisible(
      By.css('.ant-modal-confirm-btns > .ant-btn-primary > span'),
      dcWaitDefault,
    )
  ).click();

  // Check the invitation appears in the list
  await e2eWaitElementVisible(
    By.xpath(`//td[contains(.,'${alias}')]`),
    dcWaitDefault,
  );
}
