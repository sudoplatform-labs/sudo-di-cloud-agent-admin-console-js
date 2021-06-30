import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import React from 'react';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  min-width: 140px;
  padding-left: 20px;
  padding-right: 20px;
`;

const BasicFormButton: React.FC<ButtonProps> = (props) => (
  <StyledButton shape="round" size="large" type="default" {...props} />
);

const SubmitButton: React.FC<ButtonProps> = (props) => (
  <StyledButton
    shape="round"
    size="large"
    type="primary"
    htmlType="submit"
    {...props}
  />
);

export const FormButton = Object.assign(BasicFormButton, {
  Submit: SubmitButton,
});
