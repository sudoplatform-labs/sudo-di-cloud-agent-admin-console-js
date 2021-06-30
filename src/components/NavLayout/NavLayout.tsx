import { Layout } from 'antd';
import React, { useMemo } from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import { getConsoleRoutesRoot } from '../../containers/Console/routes';
import { flattenRoutes } from '../../routes/utils';
import { BreadCrumbs } from '../BreadCrumbs';
import { AppHeader as Header } from '../Header';
import { Sidebar } from '../Sidebar';

const Container = styled(Layout)`
  height: 100%;
  width: 100%;
`;

const StyledLayoutHeader = styled(Layout.Header)`
  padding: 0;
`;

const StyledLayoutContent = styled(Layout.Content)`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StyledLayoutSider = styled(Layout.Sider)``;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const NavLayout: React.FC = (props) => {
  const location = useLocation();

  const allRoutesFlat = useMemo(
    () => flattenRoutes([getConsoleRoutesRoot()]),
    [],
  );

  const sidebarRoutes = useMemo(() => getConsoleRoutesRoot().routes ?? [], []);

  return (
    <Container>
      <StyledLayoutSider width="252px">
        <Sidebar routes={sidebarRoutes} pathName={location.pathname} />
      </StyledLayoutSider>
      <Layout>
        <StyledLayoutHeader>
          <Header />
        </StyledLayoutHeader>
        <StyledLayoutContent id="STYLED_LAYOUT_CONTENT">
          <BreadCrumbs routes={allRoutesFlat} urlPath={location.pathname} />
          <MainContent id="TEST">{props.children}</MainContent>
        </StyledLayoutContent>
      </Layout>
    </Container>
  );
};
