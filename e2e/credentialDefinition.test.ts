import { By, until } from 'selenium-webdriver';
import {
  e2eHoverOverCardInfoIcon,
  e2eInitiateThenCancelCardForm,
} from './commonHelpers';
import { e2eCreateCredentialDefinition } from './credentialDefinitionHelpers';
import {
  cdWaitDefault,
  e2eNavigateToCredentialDefinitionsCard,
} from './credentialDefinitionHelpers';
import { e2eCreateSchemaDefinition } from './schemaDefinitionHelpers';
import { driver } from './setup-tests';

describe('Credential Definition', function () {
  it('CD-0001 Navigate and render Credential Definitions Catalogue Card', async function () {
    await e2eNavigateToCredentialDefinitionsCard();
  });

  it('CD-0005 Hover over pop-up icon and check displays info', async function () {
    await e2eNavigateToCredentialDefinitionsCard();
    await e2eHoverOverCardInfoIcon('CredentialDefinitionsCard');
  });

  it('CD-0010 Initiate credential definition creation then cancel dialog', async function () {
    await e2eNavigateToCredentialDefinitionsCard();
    await e2eInitiateThenCancelCardForm(
      'CredentialDefinitionsCard__create-btn',
      'CreateCredentialDefinitionForm',
    );
  });

  it('CD-0101 Create valid basic credential definition', async function () {
    const schemaId = await e2eCreateSchemaDefinition(
      'CD-0101 Test Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    await e2eCreateCredentialDefinition(
      'CD-0101 Test Credential Definition',
      schemaId,
    );
  });

  it('CD-0201 Attempt invalid create credential definition without name or schema', async function () {
    await e2eNavigateToCredentialDefinitionsCard();

    await driver
      .wait(
        until.elementLocated(
          By.css('#CredentialDefinitionsCard__create-btn > span'),
        ),
        cdWaitDefault,
      )
      .click();
    await driver.wait(
      until.elementIsVisible(
        await driver.wait(
          until.elementLocated(By.id('CreateCredentialDefinitionForm')),
          cdWaitDefault,
        ),
      ),
      cdWaitDefault,
    );
    // Try submit with no data and make sure the two mandatory fields present
    // an error.
    await driver
      .findElement(By.css('#CreateCredentialDefinitionForm__submit-btn > span'))
      .click();
    await driver.wait(
      until.elementLocated(
        By.css('.ant-row:nth-child(2) .ant-form-item-explain'),
      ),
      cdWaitDefault,
    );
    await driver.wait(
      until.elementLocated(
        By.css('.ant-row:nth-child(1) .ant-form-item-explain'),
      ),
      cdWaitDefault,
    );
    await driver
      .findElement(By.css('#CreateCredentialDefinitionForm__cancel-btn > span'))
      .click();
  });
});
