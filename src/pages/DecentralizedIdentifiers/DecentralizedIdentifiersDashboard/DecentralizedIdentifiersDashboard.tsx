import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { DecentralizedIdentifiersCard } from '../DecentralizedIdentifiersCard';

export const DecentralizedIdentifiersDashboard: React.FC = () => {
  return (
    <Page>
      <PageHeading>Decentralized Identifiers</PageHeading>
      <DecentralizedIdentifiersCard />
    </Page>
  );
};
