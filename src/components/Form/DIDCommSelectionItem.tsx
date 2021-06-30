import { ConnRecord } from '@sudoplatform-labs/sudo-di-cloud-agent';
import { Form, Select } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { StoreValue } from 'antd/lib/form/interface';
import React from 'react';
import { useAsync } from 'react-use';
import { CloudAgentAPI } from '../../containers/App';
import { fetchAllAgentConnectionDetails } from '../../models/ACAPy/Connections';

const { Option } = Select;

interface Props {
  name: string;
  cloudAgentAPIs: CloudAgentAPI;
}

// This JSX.element is intended to be included as a Form.Item
// inside a Form.  It provides a dropdown selection of
// DIDComm connections known to the Agent.
export const DIDCommSelectionItem = (props: Props): JSX.Element => {
  const { value: connections } = useAsync(async (): Promise<ConnRecord[]> => {
    return await fetchAllAgentConnectionDetails(props.cloudAgentAPIs);
  }, [props.cloudAgentAPIs]);

  const options = connections
    ?.sort((a, b) => ('' + a.alias).localeCompare(b.alias ?? ''))
    .map((connection) => (
      <Option
        value={connection.connection_id ?? 'Missing Id!'}
        key={connection.connection_id}>
        {' '}
        {connection.alias}{' '}
      </Option>
    ));

  return (
    <Form.Item
      id="DIDCommSelectionItem"
      initialValue="disabled"
      name={props.name}
      label="DIDComm Connection"
      rules={[
        {
          required: true,
          validator: (rule: RuleObject, value: StoreValue): Promise<void> => {
            if (value === 'disabled') {
              return Promise.reject(
                'Please select an existing DIDcomm Connection',
              );
            } else {
              return Promise.resolve(value);
            }
          },
        },
      ]}>
      <Select id="DIDCommSelections">
        <Option value="disabled" disabled>
          {' '}
          --{' '}
        </Option>
        {options}
      </Select>
    </Form.Item>
  );
};
