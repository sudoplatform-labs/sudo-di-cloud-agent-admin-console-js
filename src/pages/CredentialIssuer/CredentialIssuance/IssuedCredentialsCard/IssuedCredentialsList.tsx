import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  SearchState,
  getColumnSearchProps,
  ActionHandler,
  ActionLink,
} from '../../../../components/table';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { VStack } from '../../../../components/layout-stacks';
import { Heading } from '../../../../components/charts';
import {
  compareCredentialExchangeDataUpdateTimes,
  CredentialExchangeData,
} from '../../../../models/ACAPy/CredentialIssuance';
import { modalDanger } from '../../../../components/Form';
import { convertAriesDateToLocal } from '../../../../utils/ariesDate';
import { Dropdown } from 'antd';
import { IssuerCredentialStatusIcon } from './IssuerCredentialStatusIcon';
import { IssuedCredentialActionMenu } from './IssuedCredentialActionMenu';

const IssuedCredentialsInfoTable = Table as React.FC<
  TableProps<CredentialExchangeData>
>;

const StyledConsoleTable = styled(IssuedCredentialsInfoTable)`
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
  dataSource: CredentialExchangeData[];
  loading?: boolean;
  doDelete: (credentialExchangeId: string) => void;
  doRevoke: (credentialExchangeId: string) => void;
}

export const IssuedCredentialsList: React.FC<Props> = (props) => {
  const { dataSource, loading, doDelete, doRevoke } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
    onRevoke: ActionHandler;
  }): ColumnProps<CredentialExchangeData>[] => {
    return [
      {
        title: 'Credential Type',
        dataIndex: ['record', 'credential_definition_id'],
        ...getColumnSearchProps(
          ['record', 'credential_definition_id'],
          searchState,
          setSearchState,
        ),
      },
      {
        title: 'Connection',
        dataIndex: ['connection', 'alias'],
        ellipsis: true,
        ...getColumnSearchProps(
          ['connection', 'alias'],
          searchState,
          setSearchState,
        ),
      },
      {
        title: 'Status',
        width: '10%',
        align: 'center',
        render(_, credentialInfo) {
          return (
            <IssuerCredentialStatusIcon
              credentialExchangeInfo={credentialInfo}
            />
          );
        },
      },
      {
        title: 'Updated',
        ellipsis: true,
        render(_, credentialInfo) {
          return convertAriesDateToLocal(credentialInfo.record.updated_at);
        },
        sorter: compareCredentialExchangeDataUpdateTimes,
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
      },
      {
        key: 'action',
        title: <span style={{ visibility: 'hidden' }}>{'action'}</span>,
        width: '10%',
        align: 'right',
        render(_, credentialInfo) {
          return (
            <Dropdown
              overlay={
                <IssuedCredentialActionMenu
                  credentialExchangeInfo={credentialInfo}
                  onRemove={opts.onRemove}
                  onRevoke={opts.onRevoke}
                />
              }
              trigger={['click']}>
              <ActionLink
                className="CompletedCredentialExchangeList__actionMenu"
                onClick={(e) => e.preventDefault()}>
                Actions
              </ActionLink>
            </Dropdown>
          );
        },
      },
    ];
  };

  const removeActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalDanger({
        title: 'Remove Completed Credential Issuance Record',
        content: (
          <p>
            Removing a credential issuance record cannot be undone. If the
            credential type is revocable, you will lose the ability to revoke
            it. Are you sure you want to remove knowledge of this credential ?
          </p>
        ),
        onOk: () => doDelete(credentialExchangeId),
      });
    },
    [doDelete],
  );

  const revokeActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalDanger({
        title: 'Revoke Credential',
        content: (
          <p>
            Are you sure you want to Revoke this credential ? Once a credential
            is revoked, the Holder can still present it in a proof but it will
            NOT verify as valid for any point in time after the revocation is
            published to the ledger. The Holder CAN continue to prove the
            credential WAS valid at a time PRIOR to the revocation.
          </p>
        ),
        onOk: () => doRevoke(credentialExchangeId),
        okText: 'Revoke',
      });
    },
    [doRevoke],
  );

  const columns = makeColumns({
    onRemove: removeActionHandler,
    onRevoke: revokeActionHandler,
  });

  return (
    <StyledConsoleTable
      id="IssuedCredentialsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(data) => data.record.credential_exchange_id ?? 'Missing Id!'}
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Credential Details </Heading>
            <pre>{JSON.stringify(record, undefined, 2)}</pre>
          </VStack>
        ),
        expandIcon: ({ expanded, onExpand, record }) => {
          if (expanded) {
            return <MinusSquareOutlined onClick={(e) => onExpand(record, e)} />;
          } else
            return <PlusSquareOutlined onClick={(e) => onExpand(record, e)} />;
        },
      }}
    />
  );
};
