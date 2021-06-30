import { Form, Input } from 'antd';
import { RuleObject } from 'antd/lib/form';
import { StoreValue } from 'antd/lib/form/interface';
import React from 'react';

interface Props {
  name: string;
  setSchemaId?: (schemaId: React.SetStateAction<string>) => void;
}

// This JSX.element is intended to be included as a Form.Item
// inside a Form.  It provides a text entry box and validation
// for Indy format Schema Identifiers.
export const IndySchemaIdEntryItem = (props: Props): JSX.Element => {
  return (
    <Form.Item
      name={props.name}
      label="Schema Identifier"
      validateTrigger="onChange"
      rules={[
        {
          required: true,
          message:
            'Please provide a Schema Identifier for the proof type required.',
          validator: (rule: RuleObject, value: StoreValue): Promise<void> => {
            const validSchemaIdRegex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{21,22}:2:.+:[0-9]+\.[0-9]+$/;
            // Vaidate that the pattern matches a valid schema Id before attempting
            // to fetch it to avoid constant fetch attempts on every character entry.
            if (value && validSchemaIdRegex.test(value)) {
              if (props.setSchemaId) {
                props.setSchemaId(value);
              }
              return Promise.resolve(value);
            } else {
              return Promise.reject('Please enter a valid Schema Identifier');
            }
          },
        },
      ]}>
      <Input
        type="text"
        placeholder="e.g. FfTM7q3uZLipmQnXjghcbZ:2:ExampleSchema:1.0  "
      />
    </Form.Item>
  );
};
