import { By, until } from 'selenium-webdriver';
import {
  e2eExecuteTableRowDropdownAction,
  e2eNavigateToCard,
  e2eWaitElementVisible,
} from './commonHelpers';
import { driver } from './setup-tests';

export const ciWaitDefault = 20000;

/**
 * Utility function to navigate to the Holder Requested Credentials card
 * and verify presence.
 */
export async function e2eNavigateToRequestedCredentialsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Holder Wallet', 'My Credentials'],
    'CredentialRequestsCard',
    'Requested Credentials',
  );
}

/**
 * Utility function to navigate to the Holder Owned Credentials card
 * and verify presence.
 */
export async function e2eNavigateToOwnedCredentialsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Holder Wallet', 'My Credentials'],
    'OwnedCredentialsCard',
    'Owned Credentials',
  );
}

/**
 * Utility function to navigate to the Issuer Active Credential Requests card
 * and verify presence.
 */
export async function e2eNavigateToActiveCredentialRequestsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Credential Issuer', 'Credential Issuance'],
    'ActiveCredentialRequestsCard',
    'Active Credential Requests',
  );
}

/**
 * Utility function to navigate to the Issued Credentials card
 * and verify presence.
 */
export async function e2eNavigateToIssuedCredentialsCard(): Promise<void> {
  await e2eNavigateToCard(
    ['Credential Issuer', 'Credential Issuance'],
    'IssuedCredentialsCard',
    'Issued Credentials',
  );
}

/**
 * Utility function to enter the details of a credential proposal form
 * for a requesting Holder. Will enter details but NOT submit form.
 * This allows tests that may want to do other actions before/instead of
 * submitting.
 *
 * @param {!string} credentialDefinitionId the unique credential definition
 * that defines the credential type being requested and defines the attributes required.
 * @param {!string} message a human readable message intended to be sent
 * to the issuer explaining the purpose or reason for the credential request
 * @param {!string} connectionAlias the DIDComm connection alias representign
 * connection to the Issuer
 * @param {!{name:string, value:string}[]} attributes the list of name, value
 * pairs representing schema attributes and the values to be assigned
 *
 */
export async function e2eEnterCredentialProposalDetails(
  credentialDefinitionId: string,
  message: string,
  connectionAlias: string,
  attributes: { name: string; value: string }[],
): Promise<void> {
  await e2eNavigateToRequestedCredentialsCard();
  await (
    await driver.wait(
      until.elementLocated(By.css('#CredentialRequestsCard__new-btn > span')),
      ciWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsVisible(
      await driver.wait(
        until.elementLocated(By.id('ProposeCredentialForm')),
        ciWaitDefault,
      ),
    ),
    ciWaitDefault,
  );

  await (
    await driver.wait(
      until.elementLocated(By.id('credentialDefinitionId')),
      ciWaitDefault,
    )
  ).click();

  await (
    await driver.wait(
      until.elementLocated(By.id('credentialDefinitionId')),
      ciWaitDefault,
    )
  ).sendKeys(credentialDefinitionId);

  await (
    await driver.wait(until.elementLocated(By.id('message')), ciWaitDefault)
  ).click();

  await (
    await driver.wait(until.elementLocated(By.id('message')), ciWaitDefault)
  ).sendKeys(message);

  await (
    await driver.wait(
      until.elementLocated(By.xpath("//input[@id='DIDCommSelections']/../..")),
      ciWaitDefault,
    )
  ).click();

  {
    // Move mouse over selection
    const element = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@class='rc-virtual-list']//div[contains(.,'${connectionAlias}')][1]/../span`,
        ),
      ),
      ciWaitDefault,
    );

    await driver
      .actions({ bridge: true })
      .pause(200)
      .move({ origin: element })
      .pause(1000)
      .click()
      .perform();
  }

  for (let i = 0; i < attributes.length; i++) {
    await (
      await driver.wait(
        until.elementLocated(By.id(`attribute_${attributes[i].name}`)),
        ciWaitDefault,
      )
    ).click();
    await (
      await driver.wait(
        until.elementLocated(By.id(`attribute_${attributes[i].name}`)),
        ciWaitDefault,
      )
    ).sendKeys(attributes[i].value);
  }
}

/**
 * Utility function to enter send a credential proposal
 * for a requesting Holder.
 *
 * @param {!string} credentialDefinitionId the unique credential definition
 * that defines the credential type being requested and defines the attributes required.
 * @param {!string} message a human readable message intended to be sent
 * to the issuer explaining the purpose or reason for the credential request
 * @param {!string} connectionAlias the DIDComm connection alias representign
 * connection to the Issuer
 * @param {!{name:string, value:string}[]} attributes the list of name, value
 * pairs representing schema attributes and the values to be assigned
 */
