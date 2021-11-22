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
import { Schema } from '@sudoplatform-labs/sudo-di-cloud-agent';

const SchemaInfoTable = Table as React.FC<TableProps<Schema>>;

const StyledConsoleTable = styled(SchemaInfoTable)`
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
  dataSource: Schema[];
  loading?: boolean;
}

export const SchemaDefinitionsList: React.FC<Props> = (props) => {
  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (): ColumnProps<Schema>[] => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        ...getColumnSearchProps('name', searchState, setSearchState),
      },
      {
        title: 'Version',
        dataIndex: 'version',
        ...getColumnSearchProps('version', searchState, setSearchState),
      },
      {
        title: 'Sequence',
        dataIndex: 'seqNo',
        ...getColumnSearchProps('seqNo', searchState, setSearchState),
      },
    ];
  };

  const columns = makeColumns();

  return (
    <StyledConsoleTable
      id="SchemaDefinitionsList"
      loading={props.loading}
      columns={columns}
      dataSource={props.dataSource}
      rowKey={(record) => record.id ?? ''}
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Schema Identifier </Heading>
            <p> {record.id} </p>
            <Heading> Schema Attribute Names </Heading>
            <p> {record.attrNames?.join(', ')} </p>
            <Heading> Ledger Node Protocol Version </Heading>
            <p> {record.ver} </p>
          </VStack>
        ),
        expandIcon: ({ expanded, onExpand, record }) => {
          if (expanded)
            return <MinusSquareOutlined onClick={(e) => onExpand(record, e)} />;
          else
            return <PlusSquareOutlined onClick={(e) => onExpand(record, e)} />;
        },
      }}
    />
  );
};
