import styled, { css } from 'styled-components';
import { theme } from '../../theme';
import { LinkButton } from '../LinkButton';

export const consoleTableMixin = css`
  thead tr th {
    background-color: ${theme.greys.glamdring};
  }

  & tr.ant-table-expanded-row {
    background-color: ${theme.greys.glamdring};
  }

  tr pre {
    word-wrap: break-word;
    word-break: break-all;
    white-space: pre-wrap;
  }
`;

export type ActionHandler = (fingerprint: string) => void;

export const DangerLink = styled(LinkButton)`
  color: ${theme.colors.coral};
`;
export const ContinueLink = styled(LinkButton)`
  color: ${theme.colors.darkMint};
`;
export const ActionLink = styled(LinkButton)`
  color: ${theme.colors.sudoBlue};
`;
export const ConsoleTableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  align-items: center;
`;
