import * as modelConnections from './Connections';
import { CloudAgentAPI } from '../../containers/App/AppContext';
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
  ConnectionList,
  ConnRecord,
  InvitationResult,
  ConnRecordAcceptEnum,
  ConnRecordTheirRoleEnum,
  ConnRecordInvitationModeEnum,
  ConnRecordRoutingStateEnum,
  ConnectionsReceiveInvitationPostRequest,
  ConnectionsConnIdDeleteRequest,
  ConnectionsCreateInvitationPostRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

const mockContext: CloudAgentAPI = {
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
};

// di-cloud-agent-sdk mock elements to allow
// testing of the model-connections functionality.

const mockConnectionsGetResults: ConnectionList = {
  results: [
    {
      alias: 'TEST_ALIAS_1',
      created_at: '2020-09-14 02:08:00.662753Z',
      accept: ConnRecordAcceptEnum.Auto,
      their_did: '4W7DjqPZZykkp5RsqyiUM4',
      inbound_connection_id: '',
      their_label: 'Aries Cloud Agent',
      updated_at: '2020-09-15 03:11:54.545692Z',
      state: 'active',
      my_did: '67sknz4XatdDb7AgZaziye',
      connection_id: '4ae609cd-0811-4582-9204-97af2fbf2eef',
      invitation_key: 'Evcm83UGndYYuSL65ErwGASvAjT5kTUPduKh7V2A6THg',
      request_id: '',
      their_role: ConnRecordTheirRoleEnum.Invitee,
      error_msg: '',
      invitation_mode: ConnRecordInvitationModeEnum.Once,
      routing_state: ConnRecordRoutingStateEnum.None,
    },
    {
      alias: 'TEST_ALIAS_MISSING_FIELDS',
    },
  ],
};

const connectionsGetSpy = jest
  .spyOn(mockContext.connections, 'connectionsGet')
  .mockResolvedValue(mockConnectionsGetResults);

const connectionsCreateInvitationPostSpy = jest
  .spyOn(mockContext.connections, 'connectionsCreateInvitationPost')
  .mockImplementation(
    async (
      _request: ConnectionsCreateInvitationPostRequest,
    ): Promise<InvitationResult> => {
      const newInvite: InvitationResult = {
        connection_id: 'NEW_CONNECTION_ID',
        invitation_url: 'http://www.new.connection?c_i=base64',
        invitation: {
          did: 'NEW_CONNECTION_DID',
          id: 'NEW_CONNECTION_ID',
        },
      };
      mockConnectionsGetResults.results!.push(newInvite);
      return newInvite;
    },
  );

const connectionsReceiveInvitationPostSpy = jest
  .spyOn(mockContext.connections, 'connectionsReceiveInvitationPost')
  .mockImplementation(
    async (
      _request: ConnectionsReceiveInvitationPostRequest,
    ): Promise<ConnRecord> => {
      const newConnection: ConnRecord = {};
      return newConnection;
    },
  );

const connectionsConnIdRemovePostSpy = jest
  .spyOn(mockContext.connections, 'connectionsConnIdDelete')
  .mockImplementation(
    async (_request: ConnectionsConnIdDeleteRequest): Promise<object> => {
      return {};
    },
  );

// model-decentralized-identifier level data EXPECTED as a result
// of the di-cloud-agent-sdk mock elements being returned
const expectedConnections: ConnRecord[] = [
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
  },
];

describe('model-connections', () => {
  it('should get full set of connections', async () => {
    const result = await modelConnections.fetchAllAgentConnectionDetails(
      mockContext,
    );
    expect(connectionsGetSpy).toBeCalled();
    expect(result).toEqual(expectedConnections);
  });

  it('should call create for new Invite', async () => {
    const newInvite = await modelConnections.createConnectionInvite(
      mockContext,
      {
        alias: 'MY_INVITE',
        mode: ConnRecordAcceptEnum.Auto,
        multi: false,
        public: false,
      },
    );
    expect(connectionsCreateInvitationPostSpy).toBeCalledTimes(1);
    expect(newInvite).toStrictEqual({
      connection_id: 'NEW_CONNECTION_ID',
      invitation_url: 'http://www.new.connection?c_i=base64',
      invitation: {
        did: 'NEW_CONNECTION_DID',
        id: 'NEW_CONNECTION_ID',
      },
    });
  });

  it('should call accept for Invite', async () => {
    await modelConnections.acceptConnectionInvite(mockContext, {
      alias: 'MY_INVITE',
      mode: ConnRecordAcceptEnum.Auto,
      invitation: {},
    });
    expect(connectionsReceiveInvitationPostSpy).toBeCalledTimes(1);
  });

  it('should call delete for connection', async () => {
    await modelConnections.deleteConnection(mockContext, 'NEW_CONNECTION_ID');
    expect(connectionsConnIdRemovePostSpy).toBeCalledTimes(1);
  });
});
