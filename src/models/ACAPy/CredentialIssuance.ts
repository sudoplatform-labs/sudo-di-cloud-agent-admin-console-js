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
  CredentialPreview,
  IndyCredInfo,
  IssueCredentialRecordsGetRoleEnum,
  IssueCredentialRecordsGetStateEnum,
  V10CredentialExchange,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { reportCloudAgentError } from '../../utils/errorlog';

export type InitiatorValues = 'self' | 'external';

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
  role?: IssueCredentialRecordsGetRoleEnum;
  states?: IssueCredentialRecordsGetStateEnum[];
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
    await agent.credentials.credentialCredentialIdDelete({ credentialId: id });
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
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdDelete({
      credExId: id,
    });
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
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdProblemReportPost(
      {
        credExId: id,
        body: { description: reason },
      },
    );
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdDelete({
      credExId: id,
    });
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

    await agent.issueV10Credentials.issueCredentialSendProposalPost({
      body: agentRequest,
    });
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
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdSendOfferPost(
      {
        credExId: id,
      },
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
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdSendRequestPost(
      {
        credExId: id,
      },
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
  comment?: string, // Optional comment
): Promise<void> {
  try {
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdIssuePost({
      credExId: id,
      body: { comment: comment },
    });
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
    await agent.issueV10Credentials.issueCredentialRecordsCredExIdStorePost({
      credExId: id,
    });
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
    const agentResult =
      await agent.issueV10Credentials.issueCredentialRecordsGet({
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
            record.state as IssueCredentialRecordsGetStateEnum,
          )),
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
): Promise<IndyCredInfo[]> {
  try {
    const agentResult = await agent.credentials.credentialsGet({});
    const result = agentResult.results ?? [];

    return result;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Credential List from Wallet',
      error,
    );
  }
}
