import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Popover, message } from 'antd';
import React, { useCallback, useContext, useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../components/ConsoleCard';
import { modalConfirm, modalTAAAcceptance } from '../../../components/Form';
import { CardsCol, CardsRow } from '../../../components/NavLayout';
import { theme } from '../../../theme';
import { DecentralizedIdentifiersList } from './DecentralizedIdentifiersList';
import { AppContext } from '../../../containers/App';
import {
  createPrivateDID,
  fetchAllAgentDIDs,
  writeDIDToLedger,
} from '../../../models/ACAPy/DecentralizedIdentifiers';
import { DID } from '@sudoplatform-labs/sudo-di-cloud-agent';

/**
 * Stylised hover information icon to explain the purpose of
 * DIDs in the Decentralized Identification ecosystem
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

export const DecentralizedIdentifiersIconPopover: React.FC = () => {
  const content = (
    <p>
      Decentralized Identifiers (DIDs) allow participation in a
      <br /> range of decentralized activities including authentication,
      <br /> secure communication, and verifiable credential exchange.
      <br /> Once a Decentralized Identifier is written to the Public
      <br /> Ledger it can not be removed.
    </p>
  );
  return (
    <Popover
      id="DecentralizedIdentifiersCard__popover-dialog"
      title="Decentralized Identifiers"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="DecentralizedIdentifiersCard__popover-icon" />
    </Popover>
  );
};

/**
 * The DecentalizedIdentifiersCard React component deals creating priviate DIDs
 * and writing these to the Decentralized Ledger. Once created these are
 * persistent and immutable.  Once written to the ledger they are also
 * publicly visible.
 */
export const DecentralizedIdentifiersCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);

  const [
    { loading: infoLoading, value: dids, error: agentFailed },
    getDIDInfo,
  ] = useAsyncFn(
    async (): Promise<DID[]> => fetchAllAgentDIDs(cloudAgentAPIs),
    [cloudAgentAPIs],
  );

  useEffect(() => {
    getDIDInfo();
  }, [getDIDInfo]);

  const handleCreateDIDConfirm = useCallback(async () => {
    try {
      await createPrivateDID(cloudAgentAPIs);
      getDIDInfo();
      message.success('Private Decentralized Identifier Created');
    } catch {
      message.error(
        'Unable to create Decentralized Identifier, please try again',
      );
    }
  }, [cloudAgentAPIs, getDIDInfo]);

  const showCreateDIDModal = useCallback(() => {
    modalConfirm({
      title: 'Generate New Private Decentralized Identifier',
      content: `
        All Decentralized Identifiers are persistent and can not be deleted.
        Do you wish to proceed with this Identifier creation?
      `,
      onOk: handleCreateDIDConfirm,
      okButtonProps: { id: 'DecentralizedIdentifiersCard__create-ok-btn' },
      cancelButtonProps: {
        id: 'DecentralizedIdentifiersCard__create-cancel-btn',
      },
    });
  }, [handleCreateDIDConfirm]);

  const handleWriteDIDToLedgerConfirm = useCallback(
    async (didInfo) => {
      try {
        await modalTAAAcceptance(cloudAgentAPIs, async () => {
          await writeDIDToLedger(cloudAgentAPIs, didInfo.did, didInfo.verkey);
          getDIDInfo();
          message.success('Decentralized Identifier written to public ledger');
        });
      } catch {
        message.error('Unable to write to public ledger, please try again');
      }
    },
    [cloudAgentAPIs, getDIDInfo],
  );

  let didData;
  if (agentFailed) {
    didData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    didData = (
      <DecentralizedIdentifiersList
        dataSource={dids ?? []}
        loading={infoLoading}
        onWriteToLedger={handleWriteDIDToLedgerConfirm}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="DecentralizedIdentifiersCard"
          title={
            <span>
              My Decentralized Identifiers{' '}
              <DecentralizedIdentifiersIconPopover />
            </span>
          }
          extra={
            <Button
              id="DecentralizedIdentifiersCard__create-btn"
              type="primary"
              shape="round"
              onClick={showCreateDIDModal}
              disabled={infoLoading}>
              Create DID
            </Button>
          }>
          {didData}
        </ConsoleCard>
      </CardsCol>
    </CardsRow>
  );
};
