import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  DangerLink,
  ActionHandler,
  SearchState,
  getColumnSearchProps,
} from '../../../components/table';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { VStack } from '../../../components/layout-stacks';
import { Heading } from '../../../components/charts';
import { modalDanger } from '../../../components/Form';
import { compareConnectionUpdateTimes } from '../../../models/ACAPy/Connections';
import { ConnRecord } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { convertAriesDateToLocal } from '../../../utils/ariesDate';

const ConnectionsInfoTable = Table as React.FC<TableProps<ConnRecord>>;

const StyledConsoleTable = styled(ConnectionsInfoTable)`
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
  dataSource: ConnRecord[];
  loading?: boolean;
  onDelete: (connectionId: string) => void;
}

export const ConnectionsList: React.FC<Props> = (props) => {
  const { dataSource, loading, onDelete: doRemove } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
  }): ColumnProps<ConnRecord>[] => {
    return [
      {
        title: 'Alias',
        dataIndex: 'alias',
        ellipsis: true,
        ...getColumnSearchProps('alias', searchState, setSearchState),
      },
      {
        title: 'State',
        ellipsis: true,
        dataIndex: 'state',
        ...getColumnSearchProps('state', searchState, setSearchState),
      },
      {
        title: 'Type',
        width: '20%',
        dataIndex: 'invitation_mode',
        ...getColumnSearchProps('invitation_mode', searchState, setSearchState),
      },
      {
        title: 'Updated',
        dataIndex: 'updated_at',
        ellipsis: true,
        render(_, connectionInfo) {
          return convertAriesDateToLocal(connectionInfo.updated_at);
        },
        sorter: compareConnectionUpdateTimes,
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
      },
      {
        key: 'remove',
        width: '10%',
        title: <span style={{ visibility: 'hidden' }}>{'Remove'}</span>,
        align: 'right',
        render(_, connectionInfo) {
          return (
            <DangerLink
              onClick={() => {
                if (connectionInfo.connection_id)
                  opts.onRemove(connectionInfo.connection_id);
              }}
              className="ConnectionsList__removeConnectionButton">
              Remove
            </DangerLink>
          );
        },
      },
    ];
  };

  const removeButtonHandler = useCallback(
    (connectionId: string): void => {
      modalDanger({
        title: 'Remove Connection',
        content: (
          <p>
            Removing a connection cannot be undone. When this connection is
            removed it will no longer be possible to use DIDComm to communicate
            to the associated Agent. Are you sure you want to remove this
            Connection ?
          </p>
        ),
        onOk: () => doRemove(connectionId),
      });
    },
    [doRemove],
  );

  const columns = makeColumns({
    onRemove: removeButtonHandler,
  });

  return (
    <StyledConsoleTable
      id="ConnectionsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.connection_id ?? 'Missing Id!'}
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Connection Details </Heading>
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
