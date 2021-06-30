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
  IssueCredentialApi,
  RevocationApi,
  CredentialsApi,
  PresentProofApi,
  ConnectionList,
  ConnRecord,
  InvitationResult,
  ReceiveInvitationRequest,
  InvitationConnectionTargetRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

const mockContext: CloudAgentAPI = {
  wallet: new WalletApi(),
  ledger: new LedgerApi(),
  introductions: new IntroductionApi(),
  connections: new ConnectionApi(),
  ping: new TrustpingApi(),
  defineSchemas: new SchemaApi(),
  defineCredentials: new CredentialDefinitionApi(),
  issueCredentials: new IssueCredentialApi(),
  revocations: new RevocationApi(),
  credentials: new CredentialsApi(),
  proofs: new PresentProofApi(),
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
      accept: ConnRecord.AcceptEnum.Auto,
      their_did: '4W7DjqPZZykkp5RsqyiUM4',
      inbound_connection_id: '',
      their_label: 'Aries Cloud Agent',
      updated_at: '2020-09-15 03:11:54.545692Z',
      state: 'active',
      my_did: '67sknz4XatdDb7AgZaziye',
      connection_id: '4ae609cd-0811-4582-9204-97af2fbf2eef',
      invitation_key: 'Evcm83UGndYYuSL65ErwGASvAjT5kTUPduKh7V2A6THg',
      request_id: '',
      their_role: ConnRecord.TheirRoleEnum.Invitee,
      error_msg: '',
      invitation_mode: ConnRecord.InvitationModeEnum.Once,
      routing_state: ConnRecord.RoutingStateEnum.None,
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
      _body?: InvitationConnectionTargetRequest,
      _alias?: string,
      _auto_accept?: boolean,
      _multi_use?: boolean,
      _public?: boolean,
      _options?: any,
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
      _body?: ReceiveInvitationRequest,
      _alias?: string,
      _auto_accept?: boolean,
      _options?: any,
    ): Promise<ConnRecord> => {
      const newConnection: ConnRecord = {};
      return newConnection;
    },
  );

const connectionsConnIdRemovePostSpy = jest
  .spyOn(mockContext.connections, 'connectionsConnIdDelete')
  .mockImplementation(
    async (_conn_id: string, _options?: any): Promise<Response> => {
      return new Response();
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
    accept: ConnRecord.AcceptEnum.Auto,
    inbound_connection_id: '',
    alias: 'TEST_ALIAS_1',
    my_did: '67sknz4XatdDb7AgZaziye',
    their_did: '4W7DjqPZZykkp5RsqyiUM4',
    their_label: 'Aries Cloud Agent',
    their_role: ConnRecord.TheirRoleEnum.Invitee,
    invitation_key: 'Evcm83UGndYYuSL65ErwGASvAjT5kTUPduKh7V2A6THg',
    request_id: '',
    invitation_mode: ConnRecord.InvitationModeEnum.Once,
    routing_state: ConnRecord.RoutingStateEnum.None,
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
        mode: ConnRecord.AcceptEnum.Auto,
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
      mode: ConnRecord.AcceptEnum.Auto,
      invitation: {},
    });
    expect(connectionsReceiveInvitationPostSpy).toBeCalledTimes(1);
  });

  it('should call delete for connection', async () => {
    await modelConnections.deleteConnection(mockContext, 'NEW_CONNECTION_ID');
    expect(connectionsConnIdRemovePostSpy).toBeCalledTimes(1);
  });
});
