import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  DangerLink,
  ActionHandler,
  SearchState,
  getColumnSearchProps,
} from '../../../../components/table';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { VStack } from '../../../../components/layout-stacks';
import { Heading } from '../../../../components/charts';
import { modalDanger } from '../../../../components/Form';
import { IndyCredInfo } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { HolderCredentialStatusIcon } from './HolderCredentialStatusIcon';

const OwnedCredentialsInfoTable = Table as React.FC<TableProps<IndyCredInfo>>;

const StyledConsoleTable = styled(OwnedCredentialsInfoTable)`
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
  dataSource: IndyCredInfo[];
  loading?: boolean;
  onDelete: ActionHandler;
}

export const OwnedCredentialsList: React.FC<Props> = (props) => {
  const { dataSource, loading, onDelete: doRemove } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
  }): ColumnProps<IndyCredInfo>[] => {
    return [
      {
        title: 'Credential Id',
        width: '20%',
        dataIndex: 'referent',
        ...getColumnSearchProps('referent', searchState, setSearchState),
        ellipsis: true,
      },
      {
        title: 'Status',
        width: '10%',
        align: 'center',
        render(_, credentialInfo) {
          return <HolderCredentialStatusIcon credentialInfo={credentialInfo} />;
        },
      },
      {
        title: 'Credential Type',
        dataIndex: 'cred_def_id',
        ...getColumnSearchProps('cred_def_id', searchState, setSearchState),
      },
      {
        title: 'Schema',
        dataIndex: 'schema_id',
        ...getColumnSearchProps('schema_id', searchState, setSearchState),
      },
      {
        key: 'remove',
        width: '10%',
        title: <span style={{ visibility: 'hidden' }}>{'Remove'}</span>,
        align: 'right',
        render(_, credentialInfo) {
          return (
            <DangerLink
              onClick={() => {
                if (credentialInfo.referent)
                  opts.onRemove(credentialInfo.referent);
              }}
              className="CredentialsList__removeCredentialButton">
              Remove
            </DangerLink>
          );
        },
      },
    ];
  };

  const removeButtonHandler = useCallback(
    (credentialId: string): void => {
      modalDanger({
        title: 'Remove Credential',
        content: (
          <p>
            Removing a credential cannot be undone. Are you sure you want to
            remove this Credential ?
          </p>
        ),
        onOk: () => doRemove(credentialId),
      });
    },
    [doRemove],
  );

  const columns = makeColumns({
    onRemove: removeButtonHandler,
  });

  return (
    <StyledConsoleTable
      id="OwnedCredentialsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.referent ?? 'Missing Id'}
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
