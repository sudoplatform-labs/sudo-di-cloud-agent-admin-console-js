import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../theme';

export const Heading = styled.h3`
  margin: 0;
  font-size: 14px;
`;

export const Description = styled.p`
  color: ${theme.greys.raven};
  font-size: 12px;
`;

interface Props {
  heading?: string;
  subHeading?: string;
}

export const ChartHeading: React.FC<Props> = (props) => {
  return (
    <>
      {props.heading && <Heading>{props.heading}</Heading>}
      {props.subHeading && <Description>{props.subHeading}</Description>}
    </>
  );
};
