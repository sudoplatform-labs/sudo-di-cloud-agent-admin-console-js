import React, { ReactElement, useState, useEffect } from 'react';
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
import { IndyCredentialDefinitionIdEntryItem } from '../../../../components/Form/IndyCredentialDefinitionIdEntryItem';
import { fetchCredentialDefinitionDetails } from '../../../../models/ACAPy/CredentialDefinitions';
import _ from 'lodash';

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
  // Track the current credentialDefinitionId state so that we can get the
  // correct definition when it changes
  const [currentCredentialDefinitionId, setCurrentCredentialDefinitionId] =
    useState('');
  const [currentSchema, setCurrentSchema] = useState<Schema>();

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
        credential_definition_id: values.credentialDefinitionId,
        connection_id: values.connectionId,
        comment: values.message,
        proposal: preview,
        trace: values.traceProtocol,
        auto_remove: true,
      };

      await proposeCredential(cloudAgentAPIs, params);
      message.success('Credential proposal sent!');
      form.resetFields();
      setCurrentCredentialDefinitionId('');
      onSuccess();
    },
    [cloudAgentAPIs, currentCredentialDefinitionId, form, onSuccess],
  );

  const [, updateSchema] = useAsyncFn(async () => {
    // Don't attempt to fetch an empty credentialId
    // (i.e. on initial render)
    if (currentCredentialDefinitionId === '') {
      return;
    }
    // Attempt to get the credential definition first
    try {
      const credentialDefinition = await fetchCredentialDefinitionDetails(
        cloudAgentAPIs,
        currentCredentialDefinitionId,
      );
      if (_.isEmpty(credentialDefinition)) {
        setCurrentSchema(undefined);
      } else {
        // Pull the schema sequence number from the credential
        // identifier and fetch the schema definition to determine
        // attributes available.
        const credentialDefinitionIdReg =
          /^([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}):3:CL:(([1-9][0-9]*)|([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}:2:.+:[0-9.]+)):(.+)$/;
        const matches = currentCredentialDefinitionId.match(
          credentialDefinitionIdReg,
        );
        if (matches) {
          const currentSchemaId = matches[3];
          setCurrentSchema(
            await fetchSchemaDefinitionDetails(cloudAgentAPIs, currentSchemaId),
          );
        }
      }
    } catch (e) {
      setCurrentSchema(undefined);
    }
  }, [cloudAgentAPIs, currentCredentialDefinitionId]);

  // Don't thrash around getting credential definitions on every
  // typed character if possible.
  useEffect(() => {
    const timeOutId = setTimeout(() => updateSchema(), 500);
    return () => clearTimeout(timeOutId);
  }, [updateSchema]);

  const buildCurrentSchemaFields = (): ReactElement[] => {
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
      <IndyCredentialDefinitionIdEntryItem
        name="credentialDefinitionId"
        setCredentialDefinitionId={setCurrentCredentialDefinitionId}
      />
      {currentSchema !== undefined && (
        <Form.Item label="Enter desired values for Credential Attributes:">
          {buildCurrentSchemaFields()}
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
            setCurrentCredentialDefinitionId('');
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
