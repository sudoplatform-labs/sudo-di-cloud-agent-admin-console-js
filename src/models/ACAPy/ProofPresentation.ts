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
 * Proof Presentation by the Decentralized Identity Agents.
 */
import {
  ConnRecord,
  IndyCredPrecis,
  V10PresentationExchange,
  V10PresentationRequest,
  V10PresentationSendRequestRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { CloudAgentAPI } from '../../containers/App/AppContext';
import { reportCloudAgentError } from '../../utils/errorlog';

export type RoleValues = 'prover' | 'verifier';
export type V10IndyProofExchangeState =
  | 'proposal_sent'
  | 'proposal_received'
  | 'request_sent'
  | 'request_received'
  | 'presentation_sent'
  | 'presentation_received'
  | 'verified'
  | 'presentation_acked';

export type ProofExchangeRecordFilterParams = {
  connection?: string; // DIDComm connection Id
  thread?: string; // Protocol Thread Id
  role?: RoleValues;
  states?: V10IndyProofExchangeState[];
};

export type CredentialsToPresentationMatchingParams = {
  presentation: string; // Proof Exchange request Id to match against
  max?: number; // Maximum credentials to return at once
  start?: number; // Index into results to start returned values
  credentials?: string[]; // Credential Ids to limit results to
};

export type PresentationParams = {
  presentation: string; // Proof Exchange request Is to match against
  values: V10PresentationRequest; // Presentation Attributes and values
};

export type PresentationExchangeData = {
  record: V10PresentationExchange;
  connection?: ConnRecord;
};

// Function to use as compare method in sort
// of PresentationExchangeData by record update times.
export function comparePresentationExchangeDataUpdateTimes(
  a: PresentationExchangeData,
  b: PresentationExchangeData,
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

export async function fetchFilteredProofExchangeRecords(
  agent: CloudAgentAPI,
  params: ProofExchangeRecordFilterParams,
): Promise<V10PresentationExchange[]> {
  try {
    const agentResult = await agent.proofs.presentProofRecordsGet(
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
          params.states.includes(record.state as V10IndyProofExchangeState)),
    );
    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Proof Exchange Records from Wallet',
      error,
    );
  }
}

export async function sendProofRequest(
  agent: CloudAgentAPI,
  request: V10PresentationSendRequestRequest,
): Promise<void> {
  try {
    const agentRequest = {
      connection_id: request.connection_id,
      comment: request.comment,
      trace: request.trace,
      proof_request: {
        name: request.proof_request.name ?? 'Proof Request',
        nonce: request.proof_request.nonce,
        version: request.proof_request.version ?? '1.0',
        non_revoked: request.proof_request.non_revoked,
        requested_attributes: request.proof_request.requested_attributes,
        requested_predicates: request.proof_request.requested_predicates,
      },
    };

    await agent.proofs.presentProofSendRequestPost(
      agentRequest,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(`Failed to Send Proof Request`, error);
  }
}

export async function deleteProofExchange(
  agent: CloudAgentAPI,
  id: string, // Proof Exchange Record Id
): Promise<void> {
  try {
    await agent.proofs.presentProofRecordsPresExIdDelete(id);
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Delete Proof Exchange Record: ${id}`,
      error,
    );
  }
}

export async function fetchCredentialsMatchingProof(
  agent: CloudAgentAPI,
  params: CredentialsToPresentationMatchingParams,
): Promise<IndyCredPrecis[]> {
  try {
    const referents = params.credentials?.join();
    const agentResult = await agent.proofs.presentProofRecordsPresExIdCredentialsGet(
      params.presentation,
      params.max?.toString(),
      undefined,
      referents,
      params.start?.toString(),
    );

    return agentResult;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to match Proof with credentials from Wallet',
      error,
    );
  }
}

export async function sendProofPresentation(
  agent: CloudAgentAPI,
  params: PresentationParams,
): Promise<void> {
  try {
    const presentation: V10PresentationRequest = params.values;
    await agent.proofs.presentProofRecordsPresExIdSendPresentationPost(
      params.presentation,
      presentation,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to send Proof Presentation to verifier',
      error,
    );
  }
}

export async function verifyProofPresentation(
  agent: CloudAgentAPI,
  id: string, // Proof Presentation Exchange Id
): Promise<void> {
  try {
    await agent.proofs.presentProofRecordsPresExIdVerifyPresentationPost(
      id,
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to verify Proof Presentation',
      error,
    );
  }
}
