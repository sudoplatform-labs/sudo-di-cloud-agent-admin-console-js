import styled from 'styled-components';

export const LinkButton = styled.button`
  display: inline;
  line-height: inherit;
  border: 0;
  outline: 0;
  color: currentColor;
  background: transparent;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;
