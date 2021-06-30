/* eslint-disable no-eval */
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { HStack } from '../layout-stacks';
import React from 'react';
import { theme } from '../../theme';
import { get } from 'lodash';

export type SearchText = string | number;

export type SearchState = {
  searchText: SearchText;
  searchedColumn: string | string[];
};

const handleSearch = (
  selectedKeys: React.Key[],
  confirm: () => void,
  columnIndex: string | string[],
  setSearchState: React.Dispatch<SearchState>,
): void => {
  confirm();
  setSearchState({
    searchText: selectedKeys[0],
    searchedColumn: columnIndex,
  });
};

const handleReset = (
  setSearchState: React.Dispatch<SearchState>,
  currentSearchState: SearchState,
  clearFilters?: () => void,
): void => {
  if (clearFilters) {
    clearFilters();
  }
  setSearchState({
    searchText: '',
    searchedColumn: currentSearchState.searchedColumn,
  });
};

export const getColumnSearchProps = (
  columnIndex: string | string[],
  currentSearchState: SearchState,
  setSearchState: React.Dispatch<SearchState>,
): {} => {
  return {
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: FilterDropdownProps) => (
      <div style={{ padding: 8 }}>
        <Input
          placeholder={`Search ${columnIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys, confirm, columnIndex, setSearchState)
          }
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <HStack>
          <Button
            type="default"
            shape="round"
            onClick={() =>
              handleReset(setSearchState, currentSearchState, clearFilters)
            }
            size="small"
            style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="primary"
            shape="round"
            onClick={() =>
              handleSearch(selectedKeys, confirm, columnIndex, setSearchState)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}>
            Search
          </Button>
        </HStack>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        style={{ color: filtered ? theme.colors.sudoBlue : undefined }}
      />
    ),
    onFilter: (value: any, record: any) => {
      const field = get(record, columnIndex);
      return field
        ? field.toString().toLowerCase().includes(value.toLowerCase())
        : '';
    },
  };
};
