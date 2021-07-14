import { By, until } from 'selenium-webdriver';
import {
  e2eAcceptTAAForm,
  e2eCheckMessageDisplays,
  e2eNavigateToCard,
  e2eWaitElementVisible,
} from './commonHelpers';
import { driver } from './setup-tests';

export const cdWaitDefault = 40000;

/**
 * Utility function to navigate to the credential definitions card
 * and verify presence.
 */
export async function e2eNavigateToCredentialDefinitionsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Credential Issuer', 'Catalogue'],
    'CredentialDefinitionsCard',
    'My Credential Definitions',
  );
}

/**
 * Utility function to create a credential definition
 * given a name and schema identifier
 *
 * @param {!string} name the human readable label to assign to this
 * credential definition.
 * @param {!string} schemId the full identifier of the schema to associate
 * with this credential definition.
 */
export async function e2eCreateCredentialDefinition(
  name: string,
  schemaId: string,
): Promise<void> {
  await e2eNavigateToCredentialDefinitionsCard();

  await (
    await e2eWaitElementVisible(
      By.css('#CredentialDefinitionsCard__create-btn > span'),
      cdWaitDefault,
    )
  ).click();

  await e2eWaitElementVisible(
    By.id('CreateCredentialDefinitionForm'),
    cdWaitDefault,
  );

  await (await driver.findElement(By.id('tag'))).click();
  await (await driver.findElement(By.id('tag'))).sendKeys(name);
  await (await driver.findElement(By.id('schemaId'))).click();
  // Use the SchemaId from our created schema
  await (await driver.findElement(By.id('schemaId'))).sendKeys(schemaId);

  await (
    await e2eWaitElementVisible(
      By.css('#CreateCredentialDefinitionForm__submit-btn > span'),
      cdWaitDefault,
    )
  ).click();

  await e2eAcceptTAAForm(cdWaitDefault);

  await e2eCheckMessageDisplays(
    'Credential Definition Created!',
    cdWaitDefault,
  );

  // Verify the credential has been put into the table
  await driver.wait(
    until.elementLocated(By.xpath(`//td[contains(.,'${name}')]`)),
    cdWaitDefault,
  );
}
