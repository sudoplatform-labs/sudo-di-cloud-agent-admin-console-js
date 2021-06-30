import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import platformTilesImg from './platform_tiles.png';

const FlexContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background: #ececf0 url(${platformTilesImg}) no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  height: 100vh;
  z-index: 100;
  text-align: center;
`;

const Content = styled.div`
  max-width: 450px;
  padding: 15px;
  margin: auto;
`;

export const Heading = styled.h1`
  font-size: 44px;
  font-weight: 700;
  color: ${theme.greys.bluewood};
  margin-bottom: 0px;
  line-height: 1.2;
  margin-bottom: 10px;
`;

export const SubHeading = styled.p`
  font-size: 24px;
  color: ${theme.greys.fjord};
  margin: 0;
  margin-bottom: 30px;
  line-height: 1.3;
`;

interface Props {
  className?: string;
}
export const SimplePage: React.FC<Props> = (props) => (
  <FlexContainer>
    <Content>{props.children}</Content>
  </FlexContainer>
);
