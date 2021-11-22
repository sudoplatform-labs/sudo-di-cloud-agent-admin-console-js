import { By, Key } from 'selenium-webdriver';
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

export async function e2eGetCredentialDefinitionId(
  name: string,
): Promise<string> {
  await e2eNavigateToCredentialDefinitionsCard();

  // Obtain the credential identifier to return
  await (
    await e2eWaitElementVisible(
      By.xpath(`//td[contains(.,'${name}')]/../td[1]`),
      cdWaitDefault,
    )
  ).click();

  const credentialDefinitionId = await (
    await e2eWaitElementVisible(
      By.xpath(
        "//h3[contains(.,'Credential Definition Identifier')]/following-sibling::p",
      ),
      cdWaitDefault,
    )
  ).getText();

  return credentialDefinitionId;
}

/**
 * Utility function to create a credential definition
 * given a name and schema identifier
 *
 * @param {!string} name the human readable label to assign to this
 * credential definition.
 * @param {!string} schemId the full identifier of the schema to associate
 * with this credential definition.
 * @param {boolean} revocable whether credentials issued from this definition
 * can be revoked
 * @param {string} old_registry_size the size field value expected on entry
 * @param {string} new_registry_size the number of revocable credentials to allocate
 * in each revocable_registry.
 */
export async function e2eCreateCredentialDefinition(
  name: string,
  schemaId: string,
  revocable?: boolean,
  old_registry_size?: string,
  new_registry_size?: string,
): Promise<string> {
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

  // If revocable is indicated toggle switch
  if (revocable) {
    await (await driver.findElement(By.id('revocable'))).click();
  }
  // If registry size is indicated, set that too
  if (old_registry_size) {
    expect(await driver.findElement(By.id('size')).getAttribute('value')).toBe(
      old_registry_size,
    );
  }

  if (new_registry_size) {
    const element = await driver.findElement(By.id('size'));

    while ((await element.getAttribute('value')) !== '') {
      await element.sendKeys(Key.BACK_SPACE);
    }

    await driver
      .actions({ bridge: true })
      .pause(200)
      .move({ origin: element })
      .pause(200)
      .click()
      .pause(200)
      .sendKeys(new_registry_size)
      .perform();

    expect(await driver.findElement(By.id('size')).getAttribute('value')).toBe(
      new_registry_size,
    );
  }

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

  // Obtain the credential definition identifier to return, which also ensures it was
  // created and displayed.
  await (
    await e2eWaitElementVisible(
      By.xpath(`//td[contains(.,'${name}')]/../td[1]`),
      cdWaitDefault,
    )
  ).click();

  const credentialDefinitionId = await (
    await e2eWaitElementVisible(
      By.xpath(
        "//h3[contains(.,'Credential Definition Identifier')]/following-sibling::p",
      ),
      cdWaitDefault,
    )
  ).getText();

  return credentialDefinitionId;
}
