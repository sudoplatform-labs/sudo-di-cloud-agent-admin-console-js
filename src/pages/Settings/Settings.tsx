import React from 'react';
import { FeatureUnavailable } from '../FeatureUnavailable';

export const Settings: React.FC = () => {
  return (
    <FeatureUnavailable
      pageHeading="Cloud Agent Settings"
      ctaHeading="Configuration for Cloud Agent"
      ctaDescription={`
        Cloud Agent Settings allows configuration of the Cloud Agency web service.
        `}
      ctaSubDescription={`
        More details coming soon
        `}
      ctaLink="https://docs.sudoplatform.com/concepts/decentralized-identities"
      imageName="settings"
    />
  );
};
