import { Checkbox } from 'antd';
import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React from 'react';
import styled from 'styled-components';
import { consoleTableMixin } from '../../../../components/table';

export type RequestProofSchemaAttribute = {
  name: string;
  issuerDID: string;
  included: boolean;
};

const AttributesTable = Table as React.FC<
  TableProps<RequestProofSchemaAttribute>
>;

const StyledConsoleTable = styled(AttributesTable)`
  ${consoleTableMixin}
  & tr > td,
  tr > th {
    padding: 8px 8px;
  }
  ul.ant-pagination.ant-table-pagination {
    margin-right: 24px;
  }
`;

interface Props {
  dataSource: RequestProofSchemaAttribute[];
  loading?: boolean;
  doCheckChange: (attribute: RequestProofSchemaAttribute) => void;
}

export const RequestProofAttributeList: React.FC<Props> = (props) => {
  const { dataSource, loading, doCheckChange } = props;

  const makeColumns = (opts: {
    onCheckedChange: (attribute: RequestProofSchemaAttribute) => void;
  }): ColumnProps<RequestProofSchemaAttribute>[] => {
    return [
      {
        key: 'name',
        title: 'Attribute Name',
        dataIndex: 'name',
        sorter: (a, b) => ('' + a.name).localeCompare(b.name),
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
        ellipsis: true,
      },
      {
        key: 'issuerDID',
        title: 'Issuer DID',
        dataIndex: 'issuerDID',
        ellipsis: true,
      },
      {
        key: 'included',
        title: 'Require',
        dataIndex: 'included',
        align: 'right',
        width: '80px',
        render(_, attributeInfo) {
          return (
            <Checkbox
              defaultChecked={attributeInfo.included}
              onChange={(e) => {
                const newAttribute = attributeInfo;
                newAttribute.included = e.target.checked;
                opts.onCheckedChange(newAttribute);
              }}
              className="RequestProofAttributeList__attributeInludedCheck"></Checkbox>
          );
        },
      },
    ];
  };

  const columns = makeColumns({
    onCheckedChange: doCheckChange,
  });

  return (
    <StyledConsoleTable
      id="RequestProofAttributeList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.name}
      pagination={{ pageSize: 4 }}
    />
  );
};
