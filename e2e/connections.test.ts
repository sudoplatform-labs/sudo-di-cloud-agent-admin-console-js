import { By, until } from 'selenium-webdriver';
import {
  e2eExecuteTableRowRemoveAction,
  e2eHoverOverCardInfoIcon,
  e2eInitiateThenCancelCardForm,
} from './commonHelpers';
import {
  e2eNavigateToConnectionsCard,
  dcWaitDefault,
  e2eCreateInvitation,
  e2eAcceptInvitation,
} from './connectionHelpers';
import { driver } from './setup-tests';

describe('Connections', function () {
  it('DC-0001 Navigate and render Connections Card', async function () {
    await e2eNavigateToConnectionsCard();
  });

  it('DC-0005 Hover over pop-up icon and check displays info', async function () {
    await e2eNavigateToConnectionsCard();
    await e2eHoverOverCardInfoIcon('ConnectionsCard');
  });

  it('DC-0010 Initiate invitation creation then cancel dialog', async function () {
    await e2eNavigateToConnectionsCard();
    await e2eInitiateThenCancelCardForm(
      'ConnectionsCard__create-btn',
      'CreateInvitationForm',
    );
  });

  it('DC-0011 Initiate invitation acceptance then cancel dialog', async function () {
    await e2eNavigateToConnectionsCard();
    await driver
      .wait(
        until.elementLocated(By.css('#ConnectionsCard__accept-btn > span')),
        dcWaitDefault,
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
      .findElement(By.css('#AcceptInvitationForm__cancel-btn > span'))
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
  });

  it('DC-0101 Create valid invitation', async function () {
    await e2eCreateInvitation('DC-0101 Test Invitation');
  });

  it('DC-0102 Accept valid invitation', async function () {
    const invitationText = await e2eCreateInvitation('DC-0102 Test Invitation');
    await e2eAcceptInvitation('DC-0102 Test Acceptance', invitationText);
  });

  it('DC-0110 Remove pending invitation', async function () {
    const alias = 'DC-0110 Test Invitation';
    await e2eCreateInvitation(alias);
    await new Promise((r) => setTimeout(r, 3000));
    await e2eExecuteTableRowRemoveAction(
      'ConnectionsList',
      alias,
      'Remove',
      'Remove Connection',
      'Confirm',
      'Cancel',
      'Connection deleted',
    );
  });

  it('DC-0201 Attempt invalid create invitation without label', async function () {
    await e2eNavigateToConnectionsCard();
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

    // Make sure error text field is not initially displayed
    {
      const elements = await driver.findElements(
        By.css('.ant-form-item-explain > div'),
      );
      expect(elements.length).toBeFalsy();
    }
    await driver
      .wait(
        until.elementLocated(
          By.css('#CreateInvitationForm__submit-btn > span'),
        ),
        dcWaitDefault,
      )
      .click();
    // Check that error text field is displayed
    const errorText = await driver
      .wait(
        until.elementIsVisible(
          await driver.wait(
            until.elementLocated(By.css('.ant-form-item-explain > div')),
            dcWaitDefault,
          ),
        ),
        dcWaitDefault,
      )
      .getText();

    expect(errorText).toContain('Please provide a label');

    await driver
      .findElement(By.css('#CreateInvitationForm__cancel-btn > span'))
      .click();
  });

  it('DC-0202 Attempt invalid accept invitation without label', async function () {
    await e2eNavigateToConnectionsCard();
    await driver
      .wait(
        until.elementLocated(By.css('#ConnectionsCard__accept-btn > span')),
        dcWaitDefault,
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

    // Make sure error text field is not initially displayed
    {
      const elements = await driver.findElements(
        By.css('.ant-form-item-explain > div'),
      );
      expect(elements.length).toBeFalsy();
    }
    await driver
      .wait(
        until.elementLocated(
          By.css('#AcceptInvitationForm__submit-btn > span'),
        ),
        dcWaitDefault,
      )
      .click();
    // Check that error text field is displayed
    const errorText = await driver
      .wait(
        until.elementIsVisible(
          await driver.wait(
            until.elementLocated(By.css('.ant-form-item-explain > div')),
            dcWaitDefault,
          ),
        ),
        dcWaitDefault,
      )
      .getText();

    expect(errorText).toContain('Please provide a label');

    await driver
      .findElement(By.css('#AcceptInvitationForm__cancel-btn > span'))
      .click();
  });
});
