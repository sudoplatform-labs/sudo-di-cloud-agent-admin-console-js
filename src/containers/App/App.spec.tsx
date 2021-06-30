import { shallow } from 'enzyme';
import * as React from 'react';
import { mockComponent } from '../../test/mock-component';
import * as ReactUse from 'react-use';
import { uiConfig, EnvironmentInfo } from '../../environment';
import { acwMount } from '../../test/enzyme';
import { App } from './App';
import { AppContext } from './AppContext';
import * as FeatureFlags from '../../feature-flags';
import {
  WalletApi,
  LedgerApi,
  IntroductionApi,
  ConnectionApi,
  TrustpingApi,
  SchemaApi,
  CredentialDefinitionApi,
  IssueCredentialApi,
  RevocationApi,
  CredentialsApi,
  PresentProofApi,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

const mockEnvironment: EnvironmentInfo = {
  acapyAdminUri: 'localhost:3000/',
  acapyAdminKey: 'testkey',
  featureFlags: ['EXAMPLE_FEATURE'],
};

const fetchSpy = jest.spyOn(window, 'fetch');
mockComponent('../../components/RouteRenderer/RouteRenderer', 'RouteRenderer');

AppContext['Provider'] = function MockAppContextProvider(props: any) {
  return <div>{props.children}</div>;
} as any;

describe('containers/App', () => {
  beforeEach(() => {
    fetchSpy.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockEnvironment),
    } as any);
  });

  it('should render', async () => {
    jest.spyOn(ReactUse, 'useAsync').mockReturnValueOnce({
      loading: false,
      error: undefined,
      value: {
        environmentInfo: 'ENVIRONMENT',
        featureFlags: [FeatureFlags.FeatureFlag.EXAMPLE_FEATURE],
      },
    });
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should show loading state', async () => {
    fetchSpy.mockReturnValueOnce(new Promise(() => undefined));

    const wrapper = await acwMount(<App />);
    expect(wrapper.find('.app__loading').exists()).toBe(true);
  });

  it('should handle environment.json load error', async () => {
    fetchSpy.mockRejectedValue(new Error('ERROR!'));

    const wrapper = await acwMount(<App />);
    expect(wrapper.find('.app__error').exists()).toBe(true);
  });

  it('should set AppContext state', async () => {
    const wrapper = await acwMount(<App />);

    expect(fetchSpy).toBeCalledWith(uiConfig);
    expect(wrapper.find(AppContext.Provider).prop('value')).toMatchObject({
      environment: mockEnvironment,
      featureFlags: [FeatureFlags.FeatureFlag.EXAMPLE_FEATURE],
      cloudAgentAPIs: {
        wallet: expect.any(WalletApi),
        ledger: expect.any(LedgerApi),
        introductions: expect.any(IntroductionApi),
        connections: expect.any(ConnectionApi),
        ping: expect.any(TrustpingApi),
        defineSchemas: expect.any(SchemaApi),
        defineCredentials: expect.any(CredentialDefinitionApi),
        issueCredentials: expect.any(IssueCredentialApi),
        revocations: expect.any(RevocationApi),
        credentials: expect.any(CredentialsApi),
        proofs: expect.any(PresentProofApi),
      },
    });
  });
});
