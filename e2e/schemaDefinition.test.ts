import { By, until } from 'selenium-webdriver';
import {
  e2eHoverOverCardInfoIcon,
  e2eInitiateThenCancelCardForm,
  e2eWaitElementVisible,
} from './commonHelpers';
import {
  e2eCreateSchemaDefinition,
  e2eEnterSchemaDefintionDetails,
  e2eNavigateToSchemaCard,
  sdWaitDefault,
} from './schemaDefinitionHelpers';
import { driver } from './setup-tests';

describe('Schema Definition', function () {
  it('SD-0001 Navigate and render Schema Definitions Catalogue Card', async function () {
    await e2eNavigateToSchemaCard();
  });

  it('SD-0005 Hover over pop-up icon and check displays info', async function () {
    await e2eNavigateToSchemaCard();
    await e2eHoverOverCardInfoIcon('SchemaDefinitionsCard');
  });

  it('SD-0010 Initiate schema creation then cancel dialog', async function () {
    await e2eNavigateToSchemaCard();
    await e2eInitiateThenCancelCardForm(
      'SchemaDefinitionsCard__create-btn',
      'CreateSchemaDefinitionForm',
    );
  });

  it('SD-0101 Create valid basic schema with one attribute', async function () {
    await e2eCreateSchemaDefinition('SD-0101_Test_Schema', '0.1', [
      'licenseNumber',
    ]);
  });

  it('SD-0102 Create valid basic schema with two attributes', async function () {
    await e2eCreateSchemaDefinition('SD-0102_Test_Schema', '1.0', [
      'firstName',
      'lastName',
    ]);
  });

  it('SD-0103 Enter valid schema details with two pages of attributes check paging updates', async function () {
    await e2eEnterSchemaDefintionDetails('SD-0103_Test_Schema', '1.5', [
      'firstName',
      'lastName',
      'streetNumber',
      'streetAddress',
      'suburb',
      'state',
    ]);

    await (
      await e2eWaitElementVisible(By.linkText('2'), sdWaitDefault)
    ).click();

    // Check that the overflow page has the expected attribute
    await e2eWaitElementVisible(
      By.xpath("//td[contains(.,'suburb')]"),
      sdWaitDefault,
    );

    await (
      await e2eWaitElementVisible(
        By.css('#CreateSchemaDefinitionForm__cancel-btn > span'),
        sdWaitDefault,
      )
    ).click();
  });

  it('SD-0104 Initiate valid basic schema with one attribute then delete attribute', async function () {
    await e2eEnterSchemaDefintionDetails('SD-0104_Test_Schema', '0.2', [
      'licenseNumber',
    ]);

    await (
      await e2eWaitElementVisible(
        By.xpath("//button[contains(.,'Remove')]"),
        sdWaitDefault,
      )
    ).click();

    // Need a way to check that the attribute table is now empty
    await (
      await e2eWaitElementVisible(
        By.css('#CreateSchemaDefinitionForm__cancel-btn > span'),
        sdWaitDefault,
      )
    ).click();
  });

  it('SD-0201 Attempt invalid create schema without name', async function () {
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
    ).sendKeys('0.1');
    // Make sure error text field is not initially displayed
    {
      const elements = await driver.findElements(
        By.css('.ant-form-item-explain > div'),
      );
      expect(elements.length).toBeFalsy();
    }
    await (
      await e2eWaitElementVisible(
        By.css('#CreateSchemaDefinitionForm__submit-btn > span'),
        sdWaitDefault,
      )
    ).click();
    // Check that error text field is displayed
    await e2eWaitElementVisible(
      By.css('.ant-form-item-explain > div'),
      sdWaitDefault,
    );

    await (
      await driver.findElement(
        By.css('#CreateSchemaDefinitionForm__cancel-btn > span'),
      )
    ).click();
  });

  it('SD-0202 Input invalid schema version and check validation fails', async function () {
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
    // Make sure error text field is not initially displayed
    {
      const elements = await driver.findElements(
        By.css('.ant-form-item-explain > div'),
      );
      expect(elements.length).toBeFalsy();
    }
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
    ).sendKeys('x.1');
    // Check that error text field is displayed
    await e2eWaitElementVisible(
      By.css('.ant-form-item-explain > div'),
      sdWaitDefault,
    );
    await (
      await driver.findElement(
        By.css('#CreateSchemaDefinitionForm__cancel-btn > span'),
      )
    ).click();
  });
});
