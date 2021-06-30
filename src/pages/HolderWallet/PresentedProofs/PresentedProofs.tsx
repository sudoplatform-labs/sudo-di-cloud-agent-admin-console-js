import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { ActiveProofPresentationsCard } from './ActiveProofPresentationsCard/ActiveProofPresentationsCard';
import { CompletedProofPresentationsCard } from './CompletedProofPresentationsCard/CompletedProofPresentationsCard';

export const PresentedProofs: React.FC = () => {
  return (
    <Page>
      <PageHeading>My Proof Presentations</PageHeading>
      <ActiveProofPresentationsCard />
      <CompletedProofPresentationsCard />
    </Page>
  );
};
