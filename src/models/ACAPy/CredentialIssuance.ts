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
 * Verifiable Credential Issuance.
 */
import { CloudAgentAPI } from '../../containers/App/AppContext';
import {
  ConnRecord,
  CredBrief,
  CredentialPreview,
  V10CredentialExchange,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { reportCloudAgentError } from '../../utils/errorlog';

export type InitiatorValues = 'self' | 'external';
export type RoleValues = 'holder' | 'issuer';
export type CredentialExchangeState =
  | 'proposal_sent'
  | 'proposal_received'
  | 'offer_sent'
  | 'offer_received'
  | 'request_sent'
  | 'request_received'
  | 'credential_issued'
  | 'credential_received'
  | 'credential_acked';

export type CredentialRequestParams = {
  schema_name?: string; // Name of a schema to request credentials for
  schema_version?: string; // An explicit schema version to request with name
  schema_creator_did?: string; // Explicit creator of schema qualification
  schema_id?: string; // Explicit schema Id to request credentials for
  credential_definition_id?: string; // Explicit issuer bound credential definition to request
  credential_issuer_did?: string; // Explicit issuer of Credential qualification
  connection_id: string; // The DIDComm connection to send request over
  proposal?: CredentialPreview; // Explicit attributes requested in credential
  comment?: string; // Human readable comment to send with the request to issuer
  trace?: boolean; // Whether to trace the agent protocol actions
  auto_remove?: boolean; // Whether to remove the credential exchange record on completion
};

export type CredentialExchangeRecordFilterParams = {
  connection?: string; // DIDComm conneciton Id
  thread?: string; // Protocol Thread Id
  role?: RoleValues;
  states?: CredentialExchangeState[];
};

export type CredentialExchangeData = {
  record: V10CredentialExchange;
  connection?: ConnRecord;
};

// Function to use as compare method in sort
// of PresentationExchangeData by record update times.
export function compareCredentialExchangeDataUpdateTimes(
  a: CredentialExchangeData,
  b: CredentialExchangeData,
): number {
  if (a.record.updated_at && b.record.updated_at) {
    return b.record.updated_at > a.record.updated_at
      ? 1
      : b.record.updated_at < a.record.updated_at
      ? -1
      : 0;
  } else if (a.record.updated_at) {
    return -1;
  } else {
    return 1;
  }
}

export async function deleteCredential(
  agent: CloudAgentAPI,
  id: string, // Credential Id
): Promise<void> {
  try {
    await agent.credentials.credentialCredentialIdDelete(id);
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Delete credential: ${id}`,
      error,
    );
  }
}

export async function deleteCredentialExchangeRecord(
  agent: CloudAgentAPI,
  id: string, // Credential Exchange Record Id
): Promise<void> {
  try {
    await agent.issueCredentials.issueCredentialRecordsCredExIdDelete(id);
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Delete Credential Exchange Record: ${id}`,
      error,
    );
  }
}

export async function abortCredentialExchange(
  agent: CloudAgentAPI,
  id: string, // Credential Exchange Record Id
  reason: string,
): Promise<void> {
  try {
    await agent.issueCredentials.issueCredentialRecordsCredExIdProblemReportPost(
      id,
      { explain_ltxt: reason },
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
    await agent.issueCredentials.issueCredentialRecordsCredExIdDelete(id);
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Abort Credential Issue: ${id}`,
      error,
    );
  }
}

export async function proposeCredential(
  agent: CloudAgentAPI,
  params: CredentialRequestParams,
): Promise<void> {
  try {
    const agentRequest = {
      cred_def_id: params.credential_definition_id,
      issuer_did: params.credential_issuer_did,
      trace: params.trace,
      schema_id: params.schema_id,
      schema_issuer_did: params.schema_creator_did,
      auto_remove: params.auto_remove,
      schema_name: params.schema_name,
      schema_version: params.schema_version,
      credential_proposal: params.proposal,
      comment: params.comment,
      connection_id: params.connection_id,
    };

    await agent.issueCredentials.issueCredentialSendProposalPost(
      agentRequest,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Propose credential: ${
        params.credential_definition_id ??
        params.schema_id ??
        params.schema_name ??
        params.connection_id
      }`,
      error,
    );
  }
}

export async function offerCredential(
  agent: CloudAgentAPI,
  id: string, // Credential Exchange Record Id
): Promise<void> {
  try {
    await agent.issueCredentials.issueCredentialRecordsCredExIdSendOfferPost(
      id,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Offer Credential : ${id}`,
      error,
    );
  }
}

export async function requestProposedCredential(
  agent: CloudAgentAPI,
  id: string, // Credential Exchange Record Id
): Promise<void> {
  try {
    await agent.issueCredentials.issueCredentialRecordsCredExIdSendRequestPost(
      id,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Request proposed Credential : ${id}`,
      error,
    );
  }
}

export async function issueCredential(
  agent: CloudAgentAPI,
  id: string, // Credential Exchange Record Id
): Promise<void> {
  try {
    await agent.issueCredentials.issueCredentialRecordsCredExIdIssuePost(
      id,
      undefined,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Issue requested Credential : ${id}`,
      error,
    );
  }
}

export async function storeCredential(
  agent: CloudAgentAPI,
  id: string, // Credential Exchange Record Id
): Promise<void> {
  try {
    await agent.issueCredentials.issueCredentialRecordsCredExIdStorePost(
      id,
      undefined,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Store Credential : ${id}`,
      error,
    );
  }
}

export async function fetchFilteredCredentialExchangeRecords(
  agent: CloudAgentAPI,
  params: CredentialExchangeRecordFilterParams,
): Promise<V10CredentialExchange[]> {
  try {
    const agentResult = await agent.issueCredentials.issueCredentialRecordsGet(
      params.connection,
      params.role,
      undefined,
      params.thread,
    );
    const recordList = agentResult.results ?? [];
    const result = recordList.filter(
      (record) =>
        params.states === undefined ||
        (record.state !== undefined &&
          params.states.includes(record.state as CredentialExchangeState)),
    );
    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Credential Exchange Records from Wallet',
      error,
    );
  }
}

export async function fetchAllAgentOwnedCredentialDetails(
  agent: CloudAgentAPI,
): Promise<CredBrief[]> {
  try {
    const agentResult = await agent.credentials.credentialsGet();
    const result = agentResult.results ?? [];

    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Credential List from Wallet',
      error,
    );
  }
}
