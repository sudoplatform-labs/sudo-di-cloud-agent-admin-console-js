import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Popover, Modal } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { fetchAllAgentSchemaDefinitionDetails } from '../../../../models/ACAPy/SchemaDefinitions';
import { CreateSchemaDefinitionForm } from './CreateSchemaDefinitionForm';
import { SchemaDefinitionsList } from './SchemaDefinitionsList';
import { Schema } from '@sudoplatform-labs/sudo-di-cloud-agent';

type ModalState = 'create-schema-open' | 'closed';

/**
 * Stylised hover information icon to explain the purpose of
 * Schema Definitions in the Decentralized Identification ecosystem.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

export const SchemaDefinitionsIconPopover: React.FC = () => {
  const content = (
    <p>
      Verifiable Credential Schemas define the attributes
      <br /> for a bound Verifiable Credential Definition.
      <br /> An Issuer can use any Schema on the Public Ledger to
      <br /> create a Verifiable Credential Definition tied to
      <br /> their own Decentralized Identifier.
    </p>
  );
  return (
    <Popover
      id="SchemaDefinitionsCard__popover-dialog"
      title="Schema Definitions"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="SchemaDefinitionsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The SchemaDefinitionsCard React component deals with writing
 * Verifiable Credential Schemas to the Decentralized Ledger.
 * These are both Publicly Visible and publicly re-usable to
 * create Verified Credential Definitions.
 */
export const SchemaDefinitionsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);
  const [modalState, setModalState] = useState<ModalState>('closed');

  const [
    { loading: infoLoading, value: schemas, error: agentFailed },
    getSchemaInfo,
  ] = useAsyncFn(
    async (): Promise<Schema[]> =>
      fetchAllAgentSchemaDefinitionDetails(cloudAgentAPIs),
    [cloudAgentAPIs],
  );

  useEffect(() => {
    getSchemaInfo();
  }, [getSchemaInfo, modalState]);

  const modalCancelHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const modalSuccessHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  let schemaData;
  if (agentFailed) {
    schemaData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    schemaData = (
      <SchemaDefinitionsList dataSource={schemas ?? []} loading={infoLoading} />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="SchemaDefinitionsCard"
          title={
            <span>
              My Schema Definitions <SchemaDefinitionsIconPopover />
            </span>
          }
          extra={
            <Button
              id="SchemaDefinitionsCard__create-btn"
              type="primary"
              shape="round"
              onClick={() => setModalState('create-schema-open')}
              disabled={infoLoading}>
              Create Schema Definition
            </Button>
          }>
          {schemaData}
        </ConsoleCard>
      </CardsCol>
      <Modal
        title="Create Schema Definition"
        visible={modalState === 'create-schema-open'}
        onCancel={modalCancelHandler}
        footer={null}>
        <CreateSchemaDefinitionForm
          onCancel={modalCancelHandler}
          onSuccess={modalSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
    </CardsRow>
  );
};
