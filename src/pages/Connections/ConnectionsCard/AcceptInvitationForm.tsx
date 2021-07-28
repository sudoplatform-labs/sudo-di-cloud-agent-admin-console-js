import React from 'react';
import { Form, Input, Alert, Button } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../containers/App';
import { ConnectionAcceptParams } from '../../../models/ACAPy/Connections';
import { ConnRecordAcceptEnum } from '@sudoplatform-labs/sudo-di-cloud-agent';

const { TextArea } = Input;

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
  onSuccess: (acceptDetails: ConnectionAcceptParams) => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const AcceptInvitationForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess } = props;
  const [form] = Form.useForm();

  const [submitState, handleSubmit] = useAsyncFn(
    async (values?: Store) => {
      // On initial entry we don't want to do anything
      if (!values) {
        return undefined;
      }

      // Locate the URL "c_i" query param, decode the
      // Base64 formated invitation and place it into
      // the correct ConnectionInvitationAcceptaParams.invitation
      // field.
      const inviteParam = values.AcceptInvitationForm_invitation.replace(
        /(http:\/\/.*)?\?c_i=/i,
        '',
      );
      const inviteTxt = inviteParam ? atob(inviteParam) : '';
      const acceptDetails: ConnectionAcceptParams = {
        alias: values.AcceptInvitationForm_alias,
        mode: ConnRecordAcceptEnum.Auto,
        invitation: JSON.parse(inviteTxt),
      };
      form.resetFields();
      onSuccess(acceptDetails);
    },
    [form, onSuccess],
  );

  return (
    <Form
      id="AcceptInvitationForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <Form.Item
        name="AcceptInvitationForm_alias"
        label="Label for Connection"
        rules={[
          {
            required: true,
            message: 'Please provide a label for the Connection.',
          },
        ]}>
        <Input type="text" placeholder="e.g. Bobs_Trophies" />
      </Form.Item>
      <Form.Item
        name="AcceptInvitationForm_invitation"
        label="Encoded Invitation URL"
        rules={[
          {
            required: true,
            message: 'Please provide the Invitation URL for the Connection.',
          },
        ]}>
        <TextArea rows={9} allowClear={true} />
      </Form.Item>

      {submitState.error && (
        <Alert
          type="error"
          message="There was an error accepting your DIDComm Invitation. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="AcceptInvitationForm__cancel-btn"
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
          id="AcceptInvitationForm__submit-btn"
          type="primary"
          htmlType="submit"
          loading={submitState.loading}
          shape="round">
          Review
        </SubmitButton>
      </FooterContainer>
    </Form>
  );
};
