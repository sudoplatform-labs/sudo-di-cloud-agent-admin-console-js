import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, message, Modal, Button } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { CredentialRequestsList } from './CredentialRequestsList';
import {
  abortCredentialExchange,
  fetchFilteredCredentialExchangeRecords,
  requestProposedCredential,
  storeCredential,
  CredentialExchangeData,
} from '../../../../models/ACAPy/CredentialIssuance';
import { HStack } from '../../../../components/layout-stacks';
import { useInterval } from '../../../../utils/intervals';
import { ProposeCredentialForm } from './ProposeCredentialForm';
import { fetchAllAgentConnectionDetails } from '../../../../models/ACAPy/Connections';
import { IssueCredentialRecordsGetRoleEnum } from '@sudoplatform-labs/sudo-di-cloud-agent';

// There are several modal dialogs which need to be displayed
// during credential request processing.  ModalState
// captures which modal if any is currently active and is used
// to control the "visibility" attribute of modal components
// on the page.
type ModalState = 'propose-credential-open' | 'closed';

/**
 * Stylised hover information icon to explain reasons for
 * entries in the Requested Credentials table.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const CredentialRequestsIconPopover: React.FC = () => {
  const content = (
    <p>
      This table lists outstanding Verifiable Credential requests
      <br /> which have not yet been issued.
    </p>
  );
  return (
    <Popover
      id="CredentialRequestsCard__popover-dialog"
      title="Requested Credentials"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="CredentialRequestsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The CredentialRequestsCard React component deals with requesting
 * and tracking the state of incomplete credential request
 * operations initiated by an Agent as a Holder.
 */
export const CredentialRequestsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);
  const [modalState, setModalState] = useState<ModalState>('closed');

  const [
    { loading: infoLoading, value: credentials, error: agentFailed },
    getCredentialRequestsInfo,
  ] = useAsyncFn(async (): Promise<CredentialExchangeData[]> => {
    const credentialDataResult: CredentialExchangeData[] = [];

    const exchangeRecords = await fetchFilteredCredentialExchangeRecords(
      cloudAgentAPIs,
      {
        role: IssueCredentialRecordsGetRoleEnum.Holder,
      },
    );
    const connections = await fetchAllAgentConnectionDetails(cloudAgentAPIs);
    for (const record of exchangeRecords) {
      if (record.connection_id) {
        credentialDataResult.push({
          record: record,
          connection: connections.find(
            (value) => value.connection_id === record.connection_id,
          ),
        });
      } else {
        credentialDataResult.push({ record: record });
      }
    }
    return credentialDataResult;
  }, [cloudAgentAPIs]);

  // Refetch credential requests on any modal state change.
  useEffect(() => {
    getCredentialRequestsInfo();
  }, [getCredentialRequestsInfo, modalState]);

  // Slow poll for any credential state changes since
  // we don't have any ACA-py hooks implemented.
  const [count, setCount] = useState(30);
  useInterval(() => {
    setCount(count - 2);
    if (count <= 0) {
      setCount(30);
      getCredentialRequestsInfo();
    }
  }, 2000);

  const modalRequestCredentialCancelHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const modalRequestCredentialSuccessHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const deleteCredentialRequestHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await abortCredentialExchange(
          cloudAgentAPIs,
          credentialExchangeId,
          'User Requested Abort',
        );
        getCredentialRequestsInfo();
        message.success('Credential request aborted');
      } catch {
        message.error('Credential request failed to Abort, please try again.');
      }
    },
    [cloudAgentAPIs, getCredentialRequestsInfo],
  );

  const acceptCredentialProposalHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await requestProposedCredential(cloudAgentAPIs, credentialExchangeId);
        getCredentialRequestsInfo();
        message.success('Proposed credential requested');
      } catch {
        message.error('Credential request failed, please try again.');
      }
    },
    [cloudAgentAPIs, getCredentialRequestsInfo],
  );

  const storeCredentialHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await storeCredential(cloudAgentAPIs, credentialExchangeId);
        getCredentialRequestsInfo();
        message.success('Credential saved to wallet');
      } catch {
        message.error('Saving credential to wallet failed, please try again.');
      }
    },
    [cloudAgentAPIs, getCredentialRequestsInfo],
  );

  let credentialRequestsData;
  if (agentFailed) {
    credentialRequestsData = (
      <div>Unable to connect to the Cloud Agent Service</div>
    );
  } else {
    credentialRequestsData = (
      <CredentialRequestsList
        dataSource={credentials ?? []}
        loading={infoLoading}
        onDelete={deleteCredentialRequestHandler}
        onAccept={acceptCredentialProposalHandler}
        onStore={storeCredentialHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="CredentialRequestsCard"
          title={
            <span>
              Requested Credentials <CredentialRequestsIconPopover />
            </span>
          }
          extra={
            <HStack>
              <h5>Refresh in {count.toString().padStart(2, '0')}</h5>
              <Button
                id="CredentialRequestsCard__new-btn"
                type="primary"
                shape="round"
                onClick={() => setModalState('propose-credential-open')}
                disabled={infoLoading}>
                New Credential
              </Button>
            </HStack>
          }>
          {credentialRequestsData}
        </ConsoleCard>
      </CardsCol>
      <Modal
        title="Request Credential"
        visible={modalState === 'propose-credential-open'}
        onCancel={modalRequestCredentialCancelHandler}
        footer={null}>
        <ProposeCredentialForm
          onCancel={modalRequestCredentialCancelHandler}
          onSuccess={modalRequestCredentialSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
    </CardsRow>
  );
};
