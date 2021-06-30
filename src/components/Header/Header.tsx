import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';

const Container = styled.div`
  background-color: #fff;
  color: ${theme.greys.fjord};
  display: flex;
  height: 64px;
  justify-content: space-between;
  padding: 0 24px;
`;

const DocsLinkContainer = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  height: 32px;
  margin-right: 16px;
  padding-right: 16px;
  a {
    font-size: 14px;
    color: ${theme.colors.sudoBlue};
  }
`;

export const AppHeader: React.FC = () => (
  <Container className="header">
    <div></div>
    <DocsLinkContainer>
      <a
        href="https://docs.sudoplatform.com/"
        target="_blank"
        rel="noopener noreferrer">
        Developer Docs
      </a>
    </DocsLinkContainer>
  </Container>
);
