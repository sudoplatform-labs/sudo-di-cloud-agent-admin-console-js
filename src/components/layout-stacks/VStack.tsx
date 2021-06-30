import React from 'react';
import styled from 'styled-components';
import { Property } from 'csstype';

const defaultAlign: Property.AlignItems = 'flex-start';
const defaultSpacing = 10;

interface Props {
  align?: 'left' | 'center' | 'right';
  spacing?: number;
}

function getAlign(props: Props): string {
  switch (props.align) {
    case 'left':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
    default:
      return defaultAlign;
  }
}

function getBottomMargin(props: Props): string {
  return `${props.spacing ?? defaultSpacing}px`;
}

const Container = styled.div`
  width: 100%;
  display: flex;
`;

const Stack = styled.div<Props>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: ${getAlign};

  > * {
    margin: 0;
    margin-bottom: ${getBottomMargin};
  }

  margin-bottom: -${getBottomMargin};

  pre {
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
  }
`;

/**
 * VStack is useful for controlling the amount of
 * space "between" elements in a vertical layout.
 *
 * Note: This will override margins of all direct
 * children in order to produce desired spacing.
 */
export const VStack: React.FC<Props> = (props) => (
  <Container className="vstack-container">
    <Stack {...props} className="vstack-stack" />
  </Container>
);
