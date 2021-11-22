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
  IndyPresSpec,
  PresentProofRecordsGetRoleEnum,
  PresentProofRecordsGetStateEnum,
  V10PresentationExchange,
  V10PresentationSendRequestRequest,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { CloudAgentAPI } from '../../containers/App/AppContext';
import { reportCloudAgentError } from '../../utils/errorlog';

export type ProofExchangeRecordFilterParams = {
  connection?: string; // DIDComm connection Id
  thread?: string; // Protocol Thread Id
  role?: PresentProofRecordsGetRoleEnum;
  states?: PresentProofRecordsGetStateEnum[];
};

export type CredentialsToPresentationMatchingParams = {
  presentation: string; // Proof Exchange request Id to match against
  max?: number; // Maximum credentials to return at once
  start?: number; // Index into results to start returned values
  credentials?: string[]; // Credential Ids to limit results to
};

export type PresentationParams = {
  presentation: string; // Proof Exchange Identifier, request Is to match against
  values: IndyPresSpec; // Presentation Attributes and values
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
    const agentResult = await agent.presentV10Proofs.presentProofRecordsGet({
      connectionId: params.connection,
      role: params.role,
      threadId: params.thread,
    });
    const recordList = agentResult.results ?? [];
    const result = recordList.filter(
      (record) =>
        params.states === undefined ||
        (record.state !== undefined &&
          params.states.includes(
            record.state as PresentProofRecordsGetStateEnum,
          )),
    );
    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Proof Exchange Records from Wallet',
      error as Response,
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

    await agent.presentV10Proofs.presentProofSendRequestPost({
      body: agentRequest,
    });
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Send Proof Request`,
      error as Response,
    );
  }
}

export async function deleteProofExchange(
  agent: CloudAgentAPI,
  id: string, // Proof Exchange Record Id
): Promise<void> {
  try {
    await agent.presentV10Proofs.presentProofRecordsPresExIdDelete({
      presExId: id,
    });
  } catch (error) {
    throw await reportCloudAgentError(
      `Failed to Delete Proof Exchange Record: ${id}`,
      error as Response,
    );
  }
}

export async function fetchCredentialsMatchingProof(
  agent: CloudAgentAPI,
  params: CredentialsToPresentationMatchingParams,
): Promise<IndyCredPrecis[]> {
  try {
    const referents = params.credentials?.join();
    const agentResult =
      await agent.presentV10Proofs.presentProofRecordsPresExIdCredentialsGet({
        presExId: params.presentation,
        count: params.max?.toString(),
        referent: referents,
        start: params.start?.toString(),
      });
    return agentResult;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to match Proof with credentials from Wallet',
      error as Response,
    );
  }
}

export async function sendProofPresentation(
  agent: CloudAgentAPI,
  params: PresentationParams,
): Promise<void> {
  try {
    const presentationSpecification: IndyPresSpec = params.values;
    await agent.presentV10Proofs.presentProofRecordsPresExIdSendPresentationPost(
      {
        presExId: params.presentation,
        body: presentationSpecification,
      },
    );
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to send Proof Presentation to verifier',
      error as Response,
    );
  }
}

export async function verifyProofPresentation(
  agent: CloudAgentAPI,
  id: string, // Proof Presentation Exchange Id
): Promise<void> {
  try {
    await agent.presentV10Proofs.presentProofRecordsPresExIdVerifyPresentationPost(
      {
        presExId: id,
      },
    );
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to verify Proof Presentation',
      error as Response,
    );
  }
}
