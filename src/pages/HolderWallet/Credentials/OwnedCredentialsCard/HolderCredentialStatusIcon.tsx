import {
  CloseSquareTwoTone,
  LoadingOutlined,
  SafetyCertificateTwoTone,
  WarningTwoTone,
} from '@ant-design/icons';
import {
  CredRevokedResult,
  IndyCredInfo,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import React, { useContext } from 'react';
import { useAsync } from 'react-use';
import { AppContext } from '../../../../containers/App';
import { getHolderCredentialRevocationStatus } from '../../../../models/ACAPy/CredentialIssuance';
import { theme } from '../../../../theme';

interface Props {
  credentialInfo: IndyCredInfo;
}

export const HolderCredentialStatusIcon = (props: Props): JSX.Element => {
  const { cloudAgentAPIs } = useContext(AppContext);

  const { value: revocationInfo, loading } = useAsync(async (): Promise<
    CredRevokedResult | undefined
  > => {
    if (props.credentialInfo.rev_reg_id) {
      return await getHolderCredentialRevocationStatus(cloudAgentAPIs, {
        credentialId: props.credentialInfo.referent ?? '',
      });
    } else {
      Promise.resolve(undefined);
    }
  }, [cloudAgentAPIs]);

  if (props.credentialInfo.rev_reg_id) {
    if (loading) {
      return <LoadingOutlined color={theme.colors.sudoBlue} />;
    } else if (revocationInfo) {
      if (revocationInfo?.revoked) {
        return <CloseSquareTwoTone twoToneColor={theme.colors.coral} />;
      } else {
        return (
          <SafetyCertificateTwoTone twoToneColor={theme.colors.darkMint} />
        );
      }
    } else {
      return <WarningTwoTone twoToneColor={theme.colors.sunShade} />;
    }
  } else {
    // Non-Revocable credential
    return <SafetyCertificateTwoTone twoToneColor={theme.colors.darkMint} />;
  }
};
