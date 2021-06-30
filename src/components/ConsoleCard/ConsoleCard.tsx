import { Card } from 'antd';
import styled from 'styled-components';
import { theme } from '../../theme';

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.12);
`;

const Heading = styled.h2``;

const SubHeading = styled.h3`
  font-size: 14px;
  color: ${theme.greys.raven};
  font-weight: normal;
`;

export const ConsoleCard = Object.assign(StyledCard, {
  Heading,
  SubHeading,
});
