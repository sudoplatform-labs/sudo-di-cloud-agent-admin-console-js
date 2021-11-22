import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  SearchState,
  getColumnSearchProps,
} from '../../../../components/table';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { VStack } from '../../../../components/layout-stacks';
import { Heading } from '../../../../components/charts';
import { CredentialDefinition } from '@sudoplatform-labs/sudo-di-cloud-agent';

const CredentialDefinitionsInfoTable = Table as React.FC<
  TableProps<CredentialDefinition>
>;

const StyledConsoleTable = styled(CredentialDefinitionsInfoTable)`
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
  dataSource: CredentialDefinition[];
  loading?: boolean;
}

export const CredentialDefinitionsList: React.FC<Props> = (props) => {
  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (): ColumnProps<CredentialDefinition>[] => {
    return [
      {
        title: 'Name',
        dataIndex: 'tag',
        ...getColumnSearchProps('tag', searchState, setSearchState),
      },
      {
        title: 'Revocable',
        width: '10%',
        render(_, credentialDefinition) {
          if (credentialDefinition.value?.revocation !== undefined) {
            return 'Yes';
          } else {
            return 'No';
          }
        },
        sorter: (a, b) =>
          a.value?.revocation
            ? b.value?.revocation
              ? 0
              : 1
            : b.value?.revocation
            ? -1
            : 0,
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
      },
      {
        title: 'Signature Type',
        dataIndex: 'type',
        ...getColumnSearchProps('type', searchState, setSearchState),
      },
      {
        title: 'Schema Sequence',
        dataIndex: 'schemaId',
        ...getColumnSearchProps('schemaId', searchState, setSearchState),
      },
    ];
  };

  const columns = makeColumns();

  return (
    <StyledConsoleTable
      id="CredentialDefinitionsList"
      loading={props.loading}
      columns={columns}
      dataSource={props.dataSource}
      rowKey={(record) => record.id ?? 'Missing Id!'}
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Credential Definition Identifier </Heading>
            <p> {record.id} </p>
            <Heading> Ledger Node Protocol Version </Heading>
            <p> {record.ver} </p>
            <Heading> Values </Heading>
            <pre>{JSON.stringify(record.value, undefined, 2)}</pre>
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
