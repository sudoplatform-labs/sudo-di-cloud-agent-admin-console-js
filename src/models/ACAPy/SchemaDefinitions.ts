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
 * Verifiable Credential Schemas.
 */
import { CloudAgentAPI } from '../../containers/App/AppContext';
import { reportCloudAgentError } from '../../utils/errorlog';
import {
  Schema,
  SchemaGetResults,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

export type SchemaDefinitionId = string;

export type SchemaDefinitionCreateParams = {
  name: string; // Human readable, descriptive name for the schema
  version: string; // Schema Version, which must be changed to modify any attributes
  attributes: string[]; // Schema attribute names in csv format
};

export async function createSchemaDefinition(
  agent: CloudAgentAPI,
  params: SchemaDefinitionCreateParams,
): Promise<void> {
  try {
    // Create new schema
    await agent.defineSchemas.schemasPost(
      {
        schema_version: params.version,
        schema_name: params.name,
        attributes: params.attributes,
      },
      agent.httpOptionOverrides.httpPostOptionOverrides,
    );
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Create Schema on Ledger',
      error,
    );
  }
}

export async function fetchSchemaDefinitionIds(
  agent: CloudAgentAPI,
  id?: string, // Schema Id
  did?: string, // Schema creator DID
  name?: string, // Schema Name
  version?: string, // Schema Version
): Promise<SchemaDefinitionId[]> {
  try {
    const schemaList = await agent.defineSchemas.schemasCreatedGet(
      id,
      did,
      name,
      version,
    );
    return schemaList.schema_ids ?? [];
  } catch (error) {
    throw await reportCloudAgentError(
      `Schema not found for creatorDID: ${did} schemaName: ${name} schemaVersion: ${version}`,
      error,
    );
  }
}

export async function fetchSchemaDefinitionDetails(
  agent: CloudAgentAPI,
  id: SchemaDefinitionId, // Schema Id
): Promise<Schema> {
  try {
    const ledgerSchema: SchemaGetResults = await agent.defineSchemas.schemasSchemaIdGet(
      id,
    );

    return ledgerSchema.schema ?? {};
  } catch (error) {
    throw await reportCloudAgentError(
      `Schema ${id} NOT FOUND on Ledger`,
      error,
    );
  }
}

export async function fetchAllAgentSchemaDefinitionIds(
  agent: CloudAgentAPI,
): Promise<SchemaDefinitionId[]> {
  try {
    const schemaList = await agent.defineSchemas.schemasCreatedGet();
    const schemaResults: SchemaDefinitionId[] = schemaList.schema_ids ?? [];
    return schemaResults;
  } catch (error) {
    throw await reportCloudAgentError(
      'Failed to Retrieve Defined Schema Identifiers from Cloud Agent',
      error,
    );
  }
}

export async function fetchAllAgentSchemaDefinitionDetails(
  agent: CloudAgentAPI,
): Promise<Schema[]> {
  const schemaList = await fetchAllAgentSchemaDefinitionIds(agent);
  const result = Promise.all(
    schemaList.map((id) => fetchSchemaDefinitionDetails(agent, id)),
  );

  return result;
}
