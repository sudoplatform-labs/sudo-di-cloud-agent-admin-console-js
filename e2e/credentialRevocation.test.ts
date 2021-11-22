import { By } from 'selenium-webdriver';
import {
  e2eExecuteTableRowDropdownAction,
  e2eWaitElementVisible,
} from './commonHelpers';
import { e2eAcceptInvitation, e2eCreateInvitation } from './connectionHelpers';
import {
  e2eCreateCredentialDefinition,
  e2eGetCredentialDefinitionId,
} from './credentialDefinitionHelpers';
import {
  e2eNavigateToIssuedCredentialsCard,
  e2eObtainCredential,
} from './credentialIssuanceHelpers';
import {
  e2eSendProofPresentation,
  e2eSendProofRequest,
  e2eVerifyProof,
} from './proofPresentationHelpers';
import { e2eCreateSchemaDefinition } from './schemaDefinitionHelpers';

export const crWaitDefault = 40000;

// A global to hold credential details across tests within this
// suite.
let CR0101_Credential_Exchange_Details: Record<string, any>;

describe('Credential Revocation', function () {
  it('CR-0101 Complete credential revocation', async function () {
    // Need to create schema annd credential definitions as
    // well as a DIDComm connection to the issuer first to
    // get a valid schema identifier
    const invitationText = await e2eCreateInvitation('CR Holder');
    await e2eAcceptInvitation('CR Issuer', invitationText);

    const schemaId = await e2eCreateSchemaDefinition(
      'CR-0101_Test_Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    const credentialDefinitionId = await e2eCreateCredentialDefinition(
      'CR-0101_Test_Credential_Definition',
      schemaId,
      true,
      '10000',
      '1000',
    );

    CR0101_Credential_Exchange_Details = await e2eObtainCredential(
      credentialDefinitionId,
      'CR-0101 Test Message',
      'CR Issuer',
      [
        { name: 'firstName', value: 'CR-0101 firstName' },
        { name: 'lastName', value: 'CR-0101 lastName' },
        { name: 'someCredentialValue', value: 'CR-0101 someCredentialValue' },
      ],
    );

    // Revoke the credential via the issuers IssuedCredentials table and
    // check that the status is updated from active to revoked
    await e2eNavigateToIssuedCredentialsCard();

    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='IssuedCredentialsList']//table/tbody/tr/td[contains(.,'CR-0101_Test_Credential_Definition')]/..//*[contains(@class,'anticon anticon-safety-certificate')]`,
      ),
      crWaitDefault,
    );

    // Must wait a few seconds so that the credential can be checked
    // as valid at some point in time.
    await new Promise((r) => setTimeout(r, 15000));

    await e2eExecuteTableRowDropdownAction(
      'IssuedCredentialsList',
      'CR-0101_Test_Credential_Definition',
      'Actions',
      'Revoke Credential',
      'Revoke',
      'Revoked',
    );

    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='IssuedCredentialsList']//table/tbody/tr/td[contains(.,'CR-0101_Test_Credential_Definition')]/..//*[contains(@class,'anticon anticon-close-square')]`,
      ),
      crWaitDefault,
    );
  });

  it('CI-0201 Attempt to revoke non-revocable credential', async function () {
    const schemaId = await e2eCreateSchemaDefinition(
      'CR-0201_Test_Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    // Create a non-revocable credential definition
    const credentialDefinitionId = await e2eCreateCredentialDefinition(
      'CR-0201_Test_Credential_Definition',
      schemaId,
      false,
    );

    await e2eObtainCredential(
      credentialDefinitionId,
      'CR-0201 Test Message',
      'CR Issuer',
      [
        { name: 'firstName', value: 'CR-0201 firstName' },
        { name: 'lastName', value: 'CR-0201 lastName' },
        { name: 'someCredentialValue', value: 'CR-0201 someCredentialValue' },
      ],
    );

    // Attempt to use action dropdown on IssuedCredential table to revoke
    // credential and check that revoke option is disabled.
    await e2eNavigateToIssuedCredentialsCard();

    await e2eWaitElementVisible(
      By.xpath(
        `//div[@id='IssuedCredentialsList']//table/tbody/tr/td[contains(.,'CR-0201_Test_Credential_Definition')]/..//*[contains(@class,'anticon anticon-safety-certificate')]`,
      ),
      crWaitDefault,
    );

    await (
      await e2eWaitElementVisible(
        By.xpath(
          `//div[@id='IssuedCredentialsList']//table/tbody/tr/td[contains(.,'CR-0201_Test_Credential_Definition')]/..//button[contains(.,'Action')]`,
        ),
        crWaitDefault,
      )
    ).click();

    {
      const element = await e2eWaitElementVisible(
        By.xpath(`//li[contains(.,'Revoke Credential')]`),
        crWaitDefault,
      );
      expect(await element.getAttribute('aria-disabled')).toBeTruthy();
    }
  });

  it('CR-0202 Proof presentation failure using revoked credential', async function () {
    // Because this is part of the same test suite, we will re-use the credential already issued
    // in CR-0101 since it reduces significant pre-work and run time
    const credentialDefinitionId = await e2eGetCredentialDefinitionId(
      'CR-0101_Test_Credential_Definition',
    );

    // We know that the credential issued for this was revoked in
    // CR-0101.  There is an assumption that there has at least been
    // 5 seconds between that revocation and now since we need to
    // provide a time range that will be outside that which the
    // credential was valid.
    const proofRequestThreadId = await e2eSendProofRequest(
      credentialDefinitionId,
      'CR-0202 Proof Request Test Message',
      'CR Holder',
      [
        {
          name: 'firstName',
          toggleRequired: false,
          timeRange: {
            start: new Date(Date.now()),
            end: new Date(Date.now()),
          },
        },
        {
          name: 'lastName',
          toggleRequired: false,
          timeRange: {
            start: new Date(Date.now()),
            end: new Date(Date.now()),
          },
        },
        {
          name: 'someCredentialValue',
          toggleRequired: false,
          timeRange: {
            start: new Date(Date.now()),
            end: new Date(Date.now()),
          },
        },
      ],
    );
    await e2eSendProofPresentation(proofRequestThreadId, [
      { name: 'firstName', toggleReveal: false },
      { name: 'lastName', toggleReveal: false },
      { name: 'someCredentialValue', toggleReveal: false },
    ]);
    await e2eVerifyProof(proofRequestThreadId, false);
  });

  it('CR-0203 Proof presentation success for time when valid using revoked credential', async function () {
    // Because this is part of the same test suite, we will re-use the credential already invoked
    // in CR-0101 since it reduces significant pre-work and run time
    const credentialDefinitionId = await e2eGetCredentialDefinitionId(
      'CR-0101_Test_Credential_Definition',
    );

    // We know that the credential issued for this was revoked in
    // CR-0101.  We can get the creation time from the credential
    // offer and use that time with a 3 second window that it should
    // have been valid for before it was revoked
    const startTime =
      new Date(CR0101_Credential_Exchange_Details.record.updated_at).valueOf() +
      2000;
    const endTime = startTime + 5000;

    const proofRequestThreadId = await e2eSendProofRequest(
      credentialDefinitionId,
      'CR-0203 Proof Request Test Message',
      'CR Holder',
      [
        {
          name: 'firstName',
          toggleRequired: false,
          timeRange: {
            start: new Date(startTime),
            end: new Date(endTime),
          },
        },
        {
          name: 'lastName',
          toggleRequired: false,
          timeRange: {
            start: new Date(startTime),
            end: new Date(endTime),
          },
        },
        {
          name: 'someCredentialValue',
          toggleRequired: false,
          timeRange: {
            start: new Date(startTime),
            end: new Date(endTime),
          },
        },
      ],
    );
    await e2eSendProofPresentation(proofRequestThreadId, [
      { name: 'firstName', toggleReveal: false },
      { name: 'lastName', toggleReveal: false },
      { name: 'someCredentialValue', toggleReveal: false },
    ]);
    await e2eVerifyProof(proofRequestThreadId, true);
  });
});
