import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  SearchState,
  getColumnSearchProps,
  DangerLink,
  ActionHandler,
} from '../table';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { VStack } from '../layout-stacks';
import { Heading } from '../charts';
import {
  comparePresentationExchangeDataUpdateTimes,
  PresentationExchangeData,
} from '../../models/ACAPy/ProofPresentation';
import { modalDanger } from '../Form';
import { convertAriesDateToLocal } from '../../utils/ariesDate';

const CompletedProofsInfoTable = Table as React.FC<
  TableProps<PresentationExchangeData>
>;

const StyledConsoleTable = styled(CompletedProofsInfoTable)`
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
  dataSource: PresentationExchangeData[];
  loading?: boolean;
  onDelete: ActionHandler;
}

export const CompletedProofsList: React.FC<Props> = (props) => {
  const { dataSource, loading, onDelete: doRemove } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
  }): ColumnProps<PresentationExchangeData>[] => {
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
        render(_, proofInfo) {
          return convertAriesDateToLocal(proofInfo.record.updated_at);
        },
        sorter: comparePresentationExchangeDataUpdateTimes,
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
      },
      {
        key: 'remove',
        title: <span style={{ visibility: 'hidden' }}>{'Remove'}</span>,
        align: 'right',
        render(_, proofInfo) {
          return (
            <DangerLink
              onClick={() => {
                if (proofInfo.record.presentation_exchange_id)
                  opts.onRemove(proofInfo.record.presentation_exchange_id);
              }}
              className="CompletedProofPresentationsList__removeProofButton">
              Remove
            </DangerLink>
          );
        },
      },
    ];
  };

  const removeButtonHandler = useCallback(
    (presentationId: string): void => {
      modalDanger({
        title: 'Remove Completed Proof Record',
        content: (
          <p>
            Removing a proof record cannot be undone. Are you sure you want to
            remove this Completed Proof detail ?
          </p>
        ),
        onOk: () => doRemove(presentationId),
      });
    },
    [doRemove],
  );

  const columns = makeColumns({
    onRemove: removeButtonHandler,
  });

  return (
    <StyledConsoleTable
      id="CompletedProofsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) =>
        record.record.presentation_exchange_id ?? 'Missing Id!'
      }
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Proof Details </Heading>
            <pre>
              {JSON.stringify(
                record.record,
                // Filter out the aggregated_proof char array which
                // is just noise in the display.
                (key, value) => {
                  if (key === 'aggregated_proof') return undefined;
                  return value;
                },
                2,
              )}
            </pre>
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
