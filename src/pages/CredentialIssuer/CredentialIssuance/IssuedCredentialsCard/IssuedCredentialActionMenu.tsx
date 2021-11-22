import { CredRevRecordResult } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { Menu } from 'antd';
import React, { useContext } from 'react';
import { useAsync } from 'react-use';
import { AppContext } from '../../../../containers/App';
import {
  CredentialExchangeData,
  getIssuerCredentialRevocationStatus,
} from '../../../../models/ACAPy/CredentialIssuance';
import { ActionHandler } from '../../../../components/table';
import { MenuInfo } from 'rc-menu/lib/interface';

interface Props {
  credentialExchangeInfo: CredentialExchangeData;
  onRemove: ActionHandler;
  onRevoke: ActionHandler;
}

export const IssuedCredentialActionMenu = (props: Props): JSX.Element => {
  const { cloudAgentAPIs } = useContext(AppContext);

  const { value: revocationInfo, loading } = useAsync(async (): Promise<
    CredRevRecordResult | undefined
  > => {
    if (props.credentialExchangeInfo.record.revoc_reg_id) {
      return await getIssuerCredentialRevocationStatus(cloudAgentAPIs, {
        credExId: props.credentialExchangeInfo.record.credential_exchange_id,
      });
    } else {
      Promise.resolve(undefined);
    }
  }, [cloudAgentAPIs]);

  const onClickHandler = (event: MenuInfo): void => {
    // This is ugly but the Menu antd component doesn't allow a way
    // to pass arbitrary parameters to the onClickHandler so we
    // decode the action and the credential exchange Id from the
    // string "key" element.
    const keys = event.key.toString().split('_');

    if (keys[0] === 'remove') {
      props.onRemove(keys[1]);
    }
    if (keys[0] === 'revoke') {
      props.onRevoke(keys[1]);
    }
  };

  return (
    <Menu onClick={onClickHandler}>
      <Menu.Item
        key={`revoke_${props.credentialExchangeInfo.record.credential_exchange_id}`}
        danger={
          props.credentialExchangeInfo.record.revoc_reg_id !== undefined &&
          revocationInfo?.result?.state === 'issued'
        }
        disabled={
          props.credentialExchangeInfo.record.revoc_reg_id === undefined ||
          revocationInfo?.result?.state === 'revoked' ||
          loading
        }>
        Revoke Credential
      </Menu.Item>
      <Menu.Item
        key={`remove_${props.credentialExchangeInfo.record.credential_exchange_id}`}
        danger={true}>
        Remove
      </Menu.Item>
    </Menu>
  );
};
