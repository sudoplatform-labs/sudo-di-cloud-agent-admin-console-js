import React from 'react';
import { EnvironmentInfo } from '../../environment';
import { FeatureFlag } from '../../feature-flags';
import {
  WalletApi,
  LedgerApi,
  ConnectionApi,
  CredentialDefinitionApi,
  CredentialsApi,
  IntroductionApi,
  SchemaApi,
  TrustpingApi,
  RevocationApi,
  IssueCredentialV10Api,
  IssueCredentialV20Api,
  PresentProofV10Api,
  PresentProofV20Api,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

// The Cloud Agent SDK exports each API as a class which
// we want to be accessible to the data model layer of the
// application.
export type CloudAgentAPI = {
  wallet: WalletApi;
  ledger: LedgerApi;
  introductions: IntroductionApi;
  connections: ConnectionApi;
  ping: TrustpingApi;
  defineSchemas: SchemaApi;
  defineCredentials: CredentialDefinitionApi;
  issueV10Credentials: IssueCredentialV10Api;
  issueV20Credentials: IssueCredentialV20Api;
  revocations: RevocationApi;
  credentials: CredentialsApi;
  presentV10Proofs: PresentProofV10Api;
  presentV20Proofs: PresentProofV20Api;
  httpOptionOverrides: {
    // Different Swagger SDK generators insert different HTTP
    // headers so we override ones that cause issues
    httpPostOptionOverrides: {};
  };
};

export interface AppState {
  environment: EnvironmentInfo;
  featureFlags: FeatureFlag[];
  cloudAgentAPIs: CloudAgentAPI;
}

export const AppContext = React.createContext<AppState>(undefined as never);
