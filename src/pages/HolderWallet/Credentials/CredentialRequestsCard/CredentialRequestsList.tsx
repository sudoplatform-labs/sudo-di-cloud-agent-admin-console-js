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
import { Menu, Dropdown } from 'antd';
import {
  compareCredentialExchangeDataUpdateTimes,
  CredentialExchangeData,
} from '../../../../models/ACAPy/CredentialIssuance';
import { modalConfirm, modalDanger } from '../../../../components/Form';
import { V10CredentialExchange } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { convertAriesDateToLocal } from '../../../../utils/ariesDate';

const CredentialRequestsInfoTable = Table as React.FC<
  TableProps<CredentialExchangeData>
>;

const StyledConsoleTable = styled(CredentialRequestsInfoTable)`
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
  dataSource: CredentialExchangeData[];
  loading?: boolean;
  onDelete: (credentialExchangeId: string) => void;
  onAccept: (credentialExchangeId: string) => void;
  onStore: (credentialExchangeId: string) => void;
}

export const CredentialRequestsList: React.FC<Props> = (props) => {
  const {
    dataSource,
    loading,
    onDelete: doRemove,
    onAccept: doAccept,
    onStore: doStore,
  } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
    onAccept: ActionHandler;
    onStore: ActionHandler;
  }): ColumnProps<CredentialExchangeData>[] => {
    const onClickHandler = (event: MenuInfo): void => {
      // This is ugly but the Menu antd component doesn't allow a way
      // to pass arbitrary parameters to the onClickHandler so we
      // decode the action and the credential exchange Id from the
      // string "key" element.
      const keys = event.key.toString().split('_');

      if (keys[0] === 'cancel') {
        opts.onRemove(keys[1]);
      }
      if (keys[0] === 'accept') {
        opts.onAccept(keys[1]);
      }
      if (keys[0] === 'save') {
        opts.onStore(keys[1]);
      }
    };

    const actionMenu = (
      credentialRequestInfo: V10CredentialExchange,
    ): ReactElement => {
      return (
        <Menu onClick={onClickHandler}>
          <Menu.Item
            key={`cancel_${credentialRequestInfo.credential_exchange_id}`}
            danger={true}>
            Cancel Request
          </Menu.Item>
          <Menu.Item
            key={`accept_${credentialRequestInfo.credential_exchange_id}`}
            disabled={credentialRequestInfo.state !== 'offer_received'}>
            Accept Offer
          </Menu.Item>
          <Menu.Item
            key={`save_${credentialRequestInfo.credential_exchange_id}`}
            disabled={credentialRequestInfo.state !== 'credential_received'}>
            Save Credential
          </Menu.Item>
        </Menu>
      );
    };

    return [
      {
        title: 'Credential Type',
        dataIndex: ['record', 'credential_proposal_dict', 'cred_def_id'],
        ...getColumnSearchProps(
          ['record', 'credential_proposal_dict', 'schema_id'],
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
        render(_, credentialInfo) {
          return convertAriesDateToLocal(credentialInfo.record.updated_at);
        },
        sorter: compareCredentialExchangeDataUpdateTimes,
        sortDirections: ['descend', 'ascend', 'descend'],
        defaultSortOrder: 'ascend',
      },
      {
        key: 'action',
        width: '10%',
        title: <span style={{ visibility: 'hidden' }}>{'action'}</span>,
        align: 'right',
        render(_, credentialInfo) {
          return (
            <Dropdown
              overlay={actionMenu(credentialInfo.record)}
              trigger={['click']}>
              <ActionLink
                className="CredentialRequestsList__actionMenu"
                onClick={(e) => e.preventDefault()}>
                Actions
              </ActionLink>
            </Dropdown>
          );
        },
      },
    ];
  };

  const removeActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalDanger({
        title: 'Cancel Credential Request',
        content: (
          <p>Are you sure you want to abort this credential request ?</p>
        ),
        onOk: () => doRemove(credentialExchangeId),
        okText: 'Abort',
      });
    },
    [doRemove],
  );

  const acceptActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalConfirm({
        title: 'Accept Credential Offer',
        content: <p>Are you sure you want to accept this credential offer ?</p>,
        onOk: () => doAccept(credentialExchangeId),
        okText: 'Accept',
      });
    },
    [doAccept],
  );

  const storeActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalConfirm({
        title: 'Accept Credential Proposal',
        content: (
          <p>Are you sure you want to save this Credential in your Wallet?</p>
        ),
        onOk: () => doStore(credentialExchangeId),
        okText: 'Save',
      });
    },
    [doStore],
  );

  const columns = makeColumns({
    onRemove: removeActionHandler,
    onAccept: acceptActionHandler,
    onStore: storeActionHandler,
  });

  return (
    <StyledConsoleTable
      id="CredentialRequestsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(record) => record.record.credential_exchange_id ?? 'Missing Id!'}
      expandable={{
        expandedRowRender: (record) => (
          <VStack>
            <Heading> Credential Request Details </Heading>
            <pre>{JSON.stringify(record.record, undefined, 2)}</pre>
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
