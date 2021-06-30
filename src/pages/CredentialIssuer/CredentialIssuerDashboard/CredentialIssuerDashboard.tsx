import React from 'react';
import { FeatureUnavailable } from '../../FeatureUnavailable';

export const CredentialIssuerDashboard: React.FC = () => {
  return (
    <FeatureUnavailable
      pageHeading="Credential Issuer"
      ctaHeading="Credential Creation Administration"
      ctaDescription={`
        Create Schema and Credential Definitions, Issue Verifiable Credentials
        to Customers.
        `}
      ctaSubDescription={`
        More details coming soon
        `}
      ctaLink="https://docs.sudoplatform.com/concepts/decentralized-identities/verifiable-credentials"
      imageName="icon-issuer-line"
    />
  );
};
