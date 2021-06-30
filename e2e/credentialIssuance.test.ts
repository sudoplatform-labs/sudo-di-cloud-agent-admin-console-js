import { By, until } from 'selenium-webdriver';
import {
  e2eExecuteTableRowDropdownAction,
  e2eExecuteTableRowRemoveAction,
  e2eHoverOverCardInfoIcon,
  e2eInitiateThenCancelCardForm,
} from './commonHelpers';
import { e2eAcceptInvitation, e2eCreateInvitation } from './connectionHelpers';
import { e2eCreateCredentialDefinition } from './credentialDefinitionHelpers';
import {
  e2eNavigateToRequestedCredentialsCard,
  e2eNavigateToOwnedCredentialsCard,
  e2eNavigateToIssuedCredentialsCard,
  e2eNavigateToActiveCredentialRequestsCard,
  e2eObtainCredential,
  ciWaitDefault,
  e2eSendCredentialProposal,
} from './credentialIssuanceHelpers';
import {
  e2eCreateSchemaDefinition,
  e2eGetSchemaId,
} from './schemaDefinitionHelpers';
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
      'CI-0101 Test Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    await e2eCreateCredentialDefinition(
      'CI-0101 Test Credential Definition',
      schemaId,
    );

    await e2eObtainCredential(schemaId, 'CI-0101 Test Message', 'CI Issuer', [
      { name: 'firstName', value: 'CI-0101 firstName' },
      { name: 'lastName', value: 'CI-0101 lastName' },
      { name: 'someCredentialValue', value: 'CI-0101 someCredentialValue' },
    ]);
  });

  it('CI-0102 Remove in progress credential from wallet and issuer', async function () {
    // Reuse the CI-0101 schema and credential definitions
    const schemaId = await e2eGetSchemaId('CI-0101 Test Schema');

    const credentialThread = await e2eSendCredentialProposal(
      schemaId,
      'CI-0102 Test Message',
      'CI Issuer',
      [
        { name: 'firstName', value: 'CI-0102 firstName' },
        { name: 'lastName', value: 'CI-0102 lastName' },
        { name: 'someCredentialValue', value: 'CI-0102 someCredentialValue' },
      ],
    );
    // Delete new credential from wallet
    await e2eNavigateToRequestedCredentialsCard();
    await e2eExecuteTableRowDropdownAction(
      'CredentialRequestsList',
      credentialThread,
      'Actions',
      'Cancel Request',
      'Abort',
      'Credential request aborted',
    );

    await e2eNavigateToActiveCredentialRequestsCard();
    await e2eExecuteTableRowDropdownAction(
      'ActiveCredentialRequestsList',
      credentialThread,
      'Actions',
      'Reject Proposal',
      'Reject',
      'Credential request aborted',
    );
  });

  it('CI-0103 Remove completed credential from wallet and issuer', async function () {
    // Walk through stages to obtain credential from Issuer
    const schemaId = await e2eCreateSchemaDefinition(
      'CI-0103 Test Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue'],
    );

    await e2eCreateCredentialDefinition(
      'CI-0103 Test Credential Definition',
      schemaId,
    );

    await e2eObtainCredential(schemaId, 'CI-0103 Test Message', 'CI Issuer', [
      { name: 'firstName', value: 'CI-0103 firstName' },
      { name: 'lastName', value: 'CI-0103 lastName' },
      { name: 'someCredentialValue', value: 'CI-0103 someCredentialValue' },
    ]);
    // Delete new credential from wallet
    await e2eNavigateToOwnedCredentialsCard();
    await e2eExecuteTableRowRemoveAction(
      'OwnedCredentialsList',
      'CI-0103 Test Credential Definition',
      'Remove',
      'Remove Credential',
      'Confirm',
      'Cancel',
      'Credential deleted',
    );

    await e2eNavigateToIssuedCredentialsCard();
    await e2eExecuteTableRowRemoveAction(
      'IssuedCredentialsList',
      'CI-0103 Test Credential Definition',
      'Remove',
      'Remove Completed Credential Issuance Record',
      'Confirm',
      'Cancel',
      'Credential Exchange Record deleted',
    );
  });

  it('CI-0201 Attempt invalid credential request without attributes', async function () {
    await e2eNavigateToRequestedCredentialsCard();
    await driver
      .wait(
        until.elementLocated(By.css('#CredentialRequestsCard__new-btn > span')),
        ciWaitDefault,
      )
      .click();

    await driver.wait(
      until.elementIsVisible(
        await driver.wait(
          until.elementLocated(By.id('ProposeCredentialForm')),
          ciWaitDefault,
        ),
      ),
      ciWaitDefault,
    );

    // Submit and check error text is displayed
    await driver
      .wait(
        until.elementLocated(
          By.css('#ProposeCredentialForm__submit-btn > span'),
        ),
        ciWaitDefault,
      )
      .click();

    await driver.wait(
      until.elementLocated(
        By.css('.ant-row:nth-child(1) .ant-form-item-explain'),
      ),
      ciWaitDefault,
    );
    await driver.wait(
      until.elementLocated(
        By.css('.ant-row:nth-child(3) .ant-form-item-explain'),
      ),
      ciWaitDefault,
    );
    await driver
      .findElement(By.css('#ProposeCredentialForm__cancel-btn > span'))
      .click();
  });
});
