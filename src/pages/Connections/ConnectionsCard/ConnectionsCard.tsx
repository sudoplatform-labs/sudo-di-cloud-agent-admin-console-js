import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Popover, Modal, message } from 'antd';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { ConsoleCard } from '../../../components/ConsoleCard';
import { CardsCol, CardsRow } from '../../../components/NavLayout';
import { theme } from '../../../theme';
import { AppContext } from '../../../containers/App';
import { CreateInvitationForm } from './CreateInvitationForm';
import { ConnectionsList } from './ConnectionsList';
import {
  fetchAllAgentConnectionDetails,
  deleteConnection,
  acceptConnectionInvite,
  ConnectionAcceptParams,
} from '../../../models/ACAPy/Connections';
import { modalInfo, modalConfirm } from '../../../components/Form';
import { VStack, HStack } from '../../../components/layout-stacks';
import { AcceptInvitationForm } from './AcceptInvitationForm';
import { useInterval } from '../../../utils/intervals';
import {
  ConnRecord,
  InvitationResult,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

// There are several modal dialogs which need to be displayed
// during invitation creation and acceptance.  ModalState
// captures which modal if any is currently active and is used
// to control the "visibility" attribute of modal components
// on the page.
type ModalState =
  | 'create-invitation-open'
  | 'display-invitation-open'
  | 'accept-invitation-open'
  | 'accept-confirm-open'
  | 'closed';

/**
 * Stylised hover information icon to explain the purpose of
 * Connections in the Decentralized Identification ecosystem
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const ConnectionsIconPopover: React.FC = () => {
  const content = (
    <p>
      DIDComm Connections allow secure communication between
      <br /> Decentralized Identity Agents using Public Key infrastructure.
      <br /> A DIDComm connection to the other Agent must be established before
      <br /> Verifiable Credentials can be received from an Issuer or Proofs
      <br /> can be presented to a Verifier.
    </p>
  );
  return (
    <Popover
      id="ConnectionsCard__popover-dialog"
      title="DIDComm Connections"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="ConnectionsCard__popover-icon" />
    </Popover>
  );
};

/**
 * The ConnectionsCard React component deals with adding and removing DIDComm
 * connections to an Agent. Initiating a connection involves
 * creating an invitation which is displayed in both QR Code
 * format and as a base64 encoded URL. This is then sent to the
 * recipient out of band.  The recipient can enter the
 * URL into their agent and the Connection protocol explained by
 * https://github.com/hyperledger/aries-rfcs/tree/master/features/0160-connection-protocol
 * is followed to create the secure DIDComm connection.
 */
export const ConnectionsCard: React.FC = () => {
  const { cloudAgentAPIs } = useContext(AppContext);
  const [modalState, setModalState] = useState<ModalState>('closed');

  const [
    { loading: infoLoading, value: connections, error: agentFailed },
    getConnectionsInfo,
  ] = useAsyncFn(
    async (): Promise<ConnRecord[]> =>
      fetchAllAgentConnectionDetails(cloudAgentAPIs),
    [cloudAgentAPIs],
  );

  // Refetch connections on any modal state change.
  useEffect(() => {
    getConnectionsInfo();
  }, [getConnectionsInfo, modalState]);

  // Slow poll for any connection state changes since
  // we don't have any ACA-py hooks implemented.
  const [count, setCount] = useState(30);
  useInterval(() => {
    setCount(count - 2);
    if (count <= 0) {
      setCount(30);
      getConnectionsInfo();
    }
  }, 2000);

  const modalCreateInvitationCancelHandler = useCallback(() => {
    setModalState('closed');
  }, []);

  const modalCreateInvitationSuccessHandler = useCallback(
    (invitationDetails: InvitationResult) => {
      setModalState('display-invitation-open');
      modalInfo({
        title: 'Invitation Details',
        content: (
          <VStack align="center">
            <p>
              Scan the following QRCode or copy the URL and send to the invitee.
              <br /> <b>IMPORTANT:</b> Once this dialog is dismissed, the
              invitation can NOT be re-displayed.
            </p>
            <QRCode
              value={invitationDetails.invitation_url ?? 'Missing URL!'}
              size={256}
              renderAs="svg"
              includeMargin={true}
            />
            <pre>{invitationDetails.invitation_url}</pre>
          </VStack>
        ),
        onOk: () => {
          setModalState('closed');
        },
      });
    },
    [setModalState],
  );

  const modalAcceptInvitationCancelHandler = useCallback(() => {
    setModalState('closed');
  }, [setModalState]);

  const modalAcceptInvitationSuccessHandler = useCallback(
    (acceptDetails: ConnectionAcceptParams) => {
      setModalState('accept-confirm-open');
      modalConfirm({
        title: 'Invitation Details',
        width: 800,
        content: (
          <VStack align="left">
            <p>
              <b>Your Alias :</b> {acceptDetails.alias}
            </p>
            <p>
              <b>Invite Details</b>
            </p>
            <pre>{JSON.stringify(acceptDetails.invitation, undefined, 2)}</pre>
          </VStack>
        ),
        okText: 'Connect',
        onOk: async () => {
          await acceptConnectionInvite(cloudAgentAPIs, acceptDetails);
          setModalState('closed');
        },
        onCancel: () => {
          setModalState('closed');
        },
      });
    },
    [cloudAgentAPIs, setModalState],
  );

  const deleteConnectionHandler = useCallback(
    async (connectionId: string) => {
      try {
        await deleteConnection(cloudAgentAPIs, connectionId);
        getConnectionsInfo();
        message.success('Connection deleted');
      } catch {
        message.error('Connection failed to delete, please try again.');
      }
    },
    [cloudAgentAPIs, getConnectionsInfo],
  );

  let connectionsData;
  if (agentFailed) {
    connectionsData = <div>Unable to connect to the Cloud Agent Service</div>;
  } else {
    connectionsData = (
      <ConnectionsList
        dataSource={connections ?? []}
        loading={infoLoading}
        onDelete={deleteConnectionHandler}
      />
    );
  }

  return (
    <CardsRow>
      <CardsCol span={24}>
        <ConsoleCard
          id="ConnectionsCard"
          title={
            <span>
              DIDComm Connections <ConnectionsIconPopover />
            </span>
          }
          extra={
            <HStack>
              <h5>Refresh in {count.toString().padStart(2, '0')}</h5>
              <Button
                id="ConnectionsCard__create-btn"
                type="primary"
                shape="round"
                onClick={() => setModalState('create-invitation-open')}
                disabled={infoLoading}>
                Create Invitation
              </Button>
              <Button
                id="ConnectionsCard__accept-btn"
                type="default"
                shape="round"
                onClick={() => setModalState('accept-invitation-open')}
                disabled={infoLoading}>
                Accept Invitation
              </Button>
            </HStack>
          }>
          {connectionsData}
        </ConsoleCard>
      </CardsCol>
      <Modal
        title="Create DIDComm Invitation"
        visible={modalState === 'create-invitation-open'}
        onCancel={modalCreateInvitationCancelHandler}
        footer={null}>
        <CreateInvitationForm
          onCancel={modalCreateInvitationCancelHandler}
          onSuccess={modalCreateInvitationSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
      <Modal
        title="Accept DIDComm Invitation"
        visible={modalState === 'accept-invitation-open'}
        onCancel={modalAcceptInvitationCancelHandler}
        footer={null}>
        <AcceptInvitationForm
          onCancel={modalAcceptInvitationCancelHandler}
          onSuccess={modalAcceptInvitationSuccessHandler}
          cloudAgentAPIs={cloudAgentAPIs}
        />
      </Modal>
    </CardsRow>
  );
};
