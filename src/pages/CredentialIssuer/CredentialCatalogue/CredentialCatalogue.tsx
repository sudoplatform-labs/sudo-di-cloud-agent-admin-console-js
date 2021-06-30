import React from 'react';
import { PageHeading, Page } from '../../../components/NavLayout';
import { SchemaDefinitionsCard } from './SchemaDefinitionsCard/SchemaDefinitionsCard';
import { CredentialDefinitionsCard } from './CredentialDefinitionsCard';

export const CredentialCatalogue: React.FC = () => {
  return (
    <Page>
      <PageHeading>Verifiable Credentials Catalogue</PageHeading>
      <SchemaDefinitionsCard />
      <CredentialDefinitionsCard />
    </Page>
  );
};
