import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { ActiveCredentialRequestsCard } from './ActiveCredentialRequestsCard/ActiveCredentialRequestsCard';
import { IssuedCredentialsCard } from './IssuedCredentialsCard/IssuedCredentialsCard';

export const CredentialIssuance: React.FC = () => {
  return (
    <Page>
      <PageHeading>Credential Issuance</PageHeading>
      <ActiveCredentialRequestsCard />
      <IssuedCredentialsCard />
    </Page>
  );
};
