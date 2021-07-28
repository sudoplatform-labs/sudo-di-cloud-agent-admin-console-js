// We use snake_case in the models modules for protocol related
// fields because the Aries RFCs
// define the protocol using that schema.  Originally I attempted to
// convert to camel case here to isolate that peculiarity, however that
// resulted in confusion when comparing to on-the-wire data. In addition
// because of an issue with OpenAPI code generation of typescript-fetch,
// if we don't use 'orginal' for the names output the generated
// api doesn't match the json objects returned in responses.
/*
 * This module contains all routines and definitions required to
 * interface with the Cloud Agent service for activities related to
 * Connections to other Decentralized Identity Agents.
 */
import { CloudAgentAPI } from '../../containers/App/AppContext';
import {
  ConnRecord,
  ConnRecordAcceptEnum,
  InvitationResult,
  ReceiveInvitationRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { reportCloudAgentError } from '../../utils/errorlog';

export type ConnectionInvitationParams = {
  alias: string; // Our assigned human friendly name to use for the connection
  mode: ConnRecordAcceptEnum; // Manual or Automatic acceptance of invites
  multi: boolean; // Single or multi use invitation
  public: boolean; // whether to use the Agents public DID or create a peer DID
};

export type ConnectionAcceptParams = {
  alias: string; // Our assigned human friendly name to use for the connection
  mode: ConnRecordAcceptEnum; // Manual or Automatic acceptance of invites
  invitation: ReceiveInvitationRequest; // Received invitation details
};

// Function to use as compare method in sort
// for record update times.
export function compareConnectionUpdateTimes(
  a: ConnRecord,
  b: ConnRecord,
): number {
  if (a.updated_at && b.updated_at) {
    return b.updated_at > a.updated_at
      ? 1
      : b.updated_at < a.updated_at
      ? -1
      : 0;
  } else if (a.updated_at) {
    return -1;
  } else {
    return 1;
  }
}

export async function createConnectionInvite(
  agent: CloudAgentAPI,
  params: ConnectionInvitationParams,
): Promise<InvitationResult> {
  // Get the agents connections and unpack them into our data
  // model.
  try {
    const result = await agent.connections.connectionsCreateInvitationPost({
      alias: params.alias,
      autoAccept: params.mode === ConnRecordAcceptEnum.Auto ? true : false,
      multiUse: params.multi,
      _public: params.public,
      body: undefined,
    });

    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Create a connection invitation',
      error,
    );
  }
}

export async function acceptConnectionInvite(
  agent: CloudAgentAPI,
  params: ConnectionAcceptParams,
): Promise<void> {
  try {
    await agent.connections.connectionsReceiveInvitationPost({
      alias: params.alias,
      autoAccept: params.mode === ConnRecordAcceptEnum.Auto ? true : false,
      mediationId: undefined,
      body: params.invitation,
    });
  } catch (error) {
    throw await reportCloudAgentError('Failed to Accept invitation', error);
  }
}

export async function deleteConnection(
  agent: CloudAgentAPI,
  id: string,
): Promise<void> {
  try {
    await agent.connections.connectionsConnIdDelete({ connId: id });
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Delete connection: ${id}`,
      error,
    );
  }
}

export async function trustPingConnection(
  agent: CloudAgentAPI,
  id: string,
): Promise<void> {
  try {
    await agent.ping.connectionsConnIdSendPingPost({
      connId: id,
      body: undefined,
    });
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Ping connection: ${id}`,
      error,
    );
  }
}

export async function fetchAllAgentConnectionDetails(
  agent: CloudAgentAPI,
): Promise<ConnRecord[]> {
  try {
    const agentResult = await agent.connections.connectionsGet({});

    const result = agentResult.results ?? [];
    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Connection List from Wallet',
      error,
    );
  }
}
