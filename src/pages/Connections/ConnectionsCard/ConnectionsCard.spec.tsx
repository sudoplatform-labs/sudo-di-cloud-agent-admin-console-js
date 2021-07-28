import React from 'react';
import { ConnectionsCard } from './ConnectionsCard';
import { acwMount } from '../../../test/enzyme';
import * as modelConnections from '../../../models/ACAPy/Connections';
import { ConnectionsList } from './ConnectionsList';
import {
  AppState,
  AppContext,
  CloudAgentAPI,
} from '../../../containers/App/AppContext';
import { EnvironmentInfo } from '../../../environment';
import * as FeatureFlags from '../../../feature-flags';
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
  ConnRecord,
  InvitationResult,
  ConnRecordAcceptEnum,
  ConnRecordTheirRoleEnum,
  ConnRecordInvitationModeEnum,
  ConnRecordRoutingStateEnum,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { Button, Modal } from 'antd';
import { act } from 'react-dom/test-utils';
import { changeFormInput, submitForm } from '../../../test/form';

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

const mockConnections: ConnRecord[] = [
  {
    connection_id: '4ae609cd-0811-4582-9204-97af2fbf2eef',
    state: 'active',
    created_at: '2020-09-14 02:08:00.662753Z',
    updated_at: '2020-09-15 03:11:54.545692Z',
    accept: ConnRecordAcceptEnum.Auto,
    inbound_connection_id: '',
    alias: 'TEST_ALIAS_1',
    my_did: '67sknz4XatdDb7AgZaziye',
    their_did: '4W7DjqPZZykkp5RsqyiUM4',
    their_label: 'Aries Cloud Agent',
    their_role: ConnRecordTheirRoleEnum.Invitee,
    invitation_key: 'Evcm83UGndYYuSL65ErwGASvAjT5kTUPduKh7V2A6THg',
    request_id: '',
    invitation_mode: ConnRecordInvitationModeEnum.Once,
    routing_state: ConnRecordRoutingStateEnum.None,
    error_msg: '',
  },
  {
    alias: 'TEST_ALIAS_MISSING_FIELDS',
    their_role: ConnRecordTheirRoleEnum.Inviter,
    routing_state: ConnRecordRoutingStateEnum.None,
  },
];

const fetchAllAgentConnectionDetailsSpy = jest
  .spyOn(modelConnections, 'fetchAllAgentConnectionDetails')
  .mockResolvedValue(mockConnections);

const createConnectionInviteSpy = jest
  .spyOn(modelConnections, 'createConnectionInvite')
  .mockImplementation(
    async (
      cloudAgentAPI: CloudAgentAPI,
      connectParams: modelConnections.ConnectionInvitationParams,
    ): Promise<InvitationResult> => {
      const newConnection: ConnRecord = {
        connection_id: 'CREATED_INVITE_ID',
        state: 'invite',
        accept: connectParams.mode,
        alias: connectParams.alias,
        my_did: '67sknz4XatdDb7AgZaziye',
        their_did: '4W7DjqPZZykkp5RsqyiUM4',
        their_label: 'Aries Cloud Agent',
        their_role: ConnRecordTheirRoleEnum.Invitee,
        invitation_key: 'Evcm83UGndYYuSL65ErwGASvAjT5kTUPduKh7V2A6THg',
        invitation_mode: connectParams.multi
          ? ConnRecordInvitationModeEnum.Multi
          : ConnRecordInvitationModeEnum.Once,
        routing_state: ConnRecordRoutingStateEnum.None,
      };
      mockConnections.push(newConnection);
      return {
        connection_id: newConnection.connection_id,
        invitation_url:
          'http://192.168.65.3:8100?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiYjU0MzAyYjgtMWE3OC00ZTI4LTgzOGQtMjJkY2I3N2YxZDU2IiwgInJlY2lwaWVudEtleXMiOiBbIko1dldaUUFGSHIxaE1hb1dmTjlyZHVEdnlONmRCTjNCaWQ2NUplTjJnY2Q1Il0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovLzE5Mi4xNjguNjUuMzo4MTAwIiwgImxhYmVsIjogIkFyaWVzIENsb3VkIEFnZW50In0=',
      };
    },
  );

