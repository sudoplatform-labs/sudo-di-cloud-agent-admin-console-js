import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  SearchState,
  getColumnSearchProps,
  DangerLink,
  ActionHandler,
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
  onDelete: ActionHandler;
}

export const IssuedCredentialsList: React.FC<Props> = (props) => {
  const { dataSource, loading, onDelete: doRemove } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
  }): ColumnProps<CredentialExchangeData>[] => {
    return [
      {
        title: 'Thread',
        dataIndex: ['record', 'thread_id'],
        ellipsis: true,
        ...getColumnSearchProps(
          ['record', 'thread_id'],
          searchState,
          setSearchState,
        ),
      },
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
        title: 'State',
        dataIndex: ['record', 'state'],
        ellipsis: true,
        ...getColumnSearchProps(
          ['record', 'state'],
          searchState,
          setSearchState,
        ),
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
        key: 'remove',
        title: <span style={{ visibility: 'hidden' }}>{'Remove'}</span>,
        align: 'right',
        render(_, credentialInfo) {
          return (
            <DangerLink
              onClick={() => {
                if (credentialInfo.record.credential_exchange_id)
                  opts.onRemove(credentialInfo.record.credential_exchange_id);
              }}
              className="CompletedCredentialExchangeList__removeExchangeButton">
              Remove
            </DangerLink>
          );
        },
      },
    ];
  };

  const removeButtonHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalDanger({
        title: 'Remove Completed Credential Issuance Record',
        content: (
          <p>
            Removing a credential issuance record cannot be undone. Are you sure
            you want to remove this record detail ?
          </p>
        ),
        onOk: () => doRemove(credentialExchangeId),
      });
    },
    [doRemove],
  );

  const columns = makeColumns({
    onRemove: removeButtonHandler,
  });

  return (
    <StyledConsoleTable
      id="IssuedCredentialsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(data) => data.record.credential_id ?? 'Missing Id!'}
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Credential Details </Heading>
            <pre>{JSON.stringify(record.record, undefined, 2)}</pre>
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
