import {
  CloseSquareTwoTone,
  InteractionTwoTone,
  LoadingOutlined,
  SafetyCertificateTwoTone,
  WarningTwoTone,
} from '@ant-design/icons';
import { CredRevRecordResult } from '@sudoplatform-labs/sudo-di-cloud-agent';
import React, { useContext } from 'react';
import { useAsync } from 'react-use';
import { AppContext } from '../../../../containers/App';
import {
  CredentialExchangeData,
  getIssuerCredentialRevocationStatus,
} from '../../../../models/ACAPy/CredentialIssuance';
import { theme } from '../../../../theme';

interface Props {
  credentialExchangeInfo: CredentialExchangeData;
}

export const IssuerCredentialStatusIcon = (props: Props): JSX.Element => {
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

  if (!props.credentialExchangeInfo.record.revoc_reg_id) {
    // Non-revocable credential so status depends on credential
    // Issuance state alone
    if (
      props.credentialExchangeInfo.record.state === 'credential_issued' ||
      props.credentialExchangeInfo.record.state === 'credential_acked'
    ) {
      return <SafetyCertificateTwoTone twoToneColor={theme.colors.darkMint} />;
    } else {
      return <InteractionTwoTone twoToneColor={theme.colors.sudoBlue} />;
    }
  } else {
    if (loading) {
      return <LoadingOutlined color={theme.colors.sudoBlue} />;
    } else if (revocationInfo) {
      if (revocationInfo?.result?.state === 'revoked') {
        return <CloseSquareTwoTone twoToneColor={theme.colors.coral} />;
      } else {
        return (
          <SafetyCertificateTwoTone twoToneColor={theme.colors.darkMint} />
        );
      }
    } else {
      return <WarningTwoTone color={theme.colors.sunShade} />;
    }
  }
};
