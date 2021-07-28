import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, message, Button, Modal } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { ActiveProofRequestsList } from './ActiveProofRequestsList';
import { HStack } from '../../../../components/layout-stacks';
import { useInterval } from '../../../../utils/intervals';
import {
  deleteProofExchange,
  fetchFilteredProofExchangeRecords,
  PresentationExchangeData,
  verifyProofPresentation,
} from '../../../../models/ACAPy/ProofPresentation';
import { RequestProofForm } from './RequestProofForm';
import { fetchAllAgentConnectionDetails } from '../../../../models/ACAPy/Connections';
import { PresentProofRecordsGetRoleEnum, PresentProofRecordsGetStateEnum } from '@sudoplatform-labs/sudo-di-cloud-agent';

// Modal dialogs need to be displayed
// during proof request processing.  ModalState
// captures which modal if any is currently active and is used
// to control the "visibility" attribute of modal components
// on the page.
type ModalState = 'request-proof-open' | 'closed';

/**
 * Stylised hover information icon to explain reasons for
 * entries in the Active Verifiable Credential Proofs table.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const ActiveProofRequestsIconPopover: React.FC = () => {
  const content = (
    <p>
      This table lists active Verifiable Credential Proofs
      <br /> which have not yet been verified by this Agent.
    </p>
  );
  return (
    <Popover
      id="ActiveProofRequestsCard__popover-dialog"
      title="Requested Proofs"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="ActiveProofRequestsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The ActiveProofsCard React component deals with tracking incomplete
 * proof request operations serviced by a Verifying Agent.
 */
export const ActiveProofRequestsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);
  const [modalState, setModalState] = useState<ModalState>('closed');

  const [
    { loading: infoLoading, value: proofs, error: agentFailed },
    getProofRequestsInfo,
  ] = useAsyncFn(async (): Promise<PresentationExchangeData[]> => {
    const proofDataResult: PresentationExchangeData[] = [];

    const exchangeRecords = await fetchFilteredProofExchangeRecords(
      cloudAgentAPIs,
      {
        role: PresentProofRecordsGetRoleEnum.Verifier,
        states: [
          PresentProofRecordsGetStateEnum.ProposalSent,
          PresentProofRecordsGetStateEnum.ProposalReceived,
          PresentProofRecordsGetStateEnum.RequestSent,
          PresentProofRecordsGetStateEnum.RequestReceived,
          PresentProofRecordsGetStateEnum.PresentationSent,
          PresentProofRecordsGetStateEnum.PresentationReceived,
        ],
      },
    );
    const connections = fetchAllAgentConnectionDetails(cloudAgentAPIs);
    for (const record of exchangeRecords) {
      if (record.connection_id) {
        proofDataResult.push({
          record: record,
          connection: (await connections).find(
            (value) => value.connection_id === record.connection_id,
          ),
        });
      } else {
        proofDataResult.push({ record: record });
      }
    }
    return proofDataResult;
  }, [cloudAgentAPIs]);

  // Refetch proof requests on any modal state change.
  useEffect(() => {
    getProofRequestsInfo();
  }, [getProofRequestsInfo, modalState]);

  // Slow poll for any proof request table changes since
  // we don't have any ACA-py hooks implemented.
  const [count, setCount] = useState(30);
  useInterval(() => {
    setCount(count - 2);
    if (count <= 0) {
      setCount(30);
      getProofRequestsInfo();
    }
  }, 2000);

  const modalRequestProofCancelHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const modalRequestProofSuccessHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const rejectProofPresentationHandler = useCallback(
    async (proofExchangeId: string) => {
      try {
        await deleteProofExchange(cloudAgentAPIs, proofExchangeId);
        getProofRequestsInfo();
        message.success('Proof Aborted');
      } catch {
        message.error('Proof exchange failed to Abort, please try again.');
      }
    },
    [cloudAgentAPIs, getProofRequestsInfo],
  );

  const verifyProofPresentationHandler = useCallback(
    async (proofExchangeId: string) => {
      try {
        await verifyProofPresentation(cloudAgentAPIs, proofExchangeId);
        getProofRequestsInfo();
        message.success('Proof Verified');
      } catch {
        message.error('Failed to Verify proof signatures !');
      }
    },
    [cloudAgentAPIs, getProofRequestsInfo],
  );

  let proofRequestsData;
  if (agentFailed) {
    proofRequestsData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    proofRequestsData = (
      <ActiveProofRequestsList
        dataSource={proofs ?? []}
        loading={infoLoading}
        onDelete={rejectProofPresentationHandler}
        onVerify={verifyProofPresentationHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="ActiveProofRequestsCard"
          title={
            <span>
              Active Proof Exchanges <ActiveProofRequestsIconPopover />
            </span>
          }
          extra={
            <HStack>
              <h5>Refresh in {count.toString().padStart(2, '0')}</h5>
              <Button
                id="ActiveProofRequestsCard__new-btn"
                type="primary"
                shape="round"
                onClick={() => setModalState('request-proof-open')}
                disabled={infoLoading}>
                New Proof Request
              </Button>
            </HStack>
          }>
          {proofRequestsData}
        </ConsoleCard>
      </CardsCol>
      <Modal
        title="Request Proof"
        visible={modalState === 'request-proof-open'}
        onCancel={modalRequestProofCancelHandler}
        footer={null}>
        <RequestProofForm
          onCancel={modalRequestProofCancelHandler}
          onSuccess={modalRequestProofSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
    </CardsRow>
  );
};
