import { RouteDefinitionFactory } from '../../routes';
import * as Pages from '../../pages';
import { createRouteRedirect } from '../../components/RouteRenderer';

export const getConsoleRoutesRoot: RouteDefinitionFactory = () => ({
  path: '/console',
  component: createRouteRedirect('/console/dashboard'),
  routes: [
    {
      path: '/console/dashboard',
      component: Pages.ConsoleDashboard,
      displayName: 'Cloud Agent Dashboard',
      iconName: 'home',
      iconClass: 'colored-icon',
      showInSidebar: true,
    },
    {
      path: '/console/settings',
      component: Pages.Settings,
      displayName: 'Settings',
      iconName: 'settings',
      iconClass: 'colored-icon',
      showInSidebar: true,
    },
    {
      path: '/console/decentralized-identifiers',
      component: Pages.DecentralizedIdentifiersDashboard,
      displayName: 'Decentralized Identifiers',
      iconName: 'icon-did-line',
      iconClass: 'colored-icon',
      showInSidebar: true,
    },
    {
      path: '/console/connections',
      component: Pages.ConnectionsDashboard,
      displayName: 'Connections',
      iconName: 'icon-connection-line',
      iconClass: 'colored-icon',
      showInSidebar: true,
    },
    {
      path: '/console/holder-wallet',
      component: createRouteRedirect('/console/holder-wallet/credentials'),
      displayName: 'Holder Wallet',
      iconName: 'icon-wallet-line',
      iconClass: 'colored-icon',
      showInSidebar: true,
      routes: [
        {
          path: '/console/holder-wallet/credentials',
          component: Pages.Credentials,
          displayName: 'My Credentials',
          showInSidebar: true,
        },
        {
          path: '/console/holder-wallet/proofs',
          component: Pages.PresentedProofs,
          displayName: 'My Proof Presentations',
          showInSidebar: true,
        },
      ],
    },
    {
      path: '/console/credential-issuer',
      component: createRouteRedirect('/console/credential-issuer/dashboard'),
      displayName: 'Credential Issuer',
      iconName: 'icon-issuer-line',
      iconClass: 'colored-icon',
      showInSidebar: true,
      routes: [
        {
          path: '/console/credential-issuer/dashboard',
          component: Pages.CredentialIssuerDashboard,
          displayName: 'Dashboard',
          showInSidebar: true,
        },
        {
          path: '/console/credential-issuer/credential-catalogue',
          component: Pages.CredentialCatalogue,
          displayName: 'Catalogue',
          showInSidebar: true,
        },
        {
          path: '/console/credential-issuer/credential-requests',
          component: Pages.CredentialIssuance,
          displayName: 'Credential Issuance',
          showInSidebar: true,
        },
      ],
    },
    {
      path: '/console/credential-verifier',
      component: createRouteRedirect('/console/credential-verifier/dashboard'),
      displayName: 'Credential Verifier',
      iconName: 'icon-verifier-line',
      iconClass: 'colored-icon',
      showInSidebar: true,
      routes: [
        {
          path: '/console/credential-verifier/dashboard',
          component: Pages.CredentialVerifierDashboard,
          displayName: 'Dashboard',
          showInSidebar: true,
        },
        {
          path: '/console/credential-verifier/proofs',
          component: Pages.RequestedProofs,
          displayName: 'Proof Requests',
          showInSidebar: true,
        },
      ],
    },
  ],
});
