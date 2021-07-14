import { By } from 'selenium-webdriver';
import {
  e2eExecuteTableRowDropdownAction,
  e2eExecuteTableRowRemoveAction,
  e2eHoverOverCardInfoIcon,
  e2eInitiateThenCancelCardForm,
  e2eWaitElementVisible,
} from './commonHelpers';
import { e2eAcceptInvitation, e2eCreateInvitation } from './connectionHelpers';
import { e2eCreateCredentialDefinition } from './credentialDefinitionHelpers';
import { e2eObtainCredential } from './credentialIssuanceHelpers';
import {
  e2eNavigateToHolderActiveProofPresentationsCard,
  e2eNavigateToHolderCompletedProofPresentationsCard,
  e2eNavigateToVerifierActiveProofRequestsCard,
  e2eNavigateToVerifierCompletedProofPresentationsCard,
  e2eSendProofPresentation,
  e2eSendProofRequest,
  e2eVerifyProof,
  ppWaitDefault,
} from './proofPresentationHelpers';
import {
  e2eCreateSchemaDefinition,
  e2eGetSchemaId,
} from './schemaDefinitionHelpers';
import { driver } from './setup-tests';

describe('Proof Presentation', function () {
  it('PP-0001 Navigate and render Verifier Active Proof Exchanges Card', async function () {
    await e2eNavigateToVerifierActiveProofRequestsCard();
  });

  it('PP-0002 Navigate and render Verifier Completed Proof Presentations Card', async function () {
    await e2eNavigateToVerifierCompletedProofPresentationsCard();
  });

  it('PP-0003 Navigate and render Holder Active Proof Presentations Card', async function () {
    await e2eNavigateToHolderActiveProofPresentationsCard();
  });

  it('PP-0004 Navigate and render Holder Completed Proof Presentations Card', async function () {
    await e2eNavigateToHolderCompletedProofPresentationsCard();
  });

  it('PP-0005 Hover over Verifier Active Proof Exchanges pop-up icon and check displays info', async function () {
    await e2eNavigateToVerifierActiveProofRequestsCard();
    await e2eHoverOverCardInfoIcon('ActiveProofRequestsCard');
  });

  it('PP-0006 Hover over Verifier Completed Proof Presentations pop-up icon and check displays info', async function () {
    await e2eNavigateToVerifierCompletedProofPresentationsCard();
    await e2eHoverOverCardInfoIcon('CompletedProofsCard');
  });

  it('PP-0007 Hover over Holder Active Proof Presentations pop-up icon and check displays info', async function () {
    await e2eNavigateToHolderActiveProofPresentationsCard();
    await e2eHoverOverCardInfoIcon('ActiveProofPresentationsCard');
  });

  it('PP-0008 Hover over Holder Completed Proof Presentations pop-up icon and check displays info', async function () {
    await e2eNavigateToHolderCompletedProofPresentationsCard();
    await e2eHoverOverCardInfoIcon('CompletedProofsCard');
  });

  it('PP-0010 Initiate new proof request then cancel dialog', async function () {
    await e2eNavigateToVerifierActiveProofRequestsCard();
    await e2eInitiateThenCancelCardForm(
      'ActiveProofRequestsCard__new-btn',
      'RequestProofForm',
    );
  });

  it('PP-0101 Complete valid proof presentation process', async function () {
    // Need to create schema and credential definitions as
    // well as a DIDComm connection to the issuer, obtain credential
    // then initiate proof request
    const invitationText = await e2eCreateInvitation('PP Holder');
    await e2eAcceptInvitation('PP Issuer', invitationText);

    const schemaId = await e2eCreateSchemaDefinition(
      'PP-0101 Test Schema',
      '1.0',
      ['firstName', 'lastName', 'someCredentialValue', 'unRequestedAttribute'],
    );

    await e2eCreateCredentialDefinition(
      'PP-0101 Test Credential Definition',
      schemaId,
    );

    await e2eObtainCredential(
      schemaId,
      'PP-0101 Credential Request Test Message',
      'PP Issuer',
      [
        { name: 'firstName', value: 'PP-0101 firstName' },
        { name: 'lastName', value: 'PP-0101 lastName' },
        { name: 'someCredentialValue', value: 'PP-0101 someCredentialValue' },
        {
          name: 'unRequestedAttribute',
          value: 'PP-0101 unRequestedAttribute',
        },
      ],
    );

    // Initiate proof request from verifier. In this instance the issuer is
    // also acting as the verifier as would be a common case for DI currently
    const proofRequestThreadId = await e2eSendProofRequest(
      schemaId,
      'PP-0101 Proof Request Test Message',
      'PP Holder',
      [
        { name: 'firstName', toggleRequired: false },
        { name: 'lastName', toggleRequired: false },
        { name: 'someCredentialValue', toggleRequired: false },
        { name: 'unRequestedAttribute', toggleRequired: true },
      ],
    );
    await e2eSendProofPresentation(proofRequestThreadId, [
      { name: 'firstName', toggleReveal: false },
      { name: 'lastName', toggleReveal: false },
      { name: 'someCredentialValue', toggleReveal: false },
    ]);
    await e2eVerifyProof(proofRequestThreadId);
  });

  it('PP-0102 Remove in progress proof from wallet and issuer', async function () {
    // Re-use PP-0101 issued credential
    const schemaId = await e2eGetSchemaId('PP-0101 Test Schema');

    // Initiate proof request from verifier. In this instance the issuer is
    // also acting as the verifier as would be a common case for DI currently
    const proofRequestThreadId = await e2eSendProofRequest(
      schemaId,
      'PP-0102 Proof Request Test Message',
      'PP Holder',
      [
        { name: 'firstName', toggleRequired: false },
        { name: 'lastName', toggleRequired: false },
        { name: 'someCredentialValue', toggleRequired: false },
        { name: 'unRequestedAttribute', toggleRequired: true },
      ],
    );

    await e2eNavigateToHolderActiveProofPresentationsCard();
    await e2eExecuteTableRowDropdownAction(
      'ActiveProofPresentationsList',
      proofRequestThreadId,
      'Actions',
      'Cancel Proof',
      'Remove',
      'Proof Aborted',
    );

    await e2eNavigateToVerifierActiveProofRequestsCard();
    await e2eExecuteTableRowDropdownAction(
      'ActiveProofRequestsList',
      proofRequestThreadId,
      'Actions',
      'Cancel Proof',
      'Remove',
      'Proof Aborted',
    );
  });

  it('PP-0103 Remove completed proof from wallet and issuer', async function () {
    // Re-use PP-0101 issued credential
    const schemaId = await e2eGetSchemaId('PP-0101 Test Schema');

    // Initiate proof request from verifier. In this instance the issuer is
    // also acting as the verifier as would be a common case for DI currently
    const proofRequestThreadId = await e2eSendProofRequest(
      schemaId,
      'PP-0103 Proof Request Test Message',
      'PP Holder',
      [
        { name: 'firstName', toggleRequired: false },
        { name: 'lastName', toggleRequired: false },
        { name: 'someCredentialValue', toggleRequired: false },
        { name: 'unRequestedAttribute', toggleRequired: true },
      ],
    );
    await e2eSendProofPresentation(proofRequestThreadId, [
      { name: 'firstName', toggleReveal: false },
      { name: 'lastName', toggleReveal: false },
      { name: 'someCredentialValue', toggleReveal: false },
    ]);
    await e2eVerifyProof(proofRequestThreadId);

    // Delete new proof result from wallet
    await e2eNavigateToHolderCompletedProofPresentationsCard();
    await e2eExecuteTableRowRemoveAction(
      'CompletedProofsList',
      proofRequestThreadId,
      'Remove',
      'Remove Completed Proof Record',
      'Confirm',
      'Cancel',
      'Proof Presentation Record deleted',
    );

    await e2eNavigateToVerifierCompletedProofPresentationsCard();
    await e2eExecuteTableRowRemoveAction(
      'CompletedProofsList',
      proofRequestThreadId,
      'Remove',
      'Remove Completed Proof Record',
      'Confirm',
      'Cancel',
      'Proof Presentation Record deleted',
    );
  });

  it('PP-0201 Attempt invalid proof request without attributes', async function () {
    await e2eNavigateToVerifierActiveProofRequestsCard();
    await (
      await e2eWaitElementVisible(
        By.css('#ActiveProofRequestsCard__new-btn > span'),
        ppWaitDefault,
      )
    ).click();

    await e2eWaitElementVisible(By.id('RequestProofForm'), ppWaitDefault);

    // Submit and check error text is displayed
    await (
      await e2eWaitElementVisible(
        By.css('#RequestProofForm__submit-btn > span'),
        ppWaitDefault,
      )
    ).click();

    await e2eWaitElementVisible(
      By.css('.ant-row:nth-child(1) .ant-form-item-explain'),
      ppWaitDefault,
    );

    await e2eWaitElementVisible(
      By.css('.ant-row:nth-child(3) .ant-form-item-explain'),
      ppWaitDefault,
    );

    await (
      await driver.findElement(By.css('#RequestProofForm__cancel-btn > span'))
    ).click();
  });
});
