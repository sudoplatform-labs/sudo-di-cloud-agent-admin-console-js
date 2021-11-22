import React, { useRef, useState } from 'react';
import { Form, Input, message, Alert, Button } from 'antd';
import { Store } from 'rc-field-form/lib/interface';
import { useAsyncFn } from 'react-use';
import styled from 'styled-components';
import { CloudAgentAPI } from '../../../../containers/App';
import {
  createSchemaDefinition,
  SchemaDefinitionCreateParams,
} from '../../../../models/ACAPy/SchemaDefinitions';
import {
  CreateSchemaDefinitionAttributeList,
  SchemaAttribute,
} from './CreateSchemaDefinitionAttributeList';
import { modalTAAAcceptance } from '../../../../components/Form';
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

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  cloudAgentAPIs: CloudAgentAPI;
}

export const CreateSchemaDefinitionForm: React.FC<Props> = (props) => {
  const { onCancel, onSuccess, cloudAgentAPIs } = props;
  const [form] = Form.useForm();
  // Track the current set of schema attributes to adjust
  // the display as new ones are added
  const [currentAttributes, setCurrentAttributes] = useState<SchemaAttribute[]>(
    [],
  );

  const [submitState, handleSubmit] = useAsyncFn(
    async (values?: Store) => {
      // On initial entry we don't want to do anything
      if (!values) {
        return undefined;
      }

      const definitionParams: SchemaDefinitionCreateParams = {
        name: values.schemaName,
        version: values.schemaVersion,
        attributes: currentAttributes.map((attribute) => attribute.name),
      };

      try {
        await modalTAAAcceptance(cloudAgentAPIs, async () => {
          await createSchemaDefinition(cloudAgentAPIs, definitionParams);
          message.success('Schema Definition Created!');
          form.resetFields();
          setCurrentAttributes([]);
          onSuccess();
        });
      } catch {
        message.error('Unable to write to public ledger, please try again');
      }
    },
    [cloudAgentAPIs, currentAttributes, form, onSuccess],
  );

  const deleteAttributeHandler = (attribute: SchemaAttribute): void => {
    const index = currentAttributes.indexOf(attribute);
    setCurrentAttributes(
      currentAttributes
        .slice(0, index)
        .concat(currentAttributes.slice(index + 1)),
    );
  };

  const attributeInput = useRef<Input>(null);

  const enterAttributeNameHandler = async (
    keyEvent: React.KeyboardEvent<HTMLInputElement>,
  ): Promise<void> => {
    keyEvent.preventDefault(); // Don't let the form submit on enter here
    const attributeName = keyEvent.currentTarget.value;
    try {
      setCurrentAttributes([...currentAttributes, { name: attributeName }]);
      form.resetFields(['attributes']);
      // This is bizzare but for some reason eslint complains if
      // you try and access the ref directly even if you put it
      // inside an if condition checking it and current aren't null !
      const node = attributeInput.current;
      if (node) {
        node.focus();
      }
    } catch (err) {
      // Do nothing on bad input
      message.error(err as Error);
    }
  };

  return (
    <Form
      id="CreateSchemaDefinitionForm"
      form={form}
      onFinish={handleSubmit}
      layout="vertical">
      <Form.Item
        name="schemaName"
        label="Schema Name"
        rules={[
          {
            required: true,
            validator: (rule: RuleObject, value: StoreValue): Promise<void> => {
              const validSchemaNameRegex = /^[a-zA-Z0-9_-]+$/;
              // Vaidate that the pattern matches a valid schema Id before attempting
              // to fetch it to avoid constant fetch attempts on every character entry.
              if (value && validSchemaNameRegex.test(value)) {
                return Promise.resolve(value);
              } else {
                return Promise.reject(
                  'Schema names can only contain the following characters a-zA-Z0-9_-',
                );
              }
            },
          },
        ]}>
        <Input
          type="text"
          placeholder="e.g. University_Transcript"
          onPressEnter={(e) => e.preventDefault()}
        />
      </Form.Item>
      <Form.Item
        name="schemaVersion"
        label="Version"
        rules={[
          {
            required: true,
            pattern: new RegExp('^[0-9]+.[0-9]$'),
            message: 'Please provide a valid Schema version number (e.g. 1.0).',
          },
        ]}>
        <Input
          type="text"
          placeholder="e.g. 1.0"
          onPressEnter={(e) => e.preventDefault()}
        />
      </Form.Item>
      <Form.Item
        name="attributes"
        label="Schema Attributes"
        rules={[
          {
            required: true,
            validator: (rule: RuleObject, value: StoreValue): Promise<void> => {
              const validSchemaNameRegex = /^[a-zA-Z0-9_-]+$/;
              // Vaidate that the pattern matches a valid schema Id before attempting
              // to fetch it to avoid constant fetch attempts on every character entry.
              if (value && !validSchemaNameRegex.test(value)) {
                return Promise.reject(
                  'Attribute names can only contain the following characters a-zA-Z0-9_-',
                );
              } else if (
                currentAttributes.find((attribute) => value === attribute.name)
              ) {
                return Promise.reject(
                  'Attribute names must be unique within a Schema',
                );
              } else {
                return Promise.resolve(value);
              }
            },
          },
        ]}>
        <Input
          name="attributeInput"
          type="text"
          placeholder="Type attribute name then <enter> to add"
          onPressEnter={enterAttributeNameHandler}
          ref={attributeInput}
        />
      </Form.Item>
      <CreateSchemaDefinitionAttributeList
        dataSource={currentAttributes}
        onDelete={deleteAttributeHandler}
      />
      {submitState.error && (
        <Alert
          type="error"
          message="There was an error creating your Schema Definition. Please try again."
          description={submitState.error.message}
        />
      )}
      <FooterContainer>
        <StyledButton
          id="CreateSchemaDefinitionForm__cancel-btn"
          onClick={() => {
            submitState.error = undefined;
            form.resetFields();
            setCurrentAttributes([]);
            onCancel();
          }}
          type="default"
          shape="round">
          Cancel
        </StyledButton>
        <SubmitButton
          id="CreateSchemaDefinitionForm__submit-btn"
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
