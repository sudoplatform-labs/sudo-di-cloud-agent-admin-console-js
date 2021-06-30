import { Button } from 'antd';
import { ButtonSize } from 'antd/lib/button';
import React from 'react';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  margin-top: 16px;
  margin-bottom: 24px;
  width: 215px;
  font-weight: 600;
`;

interface Props {
  loading?: boolean;
  buttonText: string;
  disabled?: boolean;
  size?: ButtonSize;
  className?: string;
}

/** @deprecated - use <FormButton.Submit /> */
export const SubmitButton = (props: Props): JSX.Element => (
  <StyledButton
    htmlType="submit"
    type="primary"
    shape="round"
    className={props.className}
    size={props.size}
    disabled={props.disabled}
    loading={props.loading}
  >
    {props.buttonText}
  </StyledButton>
);

SubmitButton.defaultProps = {
  size: 'large',
};
