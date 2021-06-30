import { Alert } from 'antd';
import React from 'react';
import styled from 'styled-components';

const StyledAlert = styled(Alert)`
  width: 100%;
`;

interface Props {
  className?: string;
  show: boolean;
  type: 'error' | 'success' | 'info';
}

export const SubmitFeedback: React.FC<Props> = (props) =>
  props.show ? (
    <StyledAlert
      type={props.type}
      message={props.children}
      className={props.className}
    />
  ) : null;
