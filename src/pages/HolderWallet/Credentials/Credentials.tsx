import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { CredentialRequestsCard } from './CredentialRequestsCard/CredentialRequestsCard';
import { OwnedCredentialsCard } from './OwnedCredentialsCard/OwnedCredentialsCard';

export const Credentials: React.FC = () => {
  return (
    <Page>
      <PageHeading>My Credentials</PageHeading>
      <CredentialRequestsCard />
      <OwnedCredentialsCard />
    </Page>
  );
};
