import { Menu } from 'antd';
import SubMenu from 'antd/lib/menu/SubMenu';
import color from 'color';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, generatePath } from 'react-router-dom';
import styled from 'styled-components';
import { RouteDefinition, getPathAncestry } from '../../routes';
import { theme } from '../../theme';
import { Image } from '../Image';
import { SudoPlatformLogo } from '../SudoPlatformLogo';

const activeMenuBackgroundColor = color(theme.greys.midnight)
  .mix(color(theme.colors.sudoBlue), 0.3)
  .hex();

const activeMenuGroupBackgroundColor = color(theme.greys.midnight)
  .mix(color(theme.colors.sudoBlue), 0.03)
  .hex();

const StyledSudoPlatformLogo = styled(SudoPlatformLogo)`
  padding: 18px 0 12px;
`;

const StyledSidebar = styled.div`
  background-color: ${theme.greys.midnight};
  padding-bottom: 50px;
`;

const StyledMenu = styled(Menu)`
  &.ant-menu,
  .ant-menu {
    background-color: transparent;
    border-right: none;
    color: white;

    // Menu item containers
    .ant-menu-item,
    .ant-menu-submenu,
    .ant-menu-submenu-title {
      margin-top: 0;
      margin-bottom: 0;
      width: 100%;
      height: auto;
      padding-top: 0;
      padding-bottom: 0;
    }

    // Menuitem links
    a {
      display: block;
      margin-top: 8px;
      margin-bottom: 8px;
      line-height: 40px;
      color: white;
      text-decoration: none;
      cursor: pointer;
    }

    // Menu item hover state
    .ant-menu-submenu-active .ant-menu-submenu-title,
    .ant-menu-item-active {
      background-color: ${activeMenuBackgroundColor};
      color: white;
    }

    // Menu item selected state
    .ant-menu-item-selected {
      background-color: ${activeMenuBackgroundColor};

      &:after {
        border-right: 4px solid ${theme.colors.sudoBlue};
      }
    }

    .ant-menu-submenu-selected {
      background-color: ${activeMenuGroupBackgroundColor};
    }

    // Expand/contract icon
    .ant-menu-submenu,
    .ant-menu-submenu:hover {
      .ant-menu-submenu-arrow:before,
      .ant-menu-submenu-arrow:after {
        color: white;
        background: #fff;
      }
    }
  }

  // Force all icon images in the sidebar menu to a specific color
  // regardless on what the style guide differences might be.
  // NOTE : This assumes the icons are SVG format.
  img .colored-icon {
    fill: #ffffff;
  }
`;

const IconImage = styled(Image)`
  display: inline-block;
  margin-right: 12px;
`;

interface Props {
  pathName: string;
  routes: RouteDefinition[];
}

export const Sidebar = (props: Props): React.ReactElement => {
  const [openKeys, setOpenKeys] = useState(getPathAncestry(props.pathName));

  // Converts parameterized route paths to real paths, e.g.
  //   `/console/project/:projectId` => `/console/project/some-project`
  const getConcretePath = useCallback((routePath: string) => {
    return generatePath(routePath);
  }, []);

  // Function to filter out any routes we don't want to display
  const routeFilter = useCallback(
    (route: RouteDefinition) => route.showInSidebar,
    [],
  );

  // Close all open menus when current path changes
  useEffect(() => {
    setOpenKeys(getPathAncestry(props.pathName));
  }, [setOpenKeys, getConcretePath, props.pathName]);

  return (
    <StyledSidebar>
      <StyledSudoPlatformLogo name="sdca_light" width={100} />
      <StyledMenu
        mode="inline"
        onOpenChange={(keys) =>
          'keys' in keys ? setOpenKeys(keys as string[]) : null
        }
        selectedKeys={[getConcretePath(props.pathName)]}
        openKeys={openKeys}>
        {props.routes.filter(routeFilter).map((route) => {
          const concretePath = getConcretePath(route.path);
          return route.routes ? (
            <SubMenu
              key={concretePath}
              title={
                <Link to={concretePath}>
                  {route.iconName && (
                    <IconImage
                      name={route.iconName}
                      className={route.iconClass}
                    />
                  )}
                  {route.displayName}
                </Link>
              }>
              {route.routes.filter(routeFilter).map((subRoute) => {
                const concreteChildPath = getConcretePath(subRoute.path);
                return (
                  <Menu.Item key={concreteChildPath}>
                    <Link to={concreteChildPath}>
                      {subRoute.iconName && (
                        <IconImage
                          name={subRoute.iconName}
                          className={route.iconClass}
                        />
                      )}
                      {subRoute.displayName}
                    </Link>
                  </Menu.Item>
                );
              })}
            </SubMenu>
          ) : (
            <Menu.Item key={concretePath}>
              <Link to={concretePath}>
                {route.iconName && (
                  <IconImage
                    name={route.iconName}
                    className={route.iconClass}
                  />
                )}
                {route.displayName}
              </Link>
            </Menu.Item>
          );
        })}
      </StyledMenu>
    </StyledSidebar>
  );
};
