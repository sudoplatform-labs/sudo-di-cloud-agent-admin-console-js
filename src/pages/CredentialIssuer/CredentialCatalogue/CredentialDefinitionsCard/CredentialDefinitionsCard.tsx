import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Popover, Modal } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { CreateCredentialDefinitionForm } from './CreateCredentialDefinitionForm';
import { CredentialDefinitionsList } from './CredentialDefinitionsList';
import { fetchAllAgentCredentialDefinitionDetails } from '../../../../models/ACAPy/CredentialDefinitions';
import { CredentialDefinition } from '@sudoplatform-labs/sudo-di-cloud-agent';

type ModalState = 'open' | 'closed';

/**
 * Stylised hover information icon to explain the purpose of
 * Credential Definitions in the Decentralized Identification ecosystem.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

export const CredentialDefinitionsIconPopover: React.FC = () => {
  const content = (
    <p>
      Verifiable Credential Definitions bind an Issuer DID,
      <br /> cryptographically to an existing Schema Definition.
      <br /> Only the creator of a Verifiable Credential Definition
      <br /> can successfully issue Credentials for that Definition.
    </p>
  );
  return (
    <Popover
      id="CredentialDefinitionsCard__popover-dialog"
      title="Credential Definitions"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="CredentialDefinitionsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The CredentialDefinitionsCard React component deals with writing
 * Verifiable Credential Definitions to the Decentralized Ledger.
 * These are Publicly Visible and bind the credential definition
 * to the DID which was used to create it.  Only the OWNER of the
 * creating DID can ever issue valid verifiable credentials using
 * the definition.
 */
export const CredentialDefinitionsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);
  const [modalState, setModalState] = useState<ModalState>('closed');

  const [
    { loading: infoLoading, value: credentials, error: agentFailed },
    getCredentialDefinitionsInfo,
  ] = useAsyncFn(
    async (): Promise<CredentialDefinition[]> =>
      fetchAllAgentCredentialDefinitionDetails(cloudAgentAPIs),
    [cloudAgentAPIs],
  );

  useEffect(() => {
    getCredentialDefinitionsInfo();
  }, [getCredentialDefinitionsInfo, modalState]);

  const modalCancelHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const modalSuccessHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  let credentialDefinitionsData;
  if (agentFailed) {
    credentialDefinitionsData = (
      <div>Unable to connect to the Cloud Agent Service</div>
    );
  } else {
    credentialDefinitionsData = (
      <CredentialDefinitionsList
        dataSource={credentials ?? []}
        loading={infoLoading}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="CredentialDefinitionsCard"
          title={
            <span>
              My Credential Definitions <CredentialDefinitionsIconPopover />
            </span>
          }
          extra={
            <Button
              id="CredentialDefinitionsCard__create-btn"
              type="primary"
              shape="round"
              onClick={() => setModalState('open')}
              disabled={infoLoading}>
              Create Credential Definition
            </Button>
          }>
          {credentialDefinitionsData}
        </ConsoleCard>
      </CardsCol>
      <Modal
        title="Create Credential Definition"
        visible={modalState === 'open'}
        onCancel={modalCancelHandler}
        footer={null}>
        <CreateCredentialDefinitionForm
          onCancel={modalCancelHandler}
          onSuccess={modalSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
    </CardsRow>
  );
};
