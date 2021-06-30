import React from 'react';
import { FeatureUnavailable } from '../FeatureUnavailable';

export const ConsoleDashboard: React.FC = () => {
  return (
    <FeatureUnavailable
      pageHeading="Cloud Agent Dashboard"
      ctaHeading="Cloud Agent Dashboard"
      ctaDescription={`
        The Cloud Agent Dashboard displays key Agent statistics and status information
        `}
      ctaSubDescription={`
        More details coming soon
        `}
      ctaLink="https://docs.sudoplatform.com/concepts/decentralized-identities"
      imageName="home"
    />
  );
};
