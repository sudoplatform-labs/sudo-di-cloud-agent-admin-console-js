import * as modelDecentralizedIdentifiers from './DecentralizedIdentifiers';
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
  DIDResult,
  DIDList,
  DID,
  DIDPostureEnum,
  LedgerRegisterNymPostRequest,
  RegisterLedgerNymResponse,
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
// testing of the model-decentralized-identifier functionality.

const mockWalletDidGetResults: DIDList = {
  results: [
    {
      did: '5nELRaChxTyqDEurGYZZyT',
      posture: DIDPostureEnum.Public,
      verkey: '3c6nUXA18htaacKzWyPRJmgCiJX3bNmVNAbXZUpuqdeC',
    },
    {
      did: '7GcTXxLAZh2G4NcheNYUzs',
      posture: DIDPostureEnum.Posted,
      verkey: '4RBUKvnhzZFEJa9EuySNhW2RyGYf6C3MvNSNvXNhynxk',
    },
    {
      did: 'B8JdVGJ67ezkNy8kYRVEc8',
      posture: DIDPostureEnum.WalletOnly,
      verkey: '6X6qU9uATxvXKedxET9PzThuYgbBn8ohf9mycVVwUiWR',
    },
  ],
};

const walletDidGetSpy = jest
  .spyOn(mockContext.wallet, 'walletDidGet')
  .mockResolvedValue(mockWalletDidGetResults);

const walletDidCreatePostSpy = jest
  .spyOn(mockContext.wallet, 'walletDidCreatePost')
  .mockImplementation(async (): Promise<DIDResult> => {
    const newDID: DIDResult = {
      result: {
        did: 'NEW_PRIVATE_DID',
        posture: DIDPostureEnum.WalletOnly,
        verkey: 'NEW_VERIFICATION_KEY',
      },
    };
    mockWalletDidGetResults.results!.push(newDID.result!);
    return newDID;
  });

const ledgerRegisterNymPostSpy = jest
  .spyOn(mockContext.ledger, 'ledgerRegisterNymPost')
  .mockImplementation(
    async (
      request: LedgerRegisterNymPostRequest,
    ): Promise<RegisterLedgerNymResponse> => {
      const existingDID = mockWalletDidGetResults.results?.find(
        (obj) => obj.did === request.did,
      );
      if (existingDID) {
        return { success: true };
      } else {
        throw new Error('DID not Found in Wallet');
      }
    },
  );

// model-decentralized-identifier level data EXPECTED as a result
// of the di-cloud-agent-sdk mock elements being returned
const expectedDIDs: DID[] = [
  {
    did: '5nELRaChxTyqDEurGYZZyT',
    posture: DIDPostureEnum.Public,
    verkey: '3c6nUXA18htaacKzWyPRJmgCiJX3bNmVNAbXZUpuqdeC',
  },
  {
    did: '7GcTXxLAZh2G4NcheNYUzs',
    posture: DIDPostureEnum.Posted,
    verkey: '4RBUKvnhzZFEJa9EuySNhW2RyGYf6C3MvNSNvXNhynxk',
  },
  {
    did: 'B8JdVGJ67ezkNy8kYRVEc8',
    posture: DIDPostureEnum.WalletOnly,
    verkey: '6X6qU9uATxvXKedxET9PzThuYgbBn8ohf9mycVVwUiWR',
  },
];

describe('model-decentralized-identifiers', () => {
  it('should get full set of decentralized identifiers', async () => {
    const result = await modelDecentralizedIdentifiers.fetchAllAgentDIDs(
      mockContext,
    );
    expect(walletDidGetSpy).toBeCalled();
    expect(result).toEqual(expectedDIDs);
  });

  it('should call create for new private DID', async () => {
    const newDID = await modelDecentralizedIdentifiers.createPrivateDID(
      mockContext,
    );

    expect(walletDidCreatePostSpy).toBeCalledTimes(1);
    expect(newDID).toStrictEqual({
      did: 'NEW_PRIVATE_DID',
      posture: DIDPostureEnum.WalletOnly,
      verkey: 'NEW_VERIFICATION_KEY',
    });
  });

  it('should call write to ledger for private DID', async () => {
    await modelDecentralizedIdentifiers.writeDIDToLedger(
      mockContext,
      expectedDIDs[2].did!,
      expectedDIDs[2].verkey!,
    );

    expect(ledgerRegisterNymPostSpy).toBeCalledTimes(1);
  });

  it('should throw for DID not existing in wallet', async () => {
    expect(
      modelDecentralizedIdentifiers.writeDIDToLedger(
        mockContext,
        'BAD_DID',
        '3c6nUXA18htaacKzWyPRJmgCiJX3bNmVNAbXZUpuqdeC',
      ),
    ).rejects.toThrow();

    expect(ledgerRegisterNymPostSpy).toBeCalledTimes(1);
  });
});
