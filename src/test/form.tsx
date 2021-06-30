import { Button, Checkbox, DatePicker, Form, Input } from 'antd';
import FormItemInput from 'antd/lib/form/FormItemInput';
import { ReactWrapper, mount } from 'enzyme';
import moment from 'moment';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { SubmitFeedback } from '../components/Form';

export function hasRequiredField(
  wrapper: ReactWrapper,
  fieldName: string,
): boolean {
  const formItem = wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName);

  return !!formItem
    .prop('rules')
    ?.find((rule) => typeof rule !== 'function' && rule.required === true);
}

export async function changeFormInput(
  wrapper: ReactWrapper,
  formItemName: string,
  value: string,
): Promise<void> {
  const inputNode = wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === formItemName)
    .findWhere(
      (el) => el.instance() instanceof Input 
    );

  await act(async () => {
    void inputNode.prop('onChange')!({ target: { value } });
  });
  wrapper.update();
}

export async function changeDatePickerInput(
  wrapper: ReactWrapper,
  fieldName: string,
  value: string,
): Promise<void> {
  const inputNode = wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(DatePicker);

  const dateValue = value ? moment(value) : null;

  await act(async () => {
    inputNode.prop('onChange')!(dateValue, value);

    // Allow async submit handlers to complete
    await new Promise((r) => setTimeout(r, 10));
  });
  wrapper.update();
}

export async function changeFileInput(
  wrapper: ReactWrapper,
  fieldName: string,
  file: File,
): Promise<void> {
  const inputNode = wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find('input')
    .filterWhere((el) => el.prop('type') === 'file');

  await act(async () => {
    inputNode.simulate('change', {
      target: { files: [file] },
    });
  });
  wrapper.update();
}

export function getFormInputValue(
  wrapper: ReactWrapper,
  fieldName: string,
  inputType = Input,
): string | number | readonly string[] | undefined {
  const inputNode = wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(inputType);

  return inputNode.prop('value');
}

export function isDisabled(wrapper: ReactWrapper, fieldName: string): boolean {
  return !!wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(Input)
    .prop('disabled');
}

export async function changeChecked(
  wrapper: ReactWrapper,
  fieldName: string,
  checkboxValue: string,
  checked: boolean,
): Promise<void> {
  const inputNode = wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(Checkbox)
    .filterWhere((el) => el.prop('value') === checkboxValue)
    .find('input');

  await act(async () => {
    inputNode.simulate('change', { target: { checked } });
  });
  wrapper.update();
}

export function isChecked(
  wrapper: ReactWrapper,
  fieldName: string,
  checkboxValue: string,
): boolean {
  return !!wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(Checkbox)
    .filterWhere((el) => el.prop('value') === checkboxValue)
    .find('input')
    .prop('checked');
}

export function isCheckboxDisabled(
  wrapper: ReactWrapper,
  fieldName: string,
  checkboxValue: string,
): boolean {
  return !!wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(Checkbox)
    .filterWhere((el) => el.prop('value') === checkboxValue)
    .prop('disabled');
}

export async function submitForm(wrapper: ReactWrapper): Promise<void> {
  const submitButton = wrapper
    .find(Button)
    .filterWhere((el) => el.prop('htmlType') === 'submit');

  await act(async () => {
    submitButton.simulate('submit', {});
  });
  wrapper.update();
}

export function getFieldErrors(
  wrapper: ReactWrapper,
  fieldName: string,
): string[] {
  return wrapper
    .find(Form.Item)
    .filterWhere((el) => el.prop('name') === fieldName)
    .find(FormItemInput)
    .prop('errors')
    .map((node) => (node ? mount(<>{node}</>).text() : ''));
}

export function getSubmitError(wrapper: ReactWrapper): string {
  return wrapper
    .find(SubmitFeedback)
    .filterWhere((el) => el.prop('type') === 'error' && el.prop('show'))
    .text();
}

export function getAllFieldErrors(wrapper: ReactWrapper): string[][] {
  return wrapper.find(Form.Item).map((formItem) =>
    formItem
      .find(FormItemInput)
      .prop('errors')
      .map((node) => (node ? mount(<>{node}</>).text() : '')),
  );
}
