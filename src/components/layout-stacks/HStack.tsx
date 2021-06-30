import React from 'react';
import styled from 'styled-components';
import { Property } from 'csstype';

const defaultAlign: Property.AlignItems = 'flex-start';
const defaultVerticalAlign: Property.JustifyItems = 'center';
const defaultSpacing = 10;

interface Props {
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
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

function getVerticalAlign(props: Props): string {
  switch (props.verticalAlign) {
    case 'top':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'bottom':
      return 'flex-end';
    default:
      return defaultVerticalAlign;
  }
}

function getSpacing(props: Props): string {
  return `${props.spacing ?? defaultSpacing}px`;
}

const Container = styled.div`
  width: 100%;
  display: flex;
`;

/**
 * To get proper vertical spacing that is supported when
 * children are wrapped across multiple lines, all children
 * are given a margin-bottom and then the HStack itself will
 * use a negative bottom margin to compensate for the undesired
 * space after the last row.
 */
const Stack = styled.div<Props>`
  width: calc(100% + ${getSpacing});
  display: flex;
  flex-direction: row;
  align-items: ${getVerticalAlign};
  justify-content: ${getAlign};
  flex-wrap: wrap;
  border: 1px solid transparent;

  > * {
    margin: 0;
    margin-bottom: ${getSpacing};
    margin-right: ${getSpacing};
  }

  margin-right: -${getSpacing};
  margin-bottom: -${getSpacing};
`;

/**
 * A component that can stack children horizontally
 * and wrap them as needed.
 *
 * Note: This will override margins of all direct
 * children in order to produce desired spacing.
 */
export const HStack: React.FC<Props> = (props) => (
  <Container>
    <Stack {...props} />
  </Container>
);
