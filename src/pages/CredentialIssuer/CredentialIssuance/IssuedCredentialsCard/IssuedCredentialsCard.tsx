import { InfoCircleOutlined } from '@ant-design/icons';
import { message, Popover } from 'antd';
import React, { useContext, useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import {
  fetchFilteredCredentialExchangeRecords,
  deleteCredentialExchangeRecord,
  CredentialExchangeData,
  revokeCredential,
} from '../../../../models/ACAPy/CredentialIssuance';
import { IssuedCredentialsList } from './IssuedCredentialsList';
import { useCallback } from 'react';
import { fetchAllAgentConnectionDetails } from '../../../../models/ACAPy/Connections';
import {
  IssueCredentialRecordsGetRoleEnum,
  IssueCredentialRecordsGetStateEnum,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

/**
 * Stylised hover information icon to explain reasons for
 * entries in the Issued Credentials table.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const CredentialsIconPopover: React.FC = () => {
  const content = (
    <p>
      This table displays details for credentials which have been issued
      <br /> by this Agent.
    </p>
  );
  return (
    <Popover
      id="IssuedCredentialsCard__popover-dialog"
      title="Issued Credentials"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="IssuedCredentialsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The IssuedCredentialsCard React component displays credentials
 * successfully issued by this Agent to other Agents.
 */
export const IssuedCredentialsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);

  const [
    { loading: infoLoading, value: credentialsIssued, error: agentFailed },
    getCredentialsIssuedInfo,
  ] = useAsyncFn(async (): Promise<CredentialExchangeData[]> => {
    const credentialDataResult: CredentialExchangeData[] = [];

    const exchangeRecords = await fetchFilteredCredentialExchangeRecords(
      cloudAgentAPIs,
      {
        role: IssueCredentialRecordsGetRoleEnum.Issuer,
        states: [
          IssueCredentialRecordsGetStateEnum.CredentialIssued,
          IssueCredentialRecordsGetStateEnum.CredentialAcked,
        ],
      },
    );

    const connections = await fetchAllAgentConnectionDetails(cloudAgentAPIs);
    for (const record of exchangeRecords) {
      const credentialData: CredentialExchangeData = { record: record };
      if (record.connection_id) {
        credentialData.connection = connections.find(
          (value) => value.connection_id === record.connection_id,
        );
      }
      credentialDataResult.push(credentialData);
    }
    return credentialDataResult;
  }, [cloudAgentAPIs]);

  useEffect(() => {
    getCredentialsIssuedInfo();
  }, [getCredentialsIssuedInfo]);

  const deleteCredentialExchangeHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await deleteCredentialExchangeRecord(
          cloudAgentAPIs,
          credentialExchangeId,
        );
        getCredentialsIssuedInfo();
        message.success('Credential Exchange Record deleted');
      } catch {
        message.error(
          'Credential Exchange Record failed to delete, please try again.',
        );
      }
    },
    [cloudAgentAPIs, getCredentialsIssuedInfo],
  );

  const revokeCredentialHandler = useCallback(
    async (credentialExchangeId: string) => {
      try {
        await revokeCredential(cloudAgentAPIs, {
          cred_ex_id: credentialExchangeId,
          publish: true,
        });
        getCredentialsIssuedInfo();
        message.success(`Credential ${credentialExchangeId} Revoked`);
      } catch {
        message.error('Credential failed to be revoked, please try again.');
      }
    },
    [cloudAgentAPIs, getCredentialsIssuedInfo],
  );

  let credentialsData;
  if (agentFailed) {
    credentialsData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    credentialsData = (
      <IssuedCredentialsList
        dataSource={credentialsIssued ?? []}
        loading={infoLoading}
        doDelete={deleteCredentialExchangeHandler}
        doRevoke={revokeCredentialHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="IssuedCredentialsCard"
          title={
            <span>
              Issued Credentials <CredentialsIconPopover />
            </span>
          }>
          {credentialsData}
        </ConsoleCard>
      </CardsCol>
    </CardsRow>
  );
};
