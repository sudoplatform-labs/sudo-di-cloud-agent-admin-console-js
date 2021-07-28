import React from 'react';
import { SchemaDefinitionsCard } from './SchemaDefinitionsCard';
import { acwMount } from '../../../../test/enzyme';
import * as modelSchemaDefinitions from '../../../../models/ACAPy/SchemaDefinitions';
import * as modelTAA from '../../../../models/ACAPy/TransactionAuthorAgreement';
import { SchemaDefinitionsList } from './SchemaDefinitionsList';
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
  Schema,
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

const mockSchemaDefinitions: Schema[] = [
  {
    id: 'TEST_SCHEMA_ID_0',
    name: 'TEST_SCHEMA_NAME_0',
    version: '0.1',
    seqNo: 5,
    attrNames: ['TEST_ATTRIBUTE_0', 'TEST_ATTRIBUTE_1'],
    ver: 'TEST_LEDGER_NODE_VERSION',
  },
];

const fetchAllAgentSchemaDefinitionDetailsSpy = jest
  .spyOn(modelSchemaDefinitions, 'fetchAllAgentSchemaDefinitionDetails')
  .mockResolvedValue(mockSchemaDefinitions);

const createSchemaDefinitionSpy = jest
  .spyOn(modelSchemaDefinitions, 'createSchemaDefinition')
  .mockImplementation(
    async (
      cloudAgentAPI: CloudAgentAPI,
      schemaDefInfo: modelSchemaDefinitions.SchemaDefinitionCreateParams,
    ) => {
      const newSchemaDef: Schema = {
        id: 'TEST_SCHEMA_ID_1',
        name: schemaDefInfo.name,
        version: schemaDefInfo.version,
        seqNo: 9,
        attrNames: schemaDefInfo.attributes,
        ver: 'TEST_LEDGER_NODE_VERSION',
      };
      mockSchemaDefinitions.push(newSchemaDef);
    },
  );

const mockTaa: TAAInfo = {
  taa_required: false,
};

const fetchLedgerTaaSpy = jest
  .spyOn(modelTAA, 'fetchLedgerTaa')
  .mockResolvedValue(mockTaa);

describe('SchemaDefinitionsCard', () => {
  it('should get schema list', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <SchemaDefinitionsCard />
      </AppContext.Provider>,
    );
    const schemaDefinitionsList = component.find(SchemaDefinitionsList);
    expect(fetchAllAgentSchemaDefinitionDetailsSpy).toBeCalled();
    expect(schemaDefinitionsList.prop('dataSource')).toBe(
      mockSchemaDefinitions,
    );
  });

  it('should expand a schema definition row', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <SchemaDefinitionsCard />
      </AppContext.Provider>,
    );

    const schemaDefinitionRow = component
      .find(SchemaDefinitionsList)
      .findWhere((node) => {
        return node.prop('rowKey') === mockSchemaDefinitions[0].id;
      });

    await act(async () => {
      schemaDefinitionRow.find('AntdIcon').simulate('click');
    });

    component.update();
    expect(schemaDefinitionRow).toMatchSnapshot();
    // JC*** how do you check expansion happened ???
  });

  it('should open, add schema definition modal', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <SchemaDefinitionsCard />
      </AppContext.Provider>,
    );
    const addButton = component
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'SchemaDefinitionsCard__create-btn',
      );

    await act(async () => {
      addButton.simulate('click');
    });

    component.update();
    const modal = component.find(Modal);
    expect(modal.prop('visible')).toBe(true);
  });

  it('should close, add schema definition modal', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <SchemaDefinitionsCard />
      </AppContext.Provider>,
    );
    const addButton = component
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'SchemaDefinitionsCard__create-btn',
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
        (node) => node.prop('id') === 'CreateSchemaDefinitionForm__cancel-btn',
      );
    await act(async () => {
      cancelButton.simulate('click');
    });
    component.update();
    const updatedModal = component.find(Modal);
    expect(updatedModal.prop('visible')).toBe(false);
  });

  it('should add a new schema definition and display', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <SchemaDefinitionsCard />
      </AppContext.Provider>,
    );
    const addButton = component
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'SchemaDefinitionsCard__create-btn',
      );
    await act(async () => {
      addButton.simulate('click');
    });
    component.update();
    const modal = component.find(Modal);
    expect(modal.prop('visible')).toBe(true);

    await act(async () => {
      await changeFormInput(modal, 'schemaName', 'TEST_SCHEMA_NAME_NEW');
      await changeFormInput(modal, 'schemaVersion', '0.1');
      await changeFormInput(
        modal,
        'attributes',
        'attribute_one attribute_two attribute_three',
      );
    });

    await submitForm(modal);
    component.update();
    const updatedModal = component.find(Modal);
    expect(fetchAllAgentSchemaDefinitionDetailsSpy).toBeCalledTimes(3);
    expect(fetchLedgerTaaSpy).toBeCalledTimes(1);
    expect(createSchemaDefinitionSpy).toBeCalledTimes(1);
    expect(updatedModal.prop('visible')).toBe(false);
    const schemaDefinitionsList = component.find(SchemaDefinitionsList);
    expect(schemaDefinitionsList.prop('dataSource')).toBe(
      mockSchemaDefinitions,
    );
  });
});
