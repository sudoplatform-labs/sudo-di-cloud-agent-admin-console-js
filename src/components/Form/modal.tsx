import { ExclamationCircleFilled } from '@ant-design/icons';
import { Modal, Button } from 'antd';
import { ModalFuncProps } from 'antd/lib/modal';
import React from 'react';
import { theme } from '../../theme';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../containers/App';
import Markdown from 'markdown-to-jsx';
import {
  acceptLedgerTaa,
  fetchLedgerTaa,
} from '../../models/ACAPy/TransactionAuthorAgreement';

export function modalInfo(props: ModalFuncProps): void {
  Modal.info({
    okText: 'Ok',
    ...props,

    okButtonProps: {
      type: 'primary',
      shape: 'round',
      ...props.okButtonProps,
    },
  });
}

export function modalConfirm(props: ModalFuncProps): void {
  Modal.confirm({
    okText: 'Confirm',
    cancelText: 'Cancel',
    ...props,

    okButtonProps: {
      type: 'primary',
      shape: 'round',
      ...props.okButtonProps,
    },

    cancelButtonProps: {
      type: 'default',
      shape: 'round',
      ...props.cancelButtonProps,
    },
  });
}

export function modalDanger(props: ModalFuncProps): void {
  Modal.confirm({
    icon: <ExclamationCircleFilled style={{ color: theme.colors.coral }} />,
    okText: 'Confirm',
    okType: 'danger',
    cancelText: 'Cancel',
    ...props,

    okButtonProps: {
      type: 'primary',
      shape: 'round',
      ...props.okButtonProps,
    },

    cancelButtonProps: {
      type: 'default',
      shape: 'round',
      ...props.cancelButtonProps,
    },
  });
}

export async function modalTAAAcceptance(
  cloudAgentAPIs: CloudAgentAPI,
  onAccept: () => Promise<void>,
  onCancel?: () => Promise<void>,
): Promise<void> {
  // Get the current TAA from the ledger and display for
  // acceptance before we can write the schema to the ledger
  const taa = await fetchLedgerTaa(cloudAgentAPIs);
  const taaRequired = taa.taa_required ?? false;
  const content = taa?.taa_record?.text ?? 'No Ledger TAA text available';

  if (taaRequired) {
    modalDanger({
      width: '65%',
      title: 'Transaction Authors Agreement (TAA)',
      content: <Markdown>{content}</Markdown>,
      autoFocusButton: null,
      okText: 'Accept',
      onOk: async () => {
        await acceptLedgerTaa(cloudAgentAPIs, {
          // see https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/TAA/AML.md
          mechanism: 'at_submission',
          text: content,
          version: taa?.taa_record?.version,
        });
        await onAccept();
      },
      okButtonProps: { id: 'CreateSchemaDefinitionForm__taa-accept-btn' },
      onCancel: onCancel,
      cancelButtonProps: {
        id: 'CreateSchemaDefinitionForm__taa-cancel-btn',
      },
    });
  } else {
    // If there is no need to accept the TAA treat it as a successful
    // acceptance.
    onAccept();
  }
}

export const ModalFooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0 -24px -8px;
  padding: 18px 24px 0;
`;

export const ModalCancelButton = styled(Button)`
  min-width: 112px;
`;

export const ModalSubmitButton = styled(ModalCancelButton)`
  margin-left: 12px;
`;
