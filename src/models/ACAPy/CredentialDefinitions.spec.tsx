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
  IssueCredentialV10Api,
  IssueCredentialV20Api,
  RevocationApi,
  CredentialsApi,
  PresentProofV10Api,
  PresentProofV20Api,
  CredentialDefinition,
  CredentialDefinitionsCreatedResult,
  CredentialDefinitionGetResult,
  CredentialDefinitionsCredDefIdGetRequest,
  CredentialDefinitionsPostRequest,
  TxnOrCredentialDefinitionSendResult,
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
// testing of the model-credential-definitions functionality.
const mockCredentialDefinitionsCreatedResults: CredentialDefinitionsCreatedResult =
  {
    credential_definition_ids: ['0', '1', '2'],
  };

const mockCredentialDefinitionGetResults: CredentialDefinitionGetResult[] = [
  {
    credential_definition: {
      schemaId: 'SCHEMA_ID_0',
      type: {},
      ver: '2.0',
      value: {},
      id: 'CREDENTIAL_DEFINITION_ID_0',
      tag: 'CREDENTIAL_NAME_0',
    },
  },
  {
    credential_definition: {
      schemaId: 'SCHEMA_ID_1',
      type: {},
      ver: '2.0',
      value: {},
      id: 'CREDENTIAL_DEFINITION_ID_1',
      tag: 'CREDENTIAL_NAME_1',
    },
  },
  {
    credential_definition: {
      schemaId: 'SCHEMA_ID_2',
      type: {},
      ver: '2.0',
      value: {},
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
    async (requestParams: CredentialDefinitionsCredDefIdGetRequest) =>
      mockCredentialDefinitionGetResults[parseInt(requestParams.credDefId)],
  );

const credentialDefinitionsPostSpy = jest
  .spyOn(mockContext.defineCredentials, 'credentialDefinitionsPost')
  .mockImplementation(
    async (
      credDefInfo?: CredentialDefinitionsPostRequest,
    ): Promise<TxnOrCredentialDefinitionSendResult> => {
      const newCredDef: CredentialDefinitionGetResult = {
        credential_definition: {
          schemaId: credDefInfo?.body?.schema_id,
          type: {},
          ver: '2.0',
          value: {},
          id: 'CREDENTIAL_DEFINITION_ID_0',
          tag: credDefInfo?.body?.tag,
        },
      };
      mockCredentialDefinitionGetResults.push(newCredDef);
      return { sent: { credential_definition_id: credDefInfo?.body?.tag } };
    },
  );

// model-credential-definitions level data EXPECTED as a result
// of the di-cloud-agent-sdk mock elements being returned
const expectedCredentialIds: modelCredentialDefinitions.CredentialDefinitionId[] =
  ['0', '1', '2'];

const expectedCredentialDefinitions: CredentialDefinition[] = [
  {
    id: 'CREDENTIAL_DEFINITION_ID_0',
    schemaId: 'SCHEMA_ID_0',
    type: {},
    value: {},
    tag: 'CREDENTIAL_NAME_0',
    ver: '2.0',
  },
  {
    id: 'CREDENTIAL_DEFINITION_ID_1',
    schemaId: 'SCHEMA_ID_1',
    type: {},
    value: {},
    tag: 'CREDENTIAL_NAME_1',
    ver: '2.0',
  },
  {
    id: 'CREDENTIAL_DEFINITION_ID_2',
    schemaId: 'SCHEMA_ID_2',
    type: {},
    value: {},
    tag: 'CREDENTIAL_NAME_2',
    ver: '2.0',
  },
];

describe('model-credential-definitions', () => {
  it('should get full credential identifier list', async () => {
    const result =
      await modelCredentialDefinitions.fetchCredentialDefinitionIds(
        mockContext,
      );
    expect(credentialDefinitionsCreatedResultsSpy).toBeCalled();
    expect(result).toEqual(expectedCredentialIds);
  });

  it('should get single credential details', async () => {
    let result =
      await modelCredentialDefinitions.fetchCredentialDefinitionDetails(
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
    const result =
      await modelCredentialDefinitions.fetchAllAgentCredentialDefinitionDetails(
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