describe('ConnectionsCard', () => {
  it('should get connection list', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <ConnectionsCard />
      </AppContext.Provider>,
    );
    const connectionsList = component.find(ConnectionsList);
    expect(fetchAllAgentConnectionDetailsSpy).toBeCalled();
    expect(connectionsList.prop('dataSource')).toBe(mockConnections);
  });

  it('should open, create invitation form', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <ConnectionsCard />
      </AppContext.Provider>,
    );
    const createButton = component
      .find(Button)
      .filterWhere((node) => node.prop('id') === 'ConnectionsCard__create-btn');
    await act(async () => {
      createButton.simulate('click');
    });
    component.update();

    const modal = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create DIDComm Invitation',
      );
    expect(modal.prop('visible')).toBe(true);
  });

  it('should close, create invitation form', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <ConnectionsCard />
      </AppContext.Provider>,
    );
    const createButton = component
      .find(Button)
      .filterWhere((node) => node.prop('id') === 'ConnectionsCard__create-btn');
    await act(async () => {
      createButton.simulate('click');
    });
    component.update();

    const modal = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create DIDComm Invitation',
      );
    expect(modal.prop('visible')).toBe(true);

    const cancelButton = modal
      .find(Button)
      .filterWhere(
        (node) => node.prop('id') === 'CreateInvitationForm__cancel-btn',
      );
    await act(async () => {
      cancelButton.simulate('click');
    });
    component.update();
    const updatedModal = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create DIDComm Invitation',
      );
    expect(updatedModal.prop('visible')).toBe(false);
  });

  it('should create a new connection invitation and display', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <ConnectionsCard />
      </AppContext.Provider>,
    );

    const createButton = component
      .find(Button)
      .filterWhere((node) => node.prop('id') === 'ConnectionsCard__create-btn');
    await act(async () => {
      createButton.simulate('click');
    });
    component.update();

    const inviteForm = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create DIDComm Invitation',
      );
    expect(inviteForm.prop('visible')).toBe(true);

    await act(async () => {
      await changeFormInput(
        inviteForm,
        'CreateInvitationForm_alias',
        'TEST_NEW_ALIAS',
      );
    });

    await submitForm(inviteForm);
    component.update();
    const updatedInviteForm = component
      .find(Modal)
      .filterWhere(
        (node) => node.prop('title') === 'Create DIDComm Invitation',
      );

    expect(createConnectionInviteSpy).toBeCalledTimes(1);
    expect(updatedInviteForm.prop('visible')).toBe(false);
    const connectionsList = component.find(ConnectionsList);
    expect(connectionsList.prop('dataSource')).toBe(mockConnections);
  });
});

it('should open, accept invitation form', async () => {
  const component = await acwMount(
    <AppContext.Provider value={mockContext}>
      <ConnectionsCard />
    </AppContext.Provider>,
  );
  const createButton = component
    .find(Button)
    .filterWhere((node) => node.prop('id') === 'ConnectionsCard__accept-btn');
  await act(async () => {
    createButton.simulate('click');
  });
  component.update();

  const modal = component
    .find(Modal)
    .filterWhere((node) => node.prop('title') === 'Accept DIDComm Invitation');
  expect(modal.prop('visible')).toBe(true);
});

it('should close, accept invitation form', async () => {
  const component = await acwMount(
    <AppContext.Provider value={mockContext}>
      <ConnectionsCard />
    </AppContext.Provider>,
  );
  const createButton = component
    .find(Button)
    .filterWhere((node) => node.prop('id') === 'ConnectionsCard__accept-btn');
  await act(async () => {
    createButton.simulate('click');
  });
  component.update();

  const modal = component
    .find(Modal)
    .filterWhere((node) => node.prop('title') === 'Accept DIDComm Invitation');
  expect(modal.prop('visible')).toBe(true);

  const cancelButton = modal
    .find(Button)
    .filterWhere(
      (node) => node.prop('id') === 'AcceptInvitationForm__cancel-btn',
    );
  await act(async () => {
    cancelButton.simulate('click');
  });
  component.update();
  const updatedModal = component
    .find(Modal)
    .filterWhere((node) => node.prop('title') === 'Accept DIDComm Invitation');
  expect(updatedModal.prop('visible')).toBe(false);
});
