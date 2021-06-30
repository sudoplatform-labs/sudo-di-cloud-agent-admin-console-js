import React from 'react';
import { Form, Input, message, Alert, Button } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../../containers/App';
import {
  createCredentialDefinition,
  CredentialDefinitionCreateParams,
} from '../../../../models/ACAPy/CredentialDefinitions';
import { IndySchemaIdEntryItem } from '../../../../components/Form/IndySchemaIdEntryItem';
import { modalTAAAcceptance } from '../../../../components/Form';

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

export const CreateCredentialDefinitionForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs } = props;
  const [form] = Form.useForm();

  const [submitState, handleSubmit] = useAsyncFn(
    // On initial entry we don't want to do anything
    async (values?: Store) => {
      if (!values) {
        return undefined;
      }

      const params: CredentialDefinitionCreateParams = {
        tag: values.tag,
        schema: values.schemaId,
        revocable: false,
      };

      try {
        await modalTAAAcceptance(cloudAgentAPIs, async () => {
          await createCredentialDefinition(cloudAgentAPIs, params);
          message.success('Credential Definition Created!');
          form.resetFields();
          onSuccess();
        });
      } catch {
        message.error('Unable to write to public ledger, please try again');
      }
    },
    [cloudAgentAPIs, form, onSuccess],
  );

  return (
    <Form
      id="CreateCredentialDefinitionForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <Form.Item
        name="tag"
        label="Credential Name"
        rules={[
          {
            required: true,
            message: 'Please provide a name for the Credential definition.',
          },
        ]}>
        <Input type="text" placeholder="e.g. ACME_University_Transcript  " />
      </Form.Item>
      <IndySchemaIdEntryItem name="schemaId" />
      {submitState.error && (
        <Alert
          type="error"
          message="There was an error creating your Verifiable Credential Definition. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="CreateCredentialDefinitionForm__cancel-btn"
          onClick={() => {
            submitState.error = undefined;
            form.resetFields();
            onCancel();
          }}
          type="default"
          shape="round">
          Cancel
        </StyledButton>
        <SubmitButton
          id="CreateCredentialDefinitionForm__submit-btn"
          type="primary"
          htmlType="submit"
          loading={submitState.loading}
          shape="round">
          Create
        </SubmitButton>
      </FooterContainer>
    </Form>
  );
};
