import { Checkbox, DatePicker } from 'antd';
import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React from 'react';
import styled from 'styled-components';
import { consoleTableMixin } from '../../../../components/table';

const { RangePicker } = DatePicker;

export type RequestProofAttributeTimeWindow = {
  validTimeStart: number;
  validTimeEnd: number;
};

export type RequestProofSchemaAttribute = {
  name: string;
  credentialDefId: string;
  nonRevokedWindow?: RequestProofAttributeTimeWindow;
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
  doTimeWindowChange: (attribute: RequestProofSchemaAttribute) => void;
}

export const RequestProofAttributeList: React.FC<Props> = (props) => {
  const { dataSource, loading, doCheckChange, doTimeWindowChange } = props;

  const makeColumns = (opts: {
    onCheckedChange: (attribute: RequestProofSchemaAttribute) => void;
    onTimeWindowChange: (attribute: RequestProofSchemaAttribute) => void;
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
        key: 'validWindow',
        title: 'Not Revoked',
        dataIndex: 'validWindow',
        render(_, attributeInfo) {
          const rangeId = `RequestProofAttributeList__${attributeInfo.name}_ValidTimeWindow`;
          const dropdownId = `RequestProofAttributeList__${attributeInfo.name}_DatePicker`;
          return (
            <RangePicker
              showTime
              disabled={attributeInfo.nonRevokedWindow === undefined}
              use12Hours={false}
              format="YYYY-MM-DD HH:mm:ss"
              className={rangeId}
              dropdownClassName={dropdownId}
              disabledDate={(date) => {
                return date && date.valueOf() > Date.now();
              }}
              onOk={(e) => {
                const newAttribute = attributeInfo;
                newAttribute.nonRevokedWindow = {
                  validTimeStart: Math.floor(
                    (e?.[0]?.toDate().getTime() ?? Date.now()) / 1000,
                  ),
                  validTimeEnd: Math.floor(
                    (e?.[1]?.toDate().getTime() ?? Date.now()) / 1000,
                  ),
                };
                opts.onTimeWindowChange(newAttribute);
              }}
            />
          );
        },
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
    onTimeWindowChange: doTimeWindowChange,
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
