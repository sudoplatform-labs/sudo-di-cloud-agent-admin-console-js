import React from 'react';
import { FeatureUnavailable } from '../../FeatureUnavailable';

export const CredentialVerifierDashboard: React.FC = () => {
  return (
    <FeatureUnavailable
      pageHeading="Credential Verifier"
      ctaHeading="Credential Verification Administration"
      ctaDescription={`
        Verifiy credentials presented as proofs from Customers
        `}
      ctaSubDescription={`
        More details coming soon
        `}
      ctaLink="https://docs.sudoplatform.com/concepts/decentralized-identities/verifiable-credentials"
      imageName="icon-verifier-line"
    />
  );
};
