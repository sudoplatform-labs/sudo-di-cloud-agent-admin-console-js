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
import {
  compareCredentialExchangeDataUpdateTimes,
  CredentialExchangeData,
} from '../../../../models/ACAPy/CredentialIssuance';
import { modalConfirm, modalDanger } from '../../../../components/Form';
import { V10CredentialExchange } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { convertAriesDateToLocal } from '../../../../utils/ariesDate';

const ActiveCredentialRequestsInfoTable = Table as React.FC<
  TableProps<CredentialExchangeData>
>;

const StyledConsoleTable = styled(ActiveCredentialRequestsInfoTable)`
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
  onOffer: (credentialExchangeId: string) => void;
  onIssue: (credentialExchangeId: string) => void;
}

export const ActiveCredentialRequestsList: React.FC<Props> = (props) => {
  const {
    dataSource,
    loading,
    onDelete: doRemove,
    onOffer: doOffer,
    onIssue: doIssue,
  } = props;

  const [searchState, setSearchState] = useState<SearchState>({
    searchText: '',
    searchedColumn: '',
  });

  const makeColumns = (opts: {
    onRemove: ActionHandler;
    onOffer: ActionHandler;
    onIssue: ActionHandler;
  }): ColumnProps<CredentialExchangeData>[] => {
    const onClickHandler = (event: MenuInfo): void => {
      // This is ugly but the Menu antd component doesn't allow a way
      // to pass arbitrary parameters to the onClickHandler so we
      // decode the action and the credential exchange Id from the
      // string "key" element.
      const keys = event.key.toString().split('_');

      if (keys[0] === 'reject') {
        opts.onRemove(keys[1]);
      }
      if (keys[0] === 'offer') {
        opts.onOffer(keys[1]);
      }
      if (keys[0] === 'issue') {
        opts.onIssue(keys[1]);
      }
    };

    const actionMenu = (
      credentialRequestInfo: V10CredentialExchange,
    ): ReactElement => {
      return (
        <Menu onClick={onClickHandler}>
          <Menu.Item
            key={`reject_${credentialRequestInfo.credential_exchange_id}`}
            danger={true}>
            Reject Proposal
          </Menu.Item>
          <Menu.Item
            key={`offer_${credentialRequestInfo.credential_exchange_id}`}
            disabled={credentialRequestInfo.state !== 'proposal_received'}>
            Offer Credential
          </Menu.Item>
          <Menu.Item
            key={`issue_${credentialRequestInfo.credential_exchange_id}`}
            disabled={credentialRequestInfo.state !== 'request_received'}>
            Issue Credential
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
        width: '20%',
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
        title: <span style={{ visibility: 'hidden' }}>{'action'}</span>,
        align: 'right',
        width: '10%',
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
        title: 'Reject Credential Request',
        content: (
          <p>Are you sure you want to reject this credential request ?</p>
        ),
        onOk: () => doRemove(credentialExchangeId),
        okText: 'Reject',
      });
    },
    [doRemove],
  );

  const offerActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalConfirm({
        title: 'Offer Credential',
        content: <p>Are you sure you want to Offer this credential ?</p>,
        onOk: () => doOffer(credentialExchangeId),
        okText: 'Offer',
      });
    },
    [doOffer],
  );

  const issueActionHandler = useCallback(
    (credentialExchangeId: string): void => {
      modalConfirm({
        title: 'Issue Credential',
        content: <p>Are you sure you want to Issue this credential ?</p>,
        onOk: () => doIssue(credentialExchangeId),
        okText: 'Issue',
      });
    },
    [doIssue],
  );

  const columns = makeColumns({
    onRemove: removeActionHandler,
    onOffer: offerActionHandler,
    onIssue: issueActionHandler,
  });

  return (
    <StyledConsoleTable
      id="ActiveCredentialRequestsList"
      loading={loading}
      columns={columns}
      dataSource={dataSource}
      rowKey={(data) => data.record.credential_exchange_id ?? 'Missing Id!'}
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
