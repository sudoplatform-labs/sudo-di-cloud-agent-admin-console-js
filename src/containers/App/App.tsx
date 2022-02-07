import 'antd/dist/antd.css';
import { LoadingOutlined } from '@ant-design/icons';
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAsync } from 'react-use';
import styled from 'styled-components';
import { RouteRenderer } from '../../components/RouteRenderer';
import { SimplePage } from '../../components/SimplePage';
import { acapyConfig, EnvironmentInfo, uiConfig } from '../../environment';
import { getFeatureFlags } from '../../feature-flags';
import { AppContext, CloudAgentAPI } from './AppContext';
import { GlobalStyle } from './global-style';
import { getRoot } from './routes';
import {
  ConnectionApi,
  Configuration,
  CredentialsApi,
  CredentialDefinitionApi,
  IntroductionApi,
  IssueCredentialV10Api,
  IssueCredentialV20Api,
  LedgerApi,
  PresentProofV10Api,
  PresentProofV20Api,
  RevocationApi,
  SchemaApi,
  TrustpingApi,
  WalletApi,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  min-width: 300px;
  display: flex;
  flex-direction: column;
`;

/**
 * The <App> container provides the minimum context needed
 * to launch the app, including the environment config
 * (obtained via `environment.json`); and the Decentralized
 * Identity Cloud Agent APIs needed to perform agent
 * functions such as credential issuance, schema definition
 * etc.
 *
 */
export const App: React.FC = () => {
  const initState = useAsync(async () => {
    // Get the environment information for this instance of
    // the app.  The environment files are either served from the
    // web server root or when running a local yarn dev environment
    // will be pulled from the top level "public" directory.
    const uiConfigResponse = await fetch(uiConfig);
    const ourConfig = await uiConfigResponse.json();

    const acapyConfigResponse = await fetch(acapyConfig);
    const agentConfig = await acapyConfigResponse.json();

    const environmentInfo: EnvironmentInfo = {
      acapyAdminUri: agentConfig.acapyAdminUri,
      acapyAdminKey: agentConfig.acapyAdminKey,
      featureFlags: ourConfig.featureFlags,
    };

    // Create all the Decentralized Identity Cloud Agent APIs
    // along with the API Key and base URL to talk to the
    // agent.
    const cloudAgentConfiguration = new Configuration({
      apiKey: environmentInfo.acapyAdminKey,
      basePath: environmentInfo.acapyAdminUri,
      headers: { 'x-api-key': environmentInfo.acapyAdminKey },
    });

    const cloudAgentAPIs: CloudAgentAPI = {
      wallet: new WalletApi(cloudAgentConfiguration),
      ledger: new LedgerApi(cloudAgentConfiguration),
      introductions: new IntroductionApi(cloudAgentConfiguration),
      connections: new ConnectionApi(cloudAgentConfiguration),
      ping: new TrustpingApi(cloudAgentConfiguration),
      defineSchemas: new SchemaApi(cloudAgentConfiguration),
      defineCredentials: new CredentialDefinitionApi(cloudAgentConfiguration),
      issueV10Credentials: new IssueCredentialV10Api(cloudAgentConfiguration),
      issueV20Credentials: new IssueCredentialV20Api(cloudAgentConfiguration),
      revocations: new RevocationApi(cloudAgentConfiguration),
      credentials: new CredentialsApi(cloudAgentConfiguration),
      presentV10Proofs: new PresentProofV10Api(cloudAgentConfiguration),
      presentV20Proofs: new PresentProofV20Api(cloudAgentConfiguration),
      httpOptionOverrides: {
        httpPostOptionOverrides: {
          headers: { 'Content-Type': 'application/json' },
        },
      },
    };

    return {
      environmentInfo,
      featureFlags: getFeatureFlags(environmentInfo.featureFlags),
      cloudAgentAPIs,
    };
  }, []);

  // Wait for the initialisation to complete before rendering our top
  // level page, or error out.
  if (initState.error) {
    return <SimplePage className="app__error">Error loading app.</SimplePage>;
  } else if (initState.loading || !initState.value) {
    return (
      <SimplePage className="app__loading">
        <LoadingOutlined />
      </SimplePage>
    );
  } else {
    return (
      // Make the application context available to all components below
      // via the useContext(AppContext) React hook.
      // This needs to include access to the
      // Cloud Agent APIs, this instances runtime environment and any
      // feature flags.
      <AppContext.Provider
        value={{
          environment: initState.value.environmentInfo,
          featureFlags: initState.value.featureFlags,
          cloudAgentAPIs: initState.value.cloudAgentAPIs,
        }}>
        <GlobalStyle />
        <BrowserRouter>
          <Container>
            <Suspense fallback={<LoadingOutlined />}>
              <RouteRenderer routeFactory={getRoot} />
            </Suspense>
          </Container>
        </BrowserRouter>
      </AppContext.Provider>
    );
  }
};
