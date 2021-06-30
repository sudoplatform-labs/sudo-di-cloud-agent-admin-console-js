import styled from 'styled-components';
import { theme } from '../../theme';

export const PageHeading = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.greys.woodsmoke};
`;

export const Page = styled.div`
  padding: 20px 20px 60px 20px;
  max-width: 1000px;
  width: 100%;
`;

export const StretchPage = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
`;
