import { Col, Row } from 'antd';
import React from 'react';
import styled from 'styled-components';

export const CardsRow: React.FC = (props) => (
  <Row gutter={[16, 32]}>{props.children}</Row>
);

export const CardsCol = styled(Col)`
  > * {
    height: 100%;
  }
`;
