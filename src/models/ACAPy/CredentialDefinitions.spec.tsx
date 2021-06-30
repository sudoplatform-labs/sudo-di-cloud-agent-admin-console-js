import * as modelCredentialDefinitions from './CredentialDefinitions';
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
  CredentialDefinitionsCreatedResults,
  CredentialDefinitionGetResults,
  CredentialDefinitionSendRequest,
  CredentialDefinitionSendResults,
  CredentialDefinition,
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
// testing of the model-credential-definitions functionality.
const mockCredentialDefinitionsCreatedResults: CredentialDefinitionsCreatedResults = {
  credential_definition_ids: ['0', '1', '2'],
};

const mockCredentialDefinitionGetResults: CredentialDefinitionGetResults[] = [
  {
    credential_definition: {
      schemaId: 'SCHEMA_ID_0',
      type: 'CL',
      ver: '2.0',
      value: 'VALUES_0',
      id: 'CREDENTIAL_DEFINITION_ID_0',
      tag: 'CREDENTIAL_NAME_0',
    },
  },
  {
    credential_definition: {
      schemaId: 'SCHEMA_ID_1',
      type: 'CL',
      ver: '2.0',
      value: 'VALUES_1',
      id: 'CREDENTIAL_DEFINITION_ID_1',
      tag: 'CREDENTIAL_NAME_1',
    },
  },
  {
    credential_definition: {
      schemaId: 'SCHEMA_ID_2',
      type: 'CL',
      ver: '2.0',
      value: 'VALUES_2',
      id: 'CREDENTIAL_DEFINITION_ID_2',
      tag: 'CREDENTIAL_NAME_2',
    },
  },
];

const credentialDefinitionsCreatedResultsSpy = jest
  .spyOn(mockContext.defineCredentials, 'credentialDefinitionsCreatedGet')
  .mockResolvedValue(mockCredentialDefinitionsCreatedResults);

const credentialDefinitionsCredDefIdGetSpy = jest
  .spyOn(mockContext.defineCredentials, 'credentialDefinitionsCredDefIdGet')
  .mockImplementation(
    async (credDefId: string) =>
      mockCredentialDefinitionGetResults[parseInt(credDefId)],
  );

const credentialDefinitionsPostSpy = jest
  .spyOn(mockContext.defineCredentials, 'credentialDefinitionsPost')
  .mockImplementation(
    async (
      credDefInfo?: CredentialDefinitionSendRequest,
    ): Promise<CredentialDefinitionSendResults> => {
      const newCredDef: CredentialDefinitionGetResults = {
        credential_definition: {
          schemaId: credDefInfo?.schema_id,
          type: 'CL',
          ver: '2.0',
          value: 'TEST_VALUE_0',
          id: 'CREDENTIAL_DEFINITION_ID_0',
          tag: credDefInfo?.tag,
        },
      };
      mockCredentialDefinitionGetResults.push(newCredDef);
      return { credential_definition_id: credDefInfo?.tag };
    },
  );

// model-credential-definitions level data EXPECTED as a result
// of the di-cloud-agent-sdk mock elements being returned
const expectedCredentialIds: modelCredentialDefinitions.CredentialDefinitionId[] = [
  '0',
  '1',
  '2',
];

const expectedCredentialDefinitions: CredentialDefinition[] = [
  {
    id: 'CREDENTIAL_DEFINITION_ID_0',
    schemaId: 'SCHEMA_ID_0',
    type: 'CL',
    value: 'VALUES_0',
    tag: 'CREDENTIAL_NAME_0',
    ver: '2.0',
  },
  {
    id: 'CREDENTIAL_DEFINITION_ID_1',
    schemaId: 'SCHEMA_ID_1',
    type: 'CL',
    value: 'VALUES_1',
    tag: 'CREDENTIAL_NAME_1',
    ver: '2.0',
  },
  {
    id: 'CREDENTIAL_DEFINITION_ID_2',
    schemaId: 'SCHEMA_ID_2',
    type: 'CL',
    value: 'VALUES_2',
    tag: 'CREDENTIAL_NAME_2',
    ver: '2.0',
  },
];

describe('model-credential-definitions', () => {
  it('should get full credential identifier list', async () => {
    const result = await modelCredentialDefinitions.fetchCredentialDefinitionIds(
      mockContext,
    );
    expect(credentialDefinitionsCreatedResultsSpy).toBeCalled();
    expect(result).toEqual(expectedCredentialIds);
  });

  it('should get single credential details', async () => {
    let result = await modelCredentialDefinitions.fetchCredentialDefinitionDetails(
      mockContext,
      expectedCredentialIds[0],
    );
    expect(credentialDefinitionsCredDefIdGetSpy).toBeCalled();
    expect(result).toEqual(expectedCredentialDefinitions[0]);
    result = await modelCredentialDefinitions.fetchCredentialDefinitionDetails(
      mockContext,
      expectedCredentialIds[2],
    );
    expect(result).toEqual(expectedCredentialDefinitions[2]);
  });

  it('should get ALL credential details', async () => {
    const result = await modelCredentialDefinitions.fetchAllAgentCredentialDefinitionDetails(
      mockContext,
    );
    expect(credentialDefinitionsCreatedResultsSpy).toBeCalledTimes(1);
    expect(credentialDefinitionsCredDefIdGetSpy).toBeCalledTimes(3);
    expect(result).toEqual(expectedCredentialDefinitions);
  });

  it('should call create for new credential definition', async () => {
    await modelCredentialDefinitions.createCredentialDefinition(mockContext, {
      tag: 'NEW_CREDENTIAL',
      schema: '3',
      revocable: false,
    });

    expect(credentialDefinitionsPostSpy).toBeCalledTimes(1);
  });
});
