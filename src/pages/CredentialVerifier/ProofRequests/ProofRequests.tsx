import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { ActiveProofRequestsCard } from './ActiveProofRequestsCard/ActiveProofRequestsCard';
import { CompletedProofRequestsCard } from './CompletedProofRequestsCard/CompletedProofRequestsCard';

export const ProofRequests: React.FC = () => {
  return (
    <Page>
      <PageHeading>Proof Requests</PageHeading>
      <ActiveProofRequestsCard />
      <CompletedProofRequestsCard />
    </Page>
  );
};
