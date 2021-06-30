import { Checkbox, Select } from 'antd';
import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React from 'react';
import styled from 'styled-components';
import { consoleTableMixin } from '../../../../components/table';

const { Option } = Select;

export type PresentationAttributeOption = {
  possibleValue: string;
  donorCredentialId: string;
  selected: boolean;
};

export type PresentationSchemaAttribute = {
  attributeName: string;
  options: PresentationAttributeOption[]; // Available matching credential attributes
  revealValue: boolean; // Whether to include raw attribute value in presentation
};

const RequiredAttributesTable = Table as React.FC<
  TableProps<PresentationSchemaAttribute>
>;

const StyledConsoleTable = styled(RequiredAttributesTable)`
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
  dataSource: PresentationSchemaAttribute[];
  loading?: boolean;
  doChangeAttribute: (newAttribute: PresentationSchemaAttribute) => void;
}

export const ProofPresentationAttributeList: React.FC<Props> = (props) => {
  const { dataSource, loading, doChangeAttribute } = props;

  const doChangeSelected = (
    attribute: PresentationSchemaAttribute,
    newSelectionIndex: number,
  ): void => {
    // Look through the attribute and switch the selected item before
    // passing it on to the doChangeAttribute callback
    const newOptions = attribute.options.map((option, index) => ({
      possibleValue: option.possibleValue,
      donorCredentialId: option.donorCredentialId,
      selected: index === newSelectionIndex ? true : false,
    }));
    doChangeAttribute({
      attributeName: attribute.attributeName,
      options: newOptions,
      revealValue: attribute.revealValue,
    });
  };

  const makeColumns = (opts: {
    onChangeSelect: (
      attribute: PresentationSchemaAttribute,
      selectedIndex: number,
    ) => void;
    onChangeRevealValue: (attribute: PresentationSchemaAttribute) => void;
  }): ColumnProps<PresentationSchemaAttribute>[] => {
    return [
      {
        key: 'attributeName',
        title: 'Attribute Name',
        dataIndex: 'attributeName',
        ellipsis: true,
        width: '35%',
      },
      {
        key: 'attributeName',
        title: 'Value Options',
        dataIndex: 'options',
        ellipsis: true,
        width: '65%',
        render(_, attribute) {
          const options = attribute.options.map((option, index) => (
            <Option size="small" value={index} key={index}>
              {option.possibleValue} ({option.donorCredentialId.substr(0, 4)})
            </Option>
          ));
          const selected = attribute.options.find((option) => option.selected);

          return (
            <Select
              size="small"
              value={
                selected?.possibleValue +
                ' (' +
                selected?.donorCredentialId.substr(0, 4) +
                ')'
              }
              onChange={(index) =>
                opts.onChangeSelect(attribute, parseInt(index))
              }>
              {options}
            </Select>
          );
        },
      },
      {
        key: 'attributeName',
        title: 'Reveal',
        dataIndex: 'revealValue',
        align: 'right',
        width: '80px',
        render(_, attributeInfo) {
          return (
            <Checkbox
              defaultChecked={attributeInfo.revealValue}
              onChange={(e) => {
                const newAttribute = attributeInfo;
                newAttribute.revealValue = e.target.checked;
                opts.onChangeRevealValue(newAttribute);
              }}
              className="ProofPresentationAttributeList__revealValueCheck"></Checkbox>
          );
        },
      },
    ];
  };

  const columns = makeColumns({
    onChangeSelect: doChangeSelected,
    onChangeRevealValue: doChangeAttribute,
  });

  return (
    <StyledConsoleTable
      id="ProofPresentationAttributeList"
      loading={loading}
      columns={columns}
      dataSource={dataSource.sort((a, b) =>
        ('' + a.attributeName).localeCompare(b.attributeName),
      )}
      rowKey={(record) => record.attributeName}
      pagination={{ pageSize: 6 }}
    />
  );
};
