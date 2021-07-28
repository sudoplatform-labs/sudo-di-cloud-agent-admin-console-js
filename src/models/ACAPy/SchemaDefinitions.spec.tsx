import * as modelSchemaDefinitions from './SchemaDefinitions';
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
  Schema,
  SchemaGetResult,
  TxnOrSchemaSendResult,
  SchemasPostRequest,
  SchemasCreatedResult,
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
// testing of the model-schema-definitions functionality.
const mockSchemasCreatedGetResults: SchemasCreatedResult = {
  schema_ids: ['0', '1', '2'],
};

const mockSchemaDefinitionGetResults: SchemaGetResult[] = [
  {
    schema: {
      name: 'SCHEMA_NAME_0',
      id: '0',
      version: '0.1',
      seqNo: 5,
      ver: '2.0',
      attrNames: ['attribute_one'],
    },
  },
  {
    schema: {
      name: 'SCHEMA_NAME_1',
      id: '1',
      version: '0.2',
      seqNo: 9,
      ver: '2.0',
      attrNames: ['attribute_one', 'attribute_two'],
    },
  },
  {
    schema: {
      name: 'SCHEMA_NAME_2',
      id: '2',
      version: '0.3',
      seqNo: 12,
      ver: '2.0',
      attrNames: ['attribute_one', 'attribute_two', 'attribute_three'],
    },
  },
];

const schemasCreatedGetResultsSpy = jest
  .spyOn(mockContext.defineSchemas, 'schemasCreatedGet')
  .mockResolvedValue(mockSchemasCreatedGetResults);

const schemaSchemasIdGetSpy = jest
  .spyOn(mockContext.defineSchemas, 'schemasSchemaIdGet')
  .mockImplementation(
    async (request) =>
      mockSchemaDefinitionGetResults[parseInt(request.schemaId)],
  );

const schemaDefinitionsPostSpy = jest
  .spyOn(mockContext.defineSchemas, 'schemasPost')
  .mockImplementation(
    async (request: SchemasPostRequest): Promise<TxnOrSchemaSendResult> => {
      const newSchemaDef: SchemaGetResult = {
        schema: {
          name: request.body?.schema_name,
          id: '3',
          version: request.body?.schema_version,
          seqNo: 15,
          ver: '2.0',
          attrNames: request.body?.attributes,
        },
      };
      mockSchemaDefinitionGetResults.push(newSchemaDef);
      return {
        sent: {
          schema_id: newSchemaDef.schema?.id ?? '',
          schema: newSchemaDef.schema,
        },
      };
    },
  );

// model-credential-definitions level data EXPECTED as a result
// of the di-cloud-agent-sdk mock elements being returned
const expectedSchemaIds: modelSchemaDefinitions.SchemaDefinitionId[] = [
  '0',
  '1',
  '2',
];

const expectedSchemaDefinitions: Schema[] = [
  {
    id: '0',
    name: 'SCHEMA_NAME_0',
    version: '0.1',
    seqNo: 5,
    attrNames: ['attribute_one'],
    ver: '2.0',
  },
  {
    id: '1',
    name: 'SCHEMA_NAME_1',
    version: '0.2',
    seqNo: 9,
    attrNames: ['attribute_one', 'attribute_two'],
    ver: '2.0',
  },
  {
    id: '2',
    name: 'SCHEMA_NAME_2',
    version: '0.3',
    seqNo: 12,
    attrNames: ['attribute_one', 'attribute_two', 'attribute_three'],
    ver: '2.0',
  },
];

describe('model-schema-definitions', () => {
  it('should get full schema identifier list', async () => {
    const result = await modelSchemaDefinitions.fetchSchemaDefinitionIds(
      mockContext,
    );
    expect(schemasCreatedGetResultsSpy).toBeCalled();
    expect(result).toEqual(expectedSchemaIds);
  });

  it('should get single schema details', async () => {
    let result = await modelSchemaDefinitions.fetchSchemaDefinitionDetails(
      mockContext,
      expectedSchemaIds[0],
    );
    expect(schemaSchemasIdGetSpy).toBeCalled();
    expect(result).toEqual(expectedSchemaDefinitions[0]);
    result = await modelSchemaDefinitions.fetchSchemaDefinitionDetails(
      mockContext,
      expectedSchemaIds[2],
    );
    expect(result).toEqual(expectedSchemaDefinitions[2]);
  });

  it('should get ALL schema details', async () => {
    const result =
      await modelSchemaDefinitions.fetchAllAgentSchemaDefinitionDetails(
        mockContext,
      );
    expect(schemasCreatedGetResultsSpy).toBeCalledTimes(1);
    expect(schemaSchemasIdGetSpy).toBeCalledTimes(3);
    expect(result).toEqual(expectedSchemaDefinitions);
  });

  it('should call create for new credential definition', async () => {
    await modelSchemaDefinitions.createSchemaDefinition(mockContext, {
      name: 'NEW_SCHEMA',
      version: '3.0',
      attributes: ['attribute_one', 'attribute_two'],
    });

    expect(schemaDefinitionsPostSpy).toBeCalledTimes(1);
  });
});
