import { By, until } from 'selenium-webdriver';
import { e2eNavigateToCard } from './commonHelpers';
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
  e2eNavigateToConnectionsCard();
  await driver
    .wait(
      until.elementLocated(By.css('#ConnectionsCard__create-btn > span')),
      dcWaitDefault,
    )
    .click();

  await driver.wait(
    until.elementIsVisible(
      await driver.wait(
        until.elementLocated(By.id('CreateInvitationForm')),
        dcWaitDefault,
      ),
    ),
    dcWaitDefault,
  );
  await driver
    .wait(
      until.elementLocated(By.css('#CreateInvitationForm #myAlias')),
      dcWaitDefault,
    )
    .click();
  await driver
    .wait(
      until.elementLocated(By.css('#CreateInvitationForm #myAlias')),
      dcWaitDefault,
    )
    .sendKeys(alias);
  await driver
    .wait(
      until.elementLocated(By.css('#CreateInvitationForm__submit-btn > span')),
      dcWaitDefault,
    )
    .click();

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
  await driver.wait(
    until.elementIsVisible(
      await driver.wait(
        until.elementLocated(
          By.xpath("//span[contains(.,'Invitation Details')]"),
        ),
        dcWaitDefault,
      ),
    ),
    dcWaitDefault,
  );

  // Get the invitation text to return.
  const invitationText = await driver
    .wait(until.elementLocated(By.xpath('//pre')), dcWaitDefault)
    .getText();

  // Clear the confirm dialog
  await driver
    .wait(
      until.elementLocated(By.xpath("//span[contains(.,'Ok')]")),
      dcWaitDefault,
    )
    .click();

  // Make sure the dialog dissapears
  {
    await new Promise((r) => setTimeout(r, 3000));
    const elements = await driver.findElements(
      By.xpath("//span[contains(.,'Invitation Details')]"),
    );
    expect(elements.length).toBeFalsy();
  }

  // Check the invitation appears in the list
  await driver.wait(
    until.elementLocated(By.xpath(`//td[contains(.,'${alias}')]`)),
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
  e2eNavigateToConnectionsCard();

  // Input the invitation into the acceptance dialog
  await driver
    .wait(
      until.elementIsEnabled(
        await driver.wait(
          until.elementLocated(By.css('#ConnectionsCard__accept-btn > span')),
          dcWaitDefault,
        ),
      ),
    )
    .click();

  await driver.wait(
    until.elementIsVisible(
      await driver.wait(
        until.elementLocated(By.id('AcceptInvitationForm')),
        dcWaitDefault,
      ),
    ),
    dcWaitDefault,
  );
  await driver
    .wait(
      until.elementLocated(By.css('#AcceptInvitationForm #myAlias')),
      dcWaitDefault,
    )
    .click();
  await driver
    .wait(
      until.elementLocated(By.css('#AcceptInvitationForm #myAlias')),
      dcWaitDefault,
    )
    .sendKeys(alias);
  await driver
    .wait(until.elementLocated(By.id('invitation_input')), dcWaitDefault)
    .click();
  await driver
    .wait(until.elementLocated(By.id('invitation_input')), dcWaitDefault)
    .sendKeys(invitation);

  // Accept invitation and make sure review dialog displayed
  await driver
    .wait(
      until.elementLocated(By.css('#AcceptInvitationForm__submit-btn > span')),
      dcWaitDefault,
    )
    .click();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(
        until.elementLocated(By.id('AcceptInvitationForm')),
        dcWaitDefault,
      ),
    ),
    dcWaitDefault,
  );

  await driver.wait(
    until.elementLocated(By.xpath("//span[contains(.,'Invitation Details')]")),
    dcWaitDefault,
  );

  // Complete connection set up
  await driver
    .wait(
      until.elementLocated(
        By.css('.ant-modal-confirm-btns > .ant-btn-primary > span'),
      ),
      dcWaitDefault,
    )
    .click();

  // Check the invitation appears in the list
  await driver.wait(
    until.elementLocated(By.xpath(`//td[contains(.,'${alias}')]`)),
    dcWaitDefault,
  );
}
