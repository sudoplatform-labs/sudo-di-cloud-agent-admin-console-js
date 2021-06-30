import { InfoCircleOutlined } from '@ant-design/icons';
import { message, Popover } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../components/NavLayout';
import { theme } from '../../theme';
import { AppContext } from '../../containers/App';
import { useInterval } from '../../utils/intervals';
import {
  deleteProofExchange,
  fetchFilteredProofExchangeRecords,
  PresentationExchangeData,
} from '../../models/ACAPy/ProofPresentation';
import { CompletedProofsList } from '../../components/Proofs/CompletedProofsList';
import { fetchAllAgentConnectionDetails } from '../../models/ACAPy/Connections';
import { HStack } from '../layout-stacks';

/**
 * Props define the agent role for this card instance
 */
interface Props {
  role: 'prover' | 'verifier';
}

/**
 * Stylised hover information icon to explain reasons for
 * entries in the Completed Proofs table.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const CompletedProofsIconPopover: React.FC = () => {
  const content = (
    <p>
      This table displays details for proof exchanges that have been
      <br /> completed by this Agent.
    </p>
  );
  return (
    <Popover
      id="CompletedProofsCard__popover-dialog"
      title="Completed Proofs"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="CompletedProofsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The CompletedProofsCard React component displays proof exchanges
 * completed by this Agent.
 */
export const CompletedProofsCard: React.FC<Props> = (props) => {
  const { role } = props;
  const { cloudAgentAPIs } = useContext(AppContext);

  const [
    { loading: infoLoading, value: proofsCompleted, error: agentFailed },
    getProofsCompletedInfo,
  ] = useAsyncFn(async (): Promise<PresentationExchangeData[]> => {
    const proofDataResult: PresentationExchangeData[] = [];

    const exchangeRecords = await fetchFilteredProofExchangeRecords(
      cloudAgentAPIs,
      {
        role: role,
        states: ['verified', 'presentation_acked'],
      },
    );
    const connections = await fetchAllAgentConnectionDetails(cloudAgentAPIs);
    for (const record of exchangeRecords) {
      if (record.connection_id) {
        proofDataResult.push({
          record: record,
          connection: connections.find(
            (value) => value.connection_id === record.connection_id,
          ),
        });
      } else {
        proofDataResult.push({ record: record });
      }
    }
    return proofDataResult;
  }, [cloudAgentAPIs]);

  useEffect(() => {
    getProofsCompletedInfo();
  }, [getProofsCompletedInfo]);

  // Slow poll for any proof table changes since
  // we don't have any ACA-py hooks implemented.
  const [count, setCount] = useState(30);
  useInterval(() => {
    setCount(count - 2);
    if (count <= 0) {
      setCount(30);
      getProofsCompletedInfo();
    }
  }, 2000);

  const deleteProofPresentationHandler = useCallback(
    async (presentationId: string) => {
      try {
        await deleteProofExchange(cloudAgentAPIs, presentationId);
        getProofsCompletedInfo();
        message.success('Proof Presentation Record deleted');
      } catch {
        message.error(
          'Proof Presentation Record failed to delete, please try again.',
        );
      }
    },
    [cloudAgentAPIs, getProofsCompletedInfo],
  );

  let proofsData;
  if (agentFailed) {
    proofsData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    proofsData = (
      <CompletedProofsList
        dataSource={proofsCompleted ?? []}
        loading={infoLoading}
        onDelete={deleteProofPresentationHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="CompletedProofsCard"
          title={
            <span>
              Completed Proof Presentations <CompletedProofsIconPopover />
            </span>
          }
          extra={
            <HStack>
              <h5>Refresh in {count.toString().padStart(2, '0')}</h5>
            </HStack>
          }>
          {proofsData}
        </ConsoleCard>
      </CardsCol>
    </CardsRow>
  );
};
