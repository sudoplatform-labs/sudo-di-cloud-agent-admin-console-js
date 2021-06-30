import { By, until } from 'selenium-webdriver';
import { e2eCheckMessageDisplays, e2eNavigateToCard } from './commonHelpers';
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

  await driver
    .findElement(By.css('#CredentialDefinitionsCard__create-btn > span'))
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

  await driver.findElement(By.id('tag')).click();
  await driver.findElement(By.id('tag')).sendKeys(name);
  await driver.findElement(By.id('schemaId')).click();
  // Use the SchemaId from our created schema
  await driver.findElement(By.id('schemaId')).sendKeys(schemaId);
  await driver
    .findElement(By.css('#CreateCredentialDefinitionForm__submit-btn > span'))
    .click();

  await e2eCheckMessageDisplays(
    'Credential Definition Created!',
    cdWaitDefault,
  );

  await driver.wait(
    until.elementLocated(By.xpath(`//td[contains(.,'${name}')]`)),
    cdWaitDefault,
  );
}
