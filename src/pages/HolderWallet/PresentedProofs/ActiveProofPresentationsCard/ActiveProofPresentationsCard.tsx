import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, message, Modal } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { ActiveProofPresentationsList } from './ActiveProofPresentationsList';
import {
  deleteProofExchange,
  fetchFilteredProofExchangeRecords,
  PresentationExchangeData,
} from '../../../../models/ACAPy/ProofPresentation';
import { PreparePresentationForm } from './PreparePresentationForm';
import { fetchAllAgentConnectionDetails } from '../../../../models/ACAPy/Connections';
import {
  PresentProofRecordsGetRoleEnum,
  PresentProofRecordsGetStateEnum,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

// Modal dialogs need to be displayed
// during proof presentation preparation.  ModalState
// captures which modal if any is currently active and is used
// to control the "visibility" attribute of modal components
// on the page.
type ModalState = 'prepare-presentation-open' | 'closed';

/**
 * Stylised hover information icon to explain reasons for
 * entries in the Active Verifiable Credential Proof Presentations table.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const ActiveProofsIconPopover: React.FC = () => {
  const content = (
    <p>
      This table lists active Verifiable Credential Proof Requests
      <br /> which have not yet been proved by this Agent.
    </p>
  );
  return (
    <Popover
      id="ActiveProofPresentationsCard__popover-dialog"
      title="Requested Proofs"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="ActiveProofPresentationsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The ActiveProofPresentationsCard React component deals with tracking incomplete
 * proof presentation operations serviced by a Proving Agent.
 */
export const ActiveProofPresentationsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);
  const [modalState, setModalState] = useState<ModalState>('closed');
  const [selectedProof, setSelectedProof] =
    useState<PresentationExchangeData>();

  const [
    { loading: infoLoading, value: proofs, error: agentFailed },
    getProofRequestsInfo,
  ] = useAsyncFn(async (): Promise<PresentationExchangeData[]> => {
    const proofDataResult: PresentationExchangeData[] = [];

    const exchangeRecords = await fetchFilteredProofExchangeRecords(
      cloudAgentAPIs,
      {
        role: PresentProofRecordsGetRoleEnum.Prover,
        states: [
          PresentProofRecordsGetStateEnum.ProposalSent,
          PresentProofRecordsGetStateEnum.ProposalReceived,
          PresentProofRecordsGetStateEnum.RequestSent,
          PresentProofRecordsGetStateEnum.RequestReceived,
          PresentProofRecordsGetStateEnum.PresentationSent,
          PresentProofRecordsGetStateEnum.PresentationReceived,
          PresentProofRecordsGetStateEnum.Verified,
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

  const modalCreatePresentationCancelHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const modalCreatePresentationSuccessHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const deleteProofHandler = useCallback(
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

  const offerProofPresentationHandler = useCallback(
    (proofExchangeId: string) => {
      const foundProof = proofs?.find(
        (record) => record.record.presentation_exchange_id === proofExchangeId,
      );
      setSelectedProof(foundProof);
      setModalState('prepare-presentation-open');
    },
    [proofs],
  );

  let proofRequestsData;
  if (agentFailed) {
    proofRequestsData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    proofRequestsData = (
      <ActiveProofPresentationsList
        dataSource={proofs ?? []}
        loading={infoLoading}
        onDelete={deleteProofHandler}
        onPrepareProof={offerProofPresentationHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="ActiveProofPresentationsCard"
          title={
            <span>
              Active Proof Presentations <ActiveProofsIconPopover />
            </span>
          }>
          {proofRequestsData}
        </ConsoleCard>
      </CardsCol>
      <Modal
        title="Prepare Proof"
        visible={modalState === 'prepare-presentation-open'}
        onCancel={modalCreatePresentationCancelHandler}
        footer={null}>
        <PreparePresentationForm
          proofRequest={selectedProof?.record}
          onCancel={modalCreatePresentationCancelHandler}
          onSuccess={modalCreatePresentationSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
    </CardsRow>
  );
};
