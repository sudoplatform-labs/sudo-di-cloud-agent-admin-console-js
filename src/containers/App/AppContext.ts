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
  IssueCredentialApi,
  SchemaApi,
  PresentProofApi,
  TrustpingApi,
  RevocationApi,
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
  issueCredentials: IssueCredentialApi;
  revocations: RevocationApi;
  credentials: CredentialsApi;
  proofs: PresentProofApi;
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
