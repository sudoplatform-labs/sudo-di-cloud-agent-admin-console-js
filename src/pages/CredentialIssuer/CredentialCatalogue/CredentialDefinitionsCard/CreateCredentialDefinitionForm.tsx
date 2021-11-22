import React, { useState } from 'react';
import {
  Form,
  Input,
  message,
  Alert,
  Button,
  Switch,
  InputNumber,
  Popover,
} from 'antd';
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
import { HStack } from '../../../../components/layout-stacks';
import { InfoCircleOutlined } from '@ant-design/icons';
import { theme } from '../../../../theme';
import { RuleObject } from 'antd/lib/form';
import { StoreValue } from 'antd/lib/form/interface';

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

/**
 * Stylised hover information icon to explain the revocable
 * credentials option and limits imposed when emabled.
 */
const StyledInfoCircleOutlined = styled(InfoCircleOutlined)`
  color: ${theme.colors.sudoBlue};
`;

const RevocableSwitchIconPopover: React.FC = () => {
  const content = (
    <p>
      Revocable credential definitions support the cancelation of an
      <br /> issued credential at a later date. Holders of revocable
      <br /> credentials can create proof presentations which verify a
      <br /> credential was valid at a point in time. Revocable
      <br /> credential definitions require a Revocable Registry definition(s)
      <br /> to be written to the ledger as well as a
      <br /> publicly accessible tails file(s).
      <br />
      <br /> The &quot;Registry Size&quot; field is only relevent for revocable
      <br /> credential definitions. It defines how many credentials
      <br /> can be issued before a new Revocable Registry definition must
      <br /> be written to the ledger (i.e. incurring a cost). It also
      <br /> defines how large the tails file will be that holders must
      <br /> download when creating a proof presentation to a verifier
      <br /> (i.e. a 1000 entry tails file is approximately 250KB).
    </p>
  );
  return (
    <Popover
      id="RevocableSwitch__popover-dialog"
      title="Revocable Credential Definitions"
      trigger="hover"
      content={content}>
      <StyledInfoCircleOutlined id="RevocableSwitch__popover-icon" />
    </Popover>
  );
};

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const CreateCredentialDefinitionForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs } = props;
  const [form] = Form.useForm();
  const [enableSize, setEnableSize] = useState(false);

  const [submitState, handleSubmit] = useAsyncFn(
    // On initial entry we don't want to do anything
    async (values?: Store) => {
      if (!values) {
        return undefined;
      }

      const params: CredentialDefinitionCreateParams = {
        tag: values.tag,
        schema: values.schemaId,
        revocable: values.revocable,
        size: values.size,
      };

      try {
        await modalTAAAcceptance(cloudAgentAPIs, async () => {
          await createCredentialDefinition(cloudAgentAPIs, params);
          message.success('Credential Definition Created!');
          form.resetFields();
          setEnableSize(false);
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
      initialValues={{ size: 10000 }}
      onFinish={handleSubmit}
      layout="vertical">
      <Form.Item
        name="tag"
        label="Credential Name"
        rules={[
          {
            required: true,
            validator: (rule: RuleObject, value: StoreValue): Promise<void> => {
              const validTagRegex = /^[a-zA-Z0-9_-]+$/;
              // Vaidate that the pattern matches a valid schema Id before attempting
              // to fetch it to avoid constant fetch attempts on every character entry.
              if (value && validTagRegex.test(value)) {
                return Promise.resolve(value);
              } else {
                return Promise.reject(
                  'Credential names can only contain the following characters a-zA-Z0-9_-',
                );
              }
            },
          },
        ]}>
        <Input type="text" placeholder="e.g. ACME_University_Transcript  " />
      </Form.Item>
      <IndySchemaIdEntryItem name="schemaId" />
      <HStack spacing={40}>
        <Form.Item
          name="revocable"
          label={
            <span>
              Revocable <RevocableSwitchIconPopover />
            </span>
          }
          valuePropName="checked">
          <Switch onChange={(checked) => setEnableSize(checked)} />
        </Form.Item>
        <Form.Item name="size" label="Registry Size">
          <InputNumber
            min={10}
            max={100000}
            step={1000}
            disabled={!enableSize}
          />
        </Form.Item>
      </HStack>
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
            setEnableSize(false);
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
