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
 * Verifiable Credential Definition.
 */
import { CredentialDefinition } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { CloudAgentAPI } from '../../containers/App/AppContext';
import { reportCloudAgentError } from '../../utils/errorlog';
import { SchemaDefinitionId } from './SchemaDefinitions';

export type CredentialDefinitionId = string;

export type CredentialDefinitionCreateParams = {
  tag: string; // Human readable, descriptive tag for credential definition
  schema: SchemaDefinitionId; // Identifier assigned at schema create time
  revocable: boolean; // Revocation supported for issued credentials
};

export async function fetchCredentialDefinitionIds(
  agent: CloudAgentAPI,
  id?: string, // Credential Definiition Id
  issuer_did?: string,
  schema_id?: string,
  schema_creator_did?: string,
  schema_name?: string,
  schema_version?: string,
): Promise<CredentialDefinitionId[]> {
  try {
    const credentialDefinitionsList = await agent.defineCredentials.credentialDefinitionsCreatedGet(
      id,
      issuer_did,
      schema_id,
      schema_creator_did,
      schema_name,
      schema_version,
    );
    return credentialDefinitionsList.credential_definition_ids ?? [];
  } catch (error) {
    throw await reportCloudAgentError(
      `Credential Definition not found for issuerDID: ${issuer_did} schemaId: ${schema_id}`,
      error,
    );
  }
}

export async function createCredentialDefinition(
  agent: CloudAgentAPI,
  params: CredentialDefinitionCreateParams,
): Promise<void> {
  try {
    await agent.defineCredentials.credentialDefinitionsPost(
      {
        tag: params.tag,
        support_revocation: params.revocable,
        schema_id: params.schema,
      },
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Create Credential Definition on Ledger',
      error,
    );
  }
}

export async function fetchCredentialDefinitionDetails(
  agent: CloudAgentAPI,
  id: CredentialDefinitionId,
): Promise<CredentialDefinition> {
  try {
    const ledgerCredDef = await agent.defineCredentials.credentialDefinitionsCredDefIdGet(
      id,
    );

    return ledgerCredDef.credential_definition ?? {};
  } catch (error) {
    throw await reportCloudAgentError(
      `Credential Definition ${id} NOT FOUND on Ledger`,
      error,
    );
  }
}

export async function fetchAllAgentCredentialDefinitionIds(
  agent: CloudAgentAPI,
): Promise<CredentialDefinitionId[]> {
  try {
    const credentialDefinitionList = await agent.defineCredentials.credentialDefinitionsCreatedGet();
    const credentialDefinitionResults: CredentialDefinitionId[] =
      credentialDefinitionList.credential_definition_ids ?? [];
    return credentialDefinitionResults;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Credential Identifiers from Cloud Agent',
      error,
    );
  }
}

export async function fetchAllAgentCredentialDefinitionDetails(
  agent: CloudAgentAPI,
): Promise<CredentialDefinition[]> {
  const credDefList = await fetchAllAgentCredentialDefinitionIds(agent);
  const result = Promise.all(
    credDefList.map(
      async (id) => await fetchCredentialDefinitionDetails(agent, id),
    ),
  );

  return result;
}
