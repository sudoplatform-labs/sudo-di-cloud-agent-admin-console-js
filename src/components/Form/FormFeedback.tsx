import React from 'react';
import styled from 'styled-components';

interface FormFeedbackProps {
  id?: string;
  showText: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormFeedbackComponent = styled.div<FormFeedbackProps>`
  overflow: hidden;
  height: auto;
  max-height: ${(props) => (props.showText ? '600px' : '0')};
  transition: max-height 0.25s ease-in-out;
`;

export const FormFeedback = (props: FormFeedbackProps): React.ReactElement => (
  <FormFeedbackComponent showText={props.showText} className={props.className}>
    {props.children}
  </FormFeedbackComponent>
);
