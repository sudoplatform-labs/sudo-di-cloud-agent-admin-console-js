import React from 'react';
import { CredentialDefinitionsCard } from './CredentialDefinitionsCard';
import { acwMount } from '../../../../test/enzyme';
import * as modelCredentialDefinitions from '../../../../models/ACAPy/CredentialDefinitions';
import * as modelTAA from '../../../../models/ACAPy/TransactionAuthorAgreement';
import { CredentialDefinitionsList } from './CredentialDefinitionsList';
import {
  AppState,
  AppContext,
  CloudAgentAPI,
} from '../../../../containers/App/AppContext';
import { EnvironmentInfo } from '../../../../environment';
import * as FeatureFlags from '../../../../feature-flags';
import {
  WalletApi,
  LedgerApi,
  ConnectionApi,
  IntroductionApi,
  TrustpingApi,
  SchemaApi,
  CredentialDefinitionApi,
  IssueCredentialV10Api,
  IssueCredentialV20Api,
  RevocationApi,
  CredentialsApi,
  PresentProofV10Api,
  PresentProofV20Api,
  CredentialDefinition,
  TAAInfo,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { Button, Modal } from 'antd';
import { act } from 'react-dom/test-utils';
import { changeFormInput, submitForm } from '../../../../test/form';

const mockEnvironment: EnvironmentInfo = {
  acapyAdminUri: 'localhost:3000/',
  acapyAdminKey: 'testkey',
  featureFlags: ['EXAMPLE_FEATURE'],
};

const mockContext: AppState = {
  environment: mockEnvironment,
  featureFlags: [FeatureFlags.FeatureFlag.EXAMPLE_FEATURE],
  cloudAgentAPIs: {
    wallet: new WalletApi(),
    ledger: new LedgerApi(),
    introductions: new IntroductionApi(),
    connections: new ConnectionApi(),
    ping: new TrustpingApi(),
    defineSchemas: new SchemaApi(),
    defineCredentials: new CredentialDefinitionApi(),
    issueV10Credentials: new IssueCredentialV10Api(),
    issueV20Credentials: new IssueCredentialV20Api(),
    revocations: new RevocationApi(),
    credentials: new CredentialsApi(),
    presentV10Proofs: new PresentProofV10Api(),
    presentV20Proofs: new PresentProofV20Api(),
    httpOptionOverrides: {
      httpPostOptionOverrides: {},
    },
  },
};

const mockCredentialDefinitions: CredentialDefinition[] = [
  {
    id: 'TEST_CREDENTIAL_ID_0',
    schemaId: 'TEST_SCHEMA_ID_0',
    type: {},
    value: {},
    tag: 'TEST_CREDENTIAL_TAG_0',
    ver: 'TEST_LEDGER_NODE_VERSION',
  },
];

const fetchAllAgentCredentialDefinitionDetailsSpy = jest
  .spyOn(modelCredentialDefinitions, 'fetchAllAgentCredentialDefinitionDetails')
  .mockResolvedValue(mockCredentialDefinitions);

const createCredentialDefinitionSpy = jest
  .spyOn(modelCredentialDefinitions, 'createCredentialDefinition')
  .mockImplementation(
    async (
      cloudAgentAPI: CloudAgentAPI,
      credDefInfo: modelCredentialDefinitions.CredentialDefinitionCreateParams,
    ) => {
      const newCredDef: CredentialDefinition = {
        id: 'TEST_CREDENTIAL_ID_1',
        schemaId: credDefInfo.schema,
        type: {},
        value: {},
        tag: credDefInfo.tag,
        ver: 'TEST_LEDGER_NODE_VERSION',
      };
      mockCredentialDefinitions.push(newCredDef);
    },
  );

const mockTaa: TAAInfo = {
  taa_required: false,
};

const fetchLedgerTaaSpy = jest
  .spyOn(modelTAA, 'fetchLedgerTaa')
  .mockResolvedValue(mockTaa);

describe('CredentialDefinitionsCard', () => {
  it('should get credential list', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <CredentialDefinitionsCard />
      </AppContext.Provider>,
    );
    const credentialDefinitionsList = component.find(CredentialDefinitionsList);
    expect(fetchAllAgentCredentialDefinitionDetailsSpy).toBeCalled();
    expect(credentialDefinitionsList.prop('dataSource')).toBe(
      mockCredentialDefinitions,
    );
  });

  it('should expand a credential definition row', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <CredentialDefinitionsCard />
      </AppContext.Provider>,
    );

    const credentialDefinitionRow = component
      .find(CredentialDefinitionsList)
      .findWhere((node) => {
        return node.prop('rowKey') === mockCredentialDefinitions[0].id;
      });

    await act(async () => {
      credentialDefinitionRow.find('AntdIcon').simulate('click');
    });

    component.update();
    expect(credentialDefinitionRow).toMatchSnapshot();
    // JC*** how do you check expansion happened ???
  });

  it('should open, add credential definition modal', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <CredentialDefinitionsCard />
      </AppContext.Provider>,
    );
    const addButton = component
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'CredentialDefinitionsCard__create-btn',
      );

    await act(async () => {
      addButton.simulate('click');
    });

    component.update();
    const modal = component.find(Modal);
    expect(modal.prop('visible')).toBe(true);
  });

  it('should close, add credential definition modal', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <CredentialDefinitionsCard />
      </AppContext.Provider>,
    );
    const addButton = component
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'CredentialDefinitionsCard__create-btn',
      );
    await act(async () => {
      addButton.simulate('click');
    });
    component.update();
    const modal = component.find(Modal);
    expect(modal.prop('visible')).toBe(true);

    const cancelButton = modal
      .find(Button)
      .filterWhere(
        (node) =>
          node.prop('id') === 'CreateCredentialDefinitionForm__cancel-btn',
      );
    await act(async () => {
      cancelButton.simulate('click');
    });
    component.update();
    const updatedModal = component.find(Modal);
    expect(updatedModal.prop('visible')).toBe(false);
  });

  it('should add a new credential definition and display', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <CredentialDefinitionsCard />
      </AppContext.Provider>,
    );
    const addButton = component
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'CredentialDefinitionsCard__create-btn',
      );
    await act(async () => {
      addButton.simulate('click');
    });
    component.update();
    const credentialForm = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create Credential Definition',
      );
    expect(credentialForm.prop('visible')).toBe(true);

    await act(async () => {
      await changeFormInput(credentialForm, 'tag', 'TEST_CREDENTIAL_TAG_NEW');
      // Must be a valid schema syntax because it is validated by the form !
      await changeFormInput(
        credentialForm,
        'schemaId',
        'NYBvswA8j4ZfvFRhZLqnov:2:Drivers License:1.0',
      );
    });

    await submitForm(credentialForm);
    component.update();
    const updatedForm = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create Credential Definition',
      );
    expect(fetchAllAgentCredentialDefinitionDetailsSpy).toBeCalledTimes(3);
    expect(fetchLedgerTaaSpy).toBeCalledTimes(1);
    expect(createCredentialDefinitionSpy).toBeCalledTimes(1);
    expect(updatedForm.prop('visible')).toBe(false);
    const credentialDefinitionsList = component.find(CredentialDefinitionsList);
    expect(credentialDefinitionsList.prop('dataSource')).toBe(
      mockCredentialDefinitions,
    );
  });
});
