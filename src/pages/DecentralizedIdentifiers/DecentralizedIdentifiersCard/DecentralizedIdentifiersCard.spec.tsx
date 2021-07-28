import React from 'react';
import { DecentralizedIdentifiersCard } from '.';
import { acwMount } from '../../../test/enzyme';
import * as modelDecentralizedIdentifier from '../../../models/ACAPy/DecentralizedIdentifiers';
import { DecentralizedIdentifiersList } from './DecentralizedIdentifiersList';
import { AppState, AppContext } from '../../../containers/App/AppContext';
import { EnvironmentInfo } from '../../../environment';
import * as FeatureFlags from '../../../feature-flags';
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
  DID,
  DIDPostureEnum,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { Button } from 'antd';
import { act } from 'react-dom/test-utils';

const mockEnvironment: EnvironmentInfo = {
  acapyAdminUri: 'localhost:3000/',
  acapyAdminKey: 'testkey',
  featureFlags: ['EXAMPLE_FEATURE'],
};

const mockContext: AppState = {
  environment: mockEnvironment,
  featureFlags: [FeatureFlags.FeatureFlag.EXAMPLE_FEATURE],
  cloudAgentAPIs: {
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
  },
};

const mockDIDs: DID[] = [
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

const fetchAllAgentDIDsSpy = jest
  .spyOn(modelDecentralizedIdentifier, 'fetchAllAgentDIDs')
  .mockResolvedValue(mockDIDs);

describe('DecentralizedIdentifiersCard', () => {
  it('should get DID list', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <DecentralizedIdentifiersCard />
      </AppContext.Provider>,
    );
    const didList = component.find(DecentralizedIdentifiersList);
    expect(fetchAllAgentDIDsSpy).toBeCalled();
    expect(didList.prop('dataSource')).toBe(mockDIDs);
  });

  // This test suite is limited due to the inability to access
  // modal elements in tests.  Modal dialogs are rendered outside
  // the wrapper context created by jest up at the "document"
  // level.  An effective way to resolve this needs to be found
  // when time permits.
  it('should open, create DID modal confirm', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <DecentralizedIdentifiersCard />
      </AppContext.Provider>,
    );
    const createButton = component
      .find(Button)
      .filterWhere(
        (node) =>
          node.prop('id') === 'DecentralizedIdentifiersCard__create-btn',
      );

    await act(async () => {
      createButton.simulate('click');
    });

    component.update();
    // Work out how to get Modal to work inside wrapper rather than
    // at document level which is not testable.
  });

  it('should close, create DID modal confirm', async () => {
    const component = await acwMount(
      <AppContext.Provider value={mockContext}>
        <DecentralizedIdentifiersCard />
      </AppContext.Provider>,
    );
    const createButton = component
      .find(Button)
      .filterWhere(
        (node) =>
          node.prop('id') === 'DecentralizedIdentifiersCard__create-btn',
      );

    await act(async () => {
      createButton.simulate('click');
    });
    component.update();
    // Work out how to get Modal to work inside wrapper rather than
    // at document level which is not testable.
  });
});
