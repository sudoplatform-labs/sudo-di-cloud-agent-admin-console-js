import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { consoleTableMixin } from '../../../components/table';
import { theme } from '../../../theme';
import { Button } from 'antd';
import { DID, DIDPostureEnum } from '@sudoplatform-labs/sudo-di-cloud-agent';

export const WriteToLedgerButton = styled(Button)`
  color: ${theme.colors.sudoBlue};
`;

export type WriteToLedgerHandler = (didInfo: DID) => void;

function makeColumns(opts: {
  onWriteToLedger: WriteToLedgerHandler;
}): ColumnProps<DID>[] {
  return [
    {
      title: 'Decentralized Identifier',
      dataIndex: 'did',
    },
    {
      title: 'Verification Key',
      dataIndex: 'verkey',
    },
    {
      title: 'On Public Ledger',
      dataIndex: 'posture',
      render(_, didInfo) {
        const status =
          didInfo.posture === DIDPostureEnum.WalletOnly
            ? 'Write to Ledger'
            : 'Written to Ledger';
        return (
          <WriteToLedgerButton
            id={'DecentralizedIdentifiersList__write-did-btn_'.concat(
              didInfo.did?.substr(0, 4) ?? '*',
            )}
            type="default"
            shape="round"
            onClick={() => opts.onWriteToLedger(didInfo)}
            disabled={didInfo.posture !== DIDPostureEnum.WalletOnly}>
            {status}
          </WriteToLedgerButton>
        );
      },
    },
  ];
}

const DecentralizedIdentifierInfoTable = Table as React.FC<TableProps<DID>>;

const StyledConsoleTable = styled(DecentralizedIdentifierInfoTable)`
  ${consoleTableMixin}
  & tr > td,
  tr > th {
    padding: 16px 24px;
  }
  ul.ant-pagination.ant-table-pagination {
    margin-right: 24px;
  }
`;

interface Props {
  dataSource: DID[];
  loading?: boolean;
  onWriteToLedger: WriteToLedgerHandler;
}

export const DecentralizedIdentifiersList: React.FC<Props> = (props) => {
  const { onWriteToLedger } = props;
  const columns = useMemo(
    () =>
      makeColumns({
        onWriteToLedger: onWriteToLedger,
      }),
    [onWriteToLedger],
  );

  return (
    <StyledConsoleTable
      id="DecentralizedIdentifiersList"
      loading={props.loading}
      columns={columns}
      dataSource={props.dataSource}
      rowKey="did"
    />
  );
};
