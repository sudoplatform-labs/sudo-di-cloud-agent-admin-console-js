import { By, Key, until } from 'selenium-webdriver';
import {
  e2eAcceptTAAForm,
  e2eCheckMessageDisplays,
  e2eNavigateToCard,
  e2eWaitElementVisible,
} from './commonHelpers';
import { driver } from './setup-tests';

export const sdWaitDefault = 20000;

/**
 * Utility function to navigate to the schema definitions card
 * and verify presence.
 */
export async function e2eNavigateToSchemaCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Credential Issuer', 'Catalogue'],
    'SchemaDefinitionsCard',
    'My Schema Definitions',
  );
}

/**
 * Utility function to return the schemaId for a given
 * schema name.  If multiple schemas of the same name are
 * defined, the first is returned.
 *
 * @param {!string} name the human readble schema name to search for
 * @returns {string} the full schema id
 */
export async function e2eGetSchemaId(name: string): Promise<string> {
  await e2eNavigateToSchemaCard();

  // Obtain the schema identifier to return
  await (
    await e2eWaitElementVisible(
      By.xpath(`//td[contains(.,'${name}')]/../td[1]`),
      sdWaitDefault,
    )
  ).click();

  const schemaId = await (
    await e2eWaitElementVisible(
      By.xpath("//h3[contains(.,'Schema Identifier')]/following-sibling::p"),
      sdWaitDefault,
    )
  ).getText();

  return schemaId;
}

/**
 * Utility function to enter the details of a schema definition,
 * given a schema name, version and a list of attributes.
 * Will enter details but NOT submit form. This allows tests that
 * may want to do other actions before/instead of submitting.
 *
 * @param {!string} name the human readable label to assign to this
 * schema definition.
 * @param {!string} version schema version number to assign in the x.y
 * format.
 * @param {!string[]} attributes list of attribute names to add to
 * the schema.
 */
export async function e2eEnterSchemaDefintionDetails(
  name: string,
  version: string,
  attributes: string[],
): Promise<void> {
  await e2eNavigateToSchemaCard();
  await (
    await e2eWaitElementVisible(
      By.css('#SchemaDefinitionsCard__create-btn > span'),
      sdWaitDefault,
    )
  ).click();

  await e2eWaitElementVisible(
    By.id('CreateSchemaDefinitionForm'),
    sdWaitDefault,
  );

  await (
    await driver.wait(until.elementLocated(By.id('schemaName')), sdWaitDefault)
  ).click();
  await (
    await driver.wait(until.elementLocated(By.id('schemaName')), sdWaitDefault)
  ).sendKeys(name);
  await (
    await driver.wait(
      until.elementLocated(By.id('schemaVersion')),
      sdWaitDefault,
    )
  ).click();
  await (
    await driver.wait(
      until.elementLocated(By.id('schemaVersion')),
      sdWaitDefault,
    )
  ).sendKeys(version);

  for (let i = 0; i < attributes.length; i++) {
    await (
      await driver.wait(
        until.elementLocated(By.id('attributes')),
        sdWaitDefault,
      )
    ).click();
    await (
      await driver.wait(
        until.elementLocated(By.id('attributes')),
        sdWaitDefault,
      )
    ).sendKeys(attributes[i]);
    await (
      await driver.wait(
        until.elementLocated(By.id('attributes')),
        sdWaitDefault,
      )
    ).sendKeys(Key.ENTER);
    // Make sure the entry appears in the table before proceeding
    await driver.wait(
      until.elementLocated(By.xpath(`//td[contains(.,'${attributes[i]}')]`)),
      sdWaitDefault,
    );
  }
}

/**
 * Utility function to create a schema definition, given a schema name, version
 * and a list of attributes. Will return the full schema Id on success
 *
 * @param {!string} name the human readable label to assign to this
 * schema definition.
 * @param {!string} version schema version number to assign in the x.y
 * format.
 * @param {!string[]} attributes list of attribute names to add to
 * the schema.
 * @return {string} the schema Id for the schema created.
 */
export async function e2eCreateSchemaDefinition(
  name: string,
  version: string,
  attributes: string[],
): Promise<string> {
  await e2eEnterSchemaDefintionDetails(name, version, attributes);

  await (
    await e2eWaitElementVisible(
      By.css('#CreateSchemaDefinitionForm__submit-btn > span'),
      sdWaitDefault,
    )
  ).click();

  await e2eAcceptTAAForm(sdWaitDefault);

  await e2eCheckMessageDisplays('Schema Definition Created!', sdWaitDefault);

  // Obtain the schema identifier to return, which also ensures it was
  // created and displayed.
  await (
    await e2eWaitElementVisible(
      By.xpath(`//td[contains(.,'${name}')]/../td[1]`),
      sdWaitDefault,
    )
  ).click();

  const schemaId = await (
    await e2eWaitElementVisible(
      By.xpath("//h3[contains(.,'Schema Identifier')]/following-sibling::p"),
      sdWaitDefault,
    )
  ).getText();

  return schemaId;
}