export async function e2eSendCredentialProposal(
  credentialDefinitionId: string,
  message: string,
  connectionAlias: string,
  attributes: { name: string; value: string }[],
): Promise<void> {
  await e2eEnterCredentialProposalDetails(
    credentialDefinitionId,
    message,
    connectionAlias,
    attributes,
  );

  await (
    await driver.wait(
      until.elementLocated(By.css('#ProposeCredentialForm__submit-btn > span')),
      ciWaitDefault,
    )
  ).click();

  await driver.wait(
    until.elementIsNotVisible(
      await driver.wait(
        until.elementLocated(By.id('ProposeCredentialForm')),
        ciWaitDefault,
      ),
    ),
    ciWaitDefault,
  );

  // Check that a proposal is indicated as sent.
  const confirmation = await driver.wait(
    until.elementLocated(
      By.xpath(`//span[contains(.,'Credential proposal sent')]`),
    ),
    ciWaitDefault,
  );
  await driver.wait(until.elementIsVisible(confirmation), ciWaitDefault);
  // Wait for message to dissapear to avoid artifact issues
  // with subsequent UI actions
  await driver.wait(until.stalenessOf(confirmation), ciWaitDefault);
}

/**
 * Utility test routine to Navigate to Credential Issuer Active Credential
 * Requests and offer proposed credential.
 *
 * @param {!string} credentialRowId a unique data value to identify the row
 */
export async function e2eOfferCredential(
  credentialRowId: string,
): Promise<void> {
  await e2eNavigateToActiveCredentialRequestsCard();
  await e2eExecuteTableRowDropdownAction(
    'ActiveCredentialRequestsList',
    credentialRowId,
    'Actions',
    'Offer Credential',
    'Offer',
    'Credential offered',
  );
}

/**
 * Utility test routine to accept an offered credential at the Holder
 *
 * @param {!string} credentialRowId a unique data value to identify the row
 */
export async function e2eAcceptCredential(
  credentialRowId: string,
): Promise<void> {
  await e2eNavigateToRequestedCredentialsCard();
  await e2eExecuteTableRowDropdownAction(
    'CredentialRequestsList',
    credentialRowId,
    'Actions',
    'Accept Offer',
    'Accept',
    'Proposed credential requested',
  );
}

/**
 * Utility test routine to issue an offered credential at the Issuer
 *
 * @param {!string} credentialRowId a unique data value to identify the row
 */
export async function e2eIssueCredential(
  credentialRowId: string,
): Promise<void> {
  await e2eNavigateToActiveCredentialRequestsCard();
  await e2eExecuteTableRowDropdownAction(
    'ActiveCredentialRequestsList',
    credentialRowId,
    'Actions',
    'Issue Credential',
    'Issue',
    'Credential issued',
  );
}

/**
 * Utility test routine to save an issued credential at the Holder
 *
 * @param {!string} credentialRowId a unique data value to identify the row
 */
export async function e2eSaveCredential(
  credentialRowId: string,
): Promise<void> {
  await e2eNavigateToRequestedCredentialsCard();
  await e2eExecuteTableRowDropdownAction(
    'CredentialRequestsList',
    credentialRowId,
    'Actions',
    'Save Credential',
    'Save',
    'Credential saved to wallet',
  );
}

/**
 * Utility test routine to execute the complete process of proposing,
 * issuing and saving a credential based on a specified connnection,
 * credential definition and set of attribute values.
 *
 * @param {!string} credentialDefinitionId the unique credential definition
 * that defines the credential type being requested and defines the attributes required.
 * @param {!string} message a human readable message intended to be sent
 * to the issuer explaining the purpose or reason for the credential request
 * @param {!string} connectionAlias the DIDComm connection alias representing
 * connection to the Issuer
 * @param {!{name:string, value:string}[]} attributes the list of name, value
 * pairs representing schema attributes and the values to be assigned
 * @return {!string} returns the threadid created to identify the credential
 * issuance protocol session
 */
export async function e2eObtainCredential(
  credentialDefinitionId: string,
  message: string,
  connectionAlias: string,
  attributes: { name: string; value: string }[],
): Promise<Record<string, any>> {
  await e2eSendCredentialProposal(
    credentialDefinitionId,
    message,
    connectionAlias,
    attributes,
  );

  await e2eOfferCredential(credentialDefinitionId);
  await e2eAcceptCredential(credentialDefinitionId);
  await e2eIssueCredential(credentialDefinitionId);
  await e2eSaveCredential(credentialDefinitionId);

  // Return the credential exchange record in case they want to
  // explicitely reference the records for this exchange later.
  await e2eNavigateToIssuedCredentialsCard();

  await (
    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='IssuedCredentialsList']//table/tbody/tr/td[contains(.,'${credentialDefinitionId}')]/../td/span[contains(@class,'anticon-plus-square')]`,
      ),
      ciWaitDefault,
    )
  ).click();

  const credentialExchange = JSON.parse(
    await (
      await e2eWaitElementVisible(
        By.xpath(
          `//div[@id='IssuedCredentialsList']//table/tbody/tr[contains(@class,'ant-table-expanded-row')]//pre`,
        ),
        ciWaitDefault,
      )
    ).getText(),
  );

  return credentialExchange;
}
