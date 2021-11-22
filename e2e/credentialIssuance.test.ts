import { By } from 'selenium-webdriver';
import {
  e2eCheckTableDataNotPresent,
  e2eCheckTableDataPresent,
  e2eExecuteTableRowDropdownAction,
  e2eExecuteTableRowRemoveAction,
  e2eHoverOverCardInfoIcon,
  e2eInitiateThenCancelCardForm,
  e2eWaitElementVisible,
} from './commonHelpers';
import { e2eAcceptInvitation, e2eCreateInvitation } from './connectionHelpers';
import {
  e2eCreateCredentialDefinition,
  e2eGetCredentialDefinitionId,
} from './credentialDefinitionHelpers';
import {
  e2eNavigateToRequestedCredentialsCard,
  e2eNavigateToOwnedCredentialsCard,
  e2eNavigateToIssuedCredentialsCard,
  e2eNavigateToActiveCredentialRequestsCard,
  e2eObtainCredential,
  ciWaitDefault,
  e2eSendCredentialProposal,
} from './credentialIssuanceHelpers';
import { e2eCreateSchemaDefinition } from './schemaDefinitionHelpers';
import { driver } from './setup-tests';

describe('Credential Issuance', function () {
  it('CI-0001 Navigate and render Requested Credentials Card', async function () {
    await e2eNavigateToRequestedCredentialsCard();
  });

  it('CI-0002 Navigate and render Owned Credentials Card', async function () {
    await e2eNavigateToOwnedCredentialsCard();
  });

  it('CI-0003 Navigate and render Active Credential Requests Card', async function () {
    await e2eNavigateToActiveCredentialRequestsCard();
  });

  it('CI-0004 Navigate and render Issued Credentials Card', async function () {
    await e2eNavigateToIssuedCredentialsCard();
  });

  it('CI-0005 Hover over Requested Credentials pop-up icon and check displays info', async function () {
    await e2eNavigateToRequestedCredentialsCard();
    await e2eHoverOverCardInfoIcon('CredentialRequestsCard');
  });

  it('CI-0006 Hover over Owned Credentials pop-up icon and check displays info', async function () {
    await e2eNavigateToOwnedCredentialsCard();
    await e2eHoverOverCardInfoIcon('OwnedCredentialsCard');
  });

  it('CI-0007 Hover over Active Credential Requests pop-up icon and check displays info', async function () {
    await e2eNavigateToActiveCredentialRequestsCard();
    await e2eHoverOverCardInfoIcon('ActiveCredentialRequestsCard');
  });

  it('CI-0008 Hover over Issued Credentials pop-up icon and check displays info', async function () {
    await e2eNavigateToIssuedCredentialsCard();
    await e2eHoverOverCardInfoIcon('IssuedCredentialsCard');
  });

  it('CI-0010 Initiate new credential request then cancel dialog', async function () {
    await e2eNavigateToRequestedCredentialsCard();
    await e2eInitiateThenCancelCardForm(
      'CredentialRequestsCard__new-btn',
      'ProposeCredentialForm',
    );
  });

  it('CI-0101 Complete valid credential request', async function () {
    // Need to create schema and credential definitions as
    // well as a DIDComm connection to the issuer first to
    // get a valid schema identifier
    const invitationText = await e2eCreateInvitation('CI Holder');
    await e2eAcceptInvitation('CI Issuer', invitationText);

    const schemaId = await e2eCreateSchemaDefinition(
      'CI-0101_Test_Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    const credentialDefinitionId = await e2eCreateCredentialDefinition(
      'CI-0101_Test_Credential_Definition',
      schemaId,
    );

    await e2eObtainCredential(
      credentialDefinitionId,
      'CI-0101 Test Message',
      'CI Issuer',
      [
        { name: 'firstName', value: 'CI-0101 firstName' },
        { name: 'lastName', value: 'CI-0101 lastName' },
        { name: 'someCredentialValue', value: 'CI-0101 someCredentialValue' },
      ],
    );
  });

  it('CI-0102 Remove in progress credential from wallet and issuer', async function () {
    // Reuse the CI-0101 schema and credential definitions
    const credentialDefinitionId = await e2eGetCredentialDefinitionId(
      'CI-0101_Test_Credential_Definition',
    );

    await e2eSendCredentialProposal(
      credentialDefinitionId,
      'CI-0102 Test Message',
      'CI Issuer',
      [
        { name: 'firstName', value: 'CI-0102 firstName' },
        { name: 'lastName', value: 'CI-0102 lastName' },
        { name: 'someCredentialValue', value: 'CI-0102 someCredentialValue' },
      ],
    );
    // Abort in progress credential request wallet.
    // NOTE: In version Cloud Agent 0.500.600 you needed to manually delete in
    //       progress credentials from both the Holder and Issuer.
    //       In version 0.700.0 the behaviour changed
    //       so that if an in-progress request is deleted by the Holder it is
    //       automatically removed from the Issuer.
    await e2eNavigateToRequestedCredentialsCard();
    await e2eCheckTableDataPresent(
      'CredentialRequestsList',
      credentialDefinitionId,
    );
    await e2eExecuteTableRowDropdownAction(
      'CredentialRequestsList',
      credentialDefinitionId,
      'Actions',
      'Cancel Request',
      'Abort',
      'Credential request aborted',
    );
    await e2eCheckTableDataNotPresent(
      'CredentialRequestsList',
      credentialDefinitionId,
    );

    await e2eNavigateToActiveCredentialRequestsCard();
    await e2eCheckTableDataNotPresent(
      'ActiveCredentialRequestsList',
      credentialDefinitionId,
    );
  });

  it('CI-0103 Remove completed credential from wallet and issuer', async function () {
    // Walk through stages to obtain credential from Issuer
    const schemaId = await e2eCreateSchemaDefinition(
      'CI-0103_Test_Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    const credentialDefinitionId = await e2eCreateCredentialDefinition(
      'CI-0103_Test_Credential_Definition',
      schemaId,
    );

    await e2eObtainCredential(
      credentialDefinitionId,
      'CI-0103 Test Message',
      'CI Issuer',
      [
        { name: 'firstName', value: 'CI-0103 firstName' },
        { name: 'lastName', value: 'CI-0103 lastName' },
        { name: 'someCredentialValue', value: 'CI-0103 someCredentialValue' },
      ],
    );
    // Delete new credential from wallet
    await e2eNavigateToOwnedCredentialsCard();
    await e2eExecuteTableRowRemoveAction(
      'OwnedCredentialsList',
      'CI-0103_Test_Credential_Definition',
      'Remove',
      'Remove Credential',
      'Confirm',
      'Cancel',
      'Credential deleted',
    );

    await e2eNavigateToIssuedCredentialsCard();
    await e2eExecuteTableRowDropdownAction(
      'IssuedCredentialsList',
      'CI-0103_Test_Credential_Definition',
      'Actions',
      'Remove',
      'Confirm',
      'Credential Exchange Record deleted',
    );
  });

  it('CI-0201 Attempt invalid credential request without attributes', async function () {
    await e2eNavigateToRequestedCredentialsCard();
    await (
      await e2eWaitElementVisible(
        By.css('#CredentialRequestsCard__new-btn > span'),
        ciWaitDefault,
      )
    ).click();

    await e2eWaitElementVisible(By.id('ProposeCredentialForm'), ciWaitDefault);
    // Submit and check error text is displayed
    await (
      await e2eWaitElementVisible(
        By.css('#ProposeCredentialForm__submit-btn > span'),
        ciWaitDefault,
      )
    ).click();

    await e2eWaitElementVisible(
      By.css('.ant-row:nth-child(1) .ant-form-item-explain'),
      ciWaitDefault,
    );
    await e2eWaitElementVisible(
      By.css('.ant-row:nth-child(3) .ant-form-item-explain'),
      ciWaitDefault,
    );
    await (
      await driver.findElement(
        By.css('#ProposeCredentialForm__cancel-btn > span'),
      )
    ).click();
  });
});
