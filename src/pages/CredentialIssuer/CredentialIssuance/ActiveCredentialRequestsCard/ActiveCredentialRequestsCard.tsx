import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, message } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { ActiveCredentialRequestsList } from './ActiveCredentialRequestsList';
import {
  abortCredentialExchange,
  fetchFilteredCredentialExchangeRecords,
  offerCredential,
  issueCredential,
  CredentialExchangeData,
} from '../../../../models/ACAPy/CredentialIssuance';
import { HStack } from '../../../../components/layout-stacks';
import { useInterval } from '../../../../utils/intervals';
import { fetchAllAgentConnectionDetails } from '../../../../models/ACAPy/Connections';

/**
 * Stylised hover information icon to explain reasons for
 * entries in the Active Credentials Request table.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const ActiveCredentialRequestsIconPopover: React.FC = () => {
  const content = (
    <p>
      This table lists outstanding Verifiable Credential requests
      <br /> which have not yet been issued.
    </p>
  );
  return (
    <Popover
      id="ActiveCredentialRequestsCard__popover-dialog"
      title="Requested Credentials"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="ActiveCredentialRequestsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The CredentialRequestsCard React component deals with tracking incomplete
 * credential request operations serviced by an Issuing Agent.
 */
export const ActiveCredentialRequestsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);

  const [
    { loading: infoLoading, value: credentials, error: agentFailed },
    getCredentialRequestsInfo,
  ] = useAsyncFn(async (): Promise<CredentialExchangeData[]> => {
    const credentialDataResult: CredentialExchangeData[] = [];

    const exchangeRecords = await fetchFilteredCredentialExchangeRecords(
      cloudAgentAPIs,
      {
        role: 'issuer',
        states: [
          'proposal_sent',
          'proposal_received',
          'offer_sent',
          'offer_received',
          'request_sent',
          'request_received',
        ],
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

  useEffect(() => {
    getCredentialRequestsInfo();
  }, [getCredentialRequestsInfo]);

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

  const rejectCredentialProposalHandler = useCallback(
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

  const offerCredentialHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await offerCredential(cloudAgentAPIs, credentialExchangeId);
        getCredentialRequestsInfo();
        message.success('Credential offered');
      } catch {
        message.error('Failed to offer credential, please try again.');
      }
    },
    [cloudAgentAPIs, getCredentialRequestsInfo],
  );

  const issueCredentialHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await issueCredential(cloudAgentAPIs, credentialExchangeId);
        getCredentialRequestsInfo();
        message.success('Credential issued');
      } catch {
        message.error('Failed to issue credential, please try again.');
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
      <ActiveCredentialRequestsList
        dataSource={credentials ?? []}
        loading={infoLoading}
        onDelete={rejectCredentialProposalHandler}
        onOffer={offerCredentialHandler}
        onIssue={issueCredentialHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="ActiveCredentialRequestsCard"
          title={
            <span>
              Active Credential Requests <ActiveCredentialRequestsIconPopover />
            </span>
          }
          extra={
            <HStack>
              <h5>Refresh in {count.toString().padStart(2, '0')}</h5>
            </HStack>
          }>
          {credentialRequestsData}
        </ConsoleCard>
      </CardsCol>
    </CardsRow>
  );
};
