import { InfoCircleOutlined } from '@ant-design/icons';
import { Popover, message } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../../components/NavLayout';
import { theme } from '../../../../theme';
import { AppContext } from '../../../../containers/App';
import { OwnedCredentialsList } from './OwnedCredentialsList';
import {
  fetchAllAgentOwnedCredentialDetails,
  deleteCredential,
} from '../../../../models/ACAPy/CredentialIssuance';
import { HStack } from '../../../../components/layout-stacks';
import { useInterval } from '../../../../utils/intervals';
import { IndyCredInfo } from '@sudoplatform-labs/sudo-di-cloud-agent';

/**
 * Stylised hover information icon to explain the purpose of
 * owning credentials in the Decentralized Identification ecosystem
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const CredentialsIconPopover: React.FC = () => {
  const content = (
    <p>
      Verifiable Credentials are a cornerstone of
      <br /> Decentralized Identity privacy protection capabilities.
      <br /> Verifiable credentials allow users to control which claims are
      <br /> presented in proofs to a Verifier. Verifiers can check for
      <br /> both currency and correctness of the claims without contacting
      <br /> the original Issuer, removing possible correlation tracking by the
      Issuer.
      <br /> The potential to use Zero Knowledge Proofs (ZNP) when presenting
      <br /> appropriately formated claims further protects leakage of
      Personally
      <br /> Identifiable Information (PII).
    </p>
  );
  return (
    <Popover
      id="OwnedCredentialsCard__popover-dialog"
      title="Owner Credentials"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="OwnedCredentialsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The ownedCredentialsCard React component deals with displaying
 * and removing Credentials owned by an Agent.
 */
export const OwnedCredentialsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);

  const [
    { loading: infoLoading, value: credentials, error: agentFailed },
    getOwnedCredentialsInfo,
  ] = useAsyncFn(
    async (): Promise<IndyCredInfo[]> =>
      fetchAllAgentOwnedCredentialDetails(cloudAgentAPIs),
    [cloudAgentAPIs],
  );

  useEffect(() => {
    getOwnedCredentialsInfo();
  }, [getOwnedCredentialsInfo]);

  // Slow poll for any owned credential state changes since
  // we don't have any ACA-py hooks implemented.
  const [count, setCount] = useState(30);
  useInterval(() => {
    setCount(count - 2);
    if (count <= 0) {
      setCount(30);
      getOwnedCredentialsInfo();
    }
  }, 2000);

  const deleteCredentialHandler = useCallback(
    async (credentialId: string) => {
      try {
        await deleteCredential(cloudAgentAPIs, credentialId);
        getOwnedCredentialsInfo();
        message.success('Credential deleted');
      } catch {
        message.error('Credential failed to delete, please try again.');
      }
    },
    [cloudAgentAPIs, getOwnedCredentialsInfo],
  );

  let credentialsData;
  if (agentFailed) {
    credentialsData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    credentialsData = (
      <OwnedCredentialsList
        dataSource={credentials ?? []}
        loading={infoLoading}
        onDelete={deleteCredentialHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="OwnedCredentialsCard"
          title={
            <span>
              Owned Credentials <CredentialsIconPopover />
            </span>
          }
          extra={
            <HStack>
              <h5>Refresh in {count.toString().padStart(2, '0')}</h5>
            </HStack>
          }>
          {credentialsData}
        </ConsoleCard>
      </CardsCol>
    </CardsRow>
  );
};
