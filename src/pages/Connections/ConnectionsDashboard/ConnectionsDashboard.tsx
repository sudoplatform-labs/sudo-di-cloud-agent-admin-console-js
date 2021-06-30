import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { ConnectionsCard } from '../ConnectionsCard';

export const ConnectionsDashboard: React.FC = () => {
  return (
    <Page>
      <PageHeading>DIDComm Connections</PageHeading>
      <ConnectionsCard />
    </Page>
  );
};
