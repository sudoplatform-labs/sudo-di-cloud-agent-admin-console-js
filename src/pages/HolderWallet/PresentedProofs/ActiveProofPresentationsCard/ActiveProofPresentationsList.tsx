import Table, { ColumnProps, TableProps } from 'antd/lib/table';
import React, { useState, useCallback, ReactElement } from 'react';
import styled from 'styled-components';
import {
  consoleTableMixin,
  ActionHandler,
  ActionLink,
  SearchState,
  getColumnSearchProps,
} from '../../../../components/table';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';
import { MenuInfo } from 'rc-menu/lib/interface';
import { VStack } from '../../../../components/layout-stacks';
import { Heading } from '../../../../components/charts';
import { Dropdown, Menu } from 'antd';
import { modalDanger } from '../../../../components/Form';
import { V10PresentationExchange } from '@sudoplatform-labs/sudo-di-cloud-agent';
import {
  comparePresentationExchangeDataUpdateTimes,
  PresentationExchangeData,
} from '../../../../models/ACAPy/ProofPresentation';
import { convertAriesDateToLocal } from '../../../../utils/ariesDate';

const ActiveProofPresentationsInfoTable = Table as React.FC<
  TableProps<PresentationExchangeData>
>;

const StyledConsoleTable = styled(ActiveProofPresentationsInfoTable)`
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
  onPrepareProof: ActionHandler;
}

export const ActiveProofPresentationsList: React.FC<Props> = (props) => {
  const {
    dataSource,
    loading,
    onDelete: doRemove,
    onPrepareProof: doPrepare,
  } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
    onPrepare: ActionHandler;
  }): ColumnProps<PresentationExchangeData>[] => {
    const onClickHandler = (event: MenuInfo): void => {
      // This is ugly but the Menu antd component doesn't allow a way
      // to pass arbitrary parameters to the onClickHandler so we
      // decode the action and the credential exchange Id from the
      // string "key" element.
      const keys = event.key.toString().split('_');

      if (keys[0] === 'reject') {
        opts.onRemove(keys[1]);
      }
      if (keys[0] === 'prepare') {
        opts.onPrepare(keys[1]);
      }
    };

    const actionMenu = (
      proofExchangeInfo: V10PresentationExchange,
    ): ReactElement => {
      return (
        <Menu onClick={onClickHandler}>
          <Menu.Item
            key={`prepare_${proofExchangeInfo.presentation_exchange_id}`}
            disabled={proofExchangeInfo.state !== 'request_received'}>
            Create Presentation
          </Menu.Item>
          <Menu.Item
            key={`reject_${proofExchangeInfo.presentation_exchange_id}`}
            danger={true}>
            Cancel Proof
          </Menu.Item>
        </Menu>
      );
    };

    return [
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
        ellipsis: true,
        dataIndex: ['record', 'state'],
        ...getColumnSearchProps(
          ['record', 'state'],
          searchState,
          setSearchState,
        ),
      },
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
        key: 'action',
        width: '10%',
        title: <span style={{ visibility: 'hidden' }}>{'action'}</span>,
        dataIndex: 'pesentation_exchange_id',
        align: 'right',
        render(_, proofInfo) {
          return (
            <Dropdown
              overlay={actionMenu(proofInfo.record)}
              trigger={['click']}>
              <ActionLink
                className="ActiveProofPesentationsList__actionMenu"
                onClick={(e) => e.preventDefault()}>
                Actions
              </ActionLink>
            </Dropdown>
          );
        },
      },
    ];
  };

  const cancelActionHandler = useCallback(
    (proofExchangeId: string): void => {
      modalDanger({
        title: 'Cancel Proof Request',
        content: <p>Are you sure you want to remove proof request ?</p>,
        onOk: () => doRemove(proofExchangeId),
        okText: 'Remove',
      });
    },
    [doRemove],
  );

  const prepareActionHandler = useCallback(
    (proofExchangeId: string): void => {
      doPrepare(proofExchangeId);
    },
    [doPrepare],
  );

  const columns = makeColumns({
    onRemove: cancelActionHandler,
    onPrepare: prepareActionHandler,
  });

  return (
    <StyledConsoleTable
      id="ActiveProofPresentationsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) =>
        record.record.presentation_exchange_id ?? 'Missing Id!'
      }
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Proof Request Details </Heading>
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
