import React from 'react';
import { Form, Input, Alert, Button, Switch } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../containers/App';
import {
  createConnectionInvite,
  ConnectionInvitationParams,
} from '../../../models/ACAPy/Connections';
import {
  ConnRecord,
  InvitationResult,
} from '@sudoplatform-labs/sudo-di-cloud-agent';

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
  onSuccess: (invitationDetails: InvitationResult) => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const CreateInvitationForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs } = props;
  const [form] = Form.useForm();

  const [submitState, handleSubmit] = useAsyncFn(
    // On initial entry we don't want to do anything
    async (values?: Store) => {
      if (!values) {
        return undefined;
      }

      const params: ConnectionInvitationParams = {
        alias: values.CreateInvitationForm_alias,
        mode: ConnRecord.AcceptEnum.Auto,
        multi: values.multiUse,
        public: false,
      };
      const invitation = await createConnectionInvite(cloudAgentAPIs, params);
      form.resetFields();
      onSuccess(invitation);
    },
    [cloudAgentAPIs, form, onSuccess],
  );

  return (
    <Form
      id="CreateInvitationForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <Form.Item
        name="CreateInvitationForm_alias"
        label="Label for Invitation"
        rules={[
          {
            required: true,
            message: 'Please provide a label for the Invitation.',
          },
        ]}>
        <Input type="text" placeholder="e.g. Student_Access_Invitation  " />
      </Form.Item>
      <Form.Item
        name="multiUse"
        label="Allow Multiple Use"
        valuePropName="checked">
        <Switch />
      </Form.Item>

      {submitState.error && (
        <Alert
          type="error"
          message="There was an error creating your DIDComm Invitation. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="CreateInvitationForm__cancel-btn"
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
          id="CreateInvitationForm__submit-btn"
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
