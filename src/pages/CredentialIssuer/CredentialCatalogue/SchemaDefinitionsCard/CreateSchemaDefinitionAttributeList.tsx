import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React from 'react';
import styled from 'styled-components';
import { consoleTableMixin, DangerLink } from '../../../../components/table';

export type SchemaAttribute = {
  name: string;
};

const AttributesTable = Table as React.FC<TableProps<SchemaAttribute>>;

const StyledConsoleTable = styled(AttributesTable)`
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
  dataSource: SchemaAttribute[];
  loading?: boolean;
  onDelete: (attribute: SchemaAttribute) => void;
}

export const CreateSchemaDefinitionAttributeList: React.FC<Props> = (props) => {
  const { dataSource, loading, onDelete: doRemove } = props;

  const makeColumns = (opts: {
    onRemove: (attribute: SchemaAttribute) => void;
  }): ColumnProps<SchemaAttribute>[] => {
    return [
      {
        title: 'Attribute Name',
        dataIndex: 'name',
      },
      {
        title: <span style={{ visibility: 'hidden' }}>{'Remove'}</span>,
        dataIndex: 'id',
        align: 'right',
        render(_, attributeInfo) {
          return (
            <DangerLink
              onClick={() => opts.onRemove(attributeInfo)}
              className="CreateSchemaDeginitionAttributeList__removeAttributeButton">
              Remove
            </DangerLink>
          );
        },
        sorter: (a, b) => ('' + a.name).localeCompare(b.name),
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
      },
    ];
  };

  const columns = makeColumns({
    onRemove: doRemove,
  });

  return (
    <StyledConsoleTable
      id="CreateSchemaDefinitionAttributeList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.name}
      pagination={{ pageSize: 5 }}
    />
  );
};
