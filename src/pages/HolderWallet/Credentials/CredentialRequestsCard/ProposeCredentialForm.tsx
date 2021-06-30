import React, { ReactElement, useEffect, useState } from 'react';
import { Form, Input, Alert, Button, Switch, message } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../../containers/App';
import {
  CredentialRequestParams,
  proposeCredential,
} from '../../../../models/ACAPy/CredentialIssuance';
import {
  CredAttrSpec,
  CredentialPreview,
  Schema,
} from '@sudoplatform-labs/sudo-di-cloud-agent';
import { fetchSchemaDefinitionDetails } from '../../../../models/ACAPy/SchemaDefinitions';
import { DIDCommSelectionItem } from '../../../../components/Form/DIDCommSelectionItem';
import { IndySchemaIdEntryItem } from '../../../../components/Form/IndySchemaIdEntryItem';

const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 0 -24px -8px;
  padding: 18px 24px 0;
`;

const StyledButton = styled(Button)`
  min-width: 112px;
`;

const SubmitButton = styled(StyledButton)`
  margin-left: 12px;
`;

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const ProposeCredentialForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs } = props;
  const [form] = Form.useForm();
  // Track the current schemaId state so that we can get the
  // correct definition when it changes
  const [currentSchemaId, setCurrentSchemaId] = useState('');

  const [submitState, handleSubmit] = useAsyncFn(
    async (values?: Store) => {
      if (!values) {
        return undefined;
      }

      const attributes: CredAttrSpec[] = [];
      const fieldNames: string[] = Object.keys(values);
      for (const name of fieldNames) {
        if (name.startsWith('attribute_')) {
          attributes.push({
            name: name.replace('attribute_', ''),
            value: values[name],
          });
        }
      }

      const preview: CredentialPreview = { attributes: attributes };

      const params: CredentialRequestParams = {
        schema_id: values.schemaId,
        connection_id: values.connectionId,
        comment: values.message,
        proposal: preview,
        trace: values.traceProtocol,
        auto_remove: true,
      };

      await proposeCredential(cloudAgentAPIs, params);
      message.success('Credential proposal sent!');
      form.resetFields();
      setCurrentSchemaId('');
      onSuccess();
    },
    [cloudAgentAPIs, currentSchemaId, form, onSuccess],
  );

  const [
    { value: currentSchema },
    getSchemaInfo,
  ] = useAsyncFn(async (): Promise<Schema> => {
    return await fetchSchemaDefinitionDetails(cloudAgentAPIs, currentSchemaId);
  }, [cloudAgentAPIs, currentSchemaId]);

  // Have to useEffect to make sure currentSchemaId state is updated before
  // attempting to use it to get schema.
  useEffect(() => {
    if (currentSchemaId !== '') {
      getSchemaInfo();
    }
  }, [currentSchemaId, getSchemaInfo]);

  const getCurrentSchemaFields = (): ReactElement[] => {
    if (currentSchema?.attrNames) {
      return currentSchema.attrNames
        .sort((a, b) => ('' + a).localeCompare(b))
        .map((attribute) => {
          return (
            <Form.Item
              name={`attribute_${attribute}`}
              key={attribute}
              label={attribute}
              rules={[
                {
                  required: true,
                  message: `"${attribute}" is required`,
                },
              ]}>
              <Input type="text" />
            </Form.Item>
          );
        });
    } else {
      return [];
    }
  };

  return (
    <Form
      id="ProposeCredentialForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <DIDCommSelectionItem
        name="connectionId"
        cloudAgentAPIs={cloudAgentAPIs}
      />
      <Form.Item
        name="message"
        label="Comment"
        rules={[
          {
            required: false,
          },
        ]}>
        <Input
          type="text"
          placeholder="e.g. Please provide me with a University Transcript"
        />
      </Form.Item>
      <IndySchemaIdEntryItem name="schemaId" setSchemaId={setCurrentSchemaId} />
      {currentSchemaId !== '' && (
        <Form.Item label="Enter desired values for Credential Attributes:">
          {getCurrentSchemaFields()}
        </Form.Item>
      )}
      <Form.Item
        name="traceProtocol"
        label="Trace Protocol"
        valuePropName="checked">
        <Switch />
      </Form.Item>

      {submitState.error && (
        <Alert
          type="error"
          message="There was an error creating your Credential Proposal. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="ProposeCredentialForm__cancel-btn"
          onClick={() => {
            submitState.error = undefined;
            form.resetFields();
            setCurrentSchemaId('');
            onCancel();
          }}
          type="default"
          shape="round">
          Cancel
        </StyledButton>
        <SubmitButton
          id="ProposeCredentialForm__submit-btn"
          type="primary"
          htmlType="submit"
          loading={submitState.loading}
          shape="round">
          Send
        </SubmitButton>
      </FooterContainer>
    </Form>
  );
};
