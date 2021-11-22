import { Form, Input } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { StoreValue } from 'antd/lib/form/interface';
import React from 'react';

interface Props {
  name: string;
  setCredentialDefinitionId?: (
    credentialId: React.SetStateAction<string>,
  ) => void;
}

// This JSX.element is intended to be included as a Form.Item
// inside a Form.  It provides a text entry box and validation
// for Indy format Credential Identifiers.
export const IndyCredentialDefinitionIdEntryItem = (
  props: Props,
): JSX.Element => {
  return (
    <Form.Item
      name={props.name}
      label="Credential Definition Identifier"
      validateTrigger="onChange"
      rules={[
        {
          required: true,
          message:
            'Please provide a Schema Identifier for the proof type required.',
          validator: (rule: RuleObject, value: StoreValue): Promise<void> => {
            const validCredentialIdRegex =
              /^([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}):3:CL:(([1-9][0-9]*)|([123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}:2:.+:[0-9.]+)):(.+)$/;
            // Vaidate that the pattern matches a valid schema Id before attempting
            // to fetch it to avoid constant fetch attempts on every character entry.
            if (value && validCredentialIdRegex.test(value)) {
              if (props.setCredentialDefinitionId) {
                props.setCredentialDefinitionId(value);
              }
              return Promise.resolve(value);
            } else {
              return Promise.reject(
                'Please enter a valid Credential Definition Identifier',
              );
            }
          },
        },
      ]}>
      <Input
        type="text"
        placeholder="e.g. FfTM7q3uZLipmQnXjghcbZ:3:CL:7:ExampleCredentialDefinition"
      />
    </Form.Item>
  );
};
