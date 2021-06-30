import { Breadcrumb } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { RouteDefinition, findRoute, getPathAncestry } from '../../routes';

export const StyledBreadCrumb = styled(Breadcrumb)`
  padding: 12px 24px;
`;

interface Props {
  urlPath: string;
  routes: RouteDefinition[];
}

interface ItemProps {
  path: string;
  linkText: string;
}

export const BreadCrumbs: React.FC<Props> = (props) => {
  const { urlPath } = props;
  const componentUrlPaths = getPathAncestry(urlPath);
  const items: ItemProps[] = componentUrlPaths
    .map((path) => {
      const route = findRoute(path, props.routes);
      return {
        path,
        linkText: route?.displayName ?? '',
      };
    })
    .filter((item) => !!item.linkText);

  return (
    <StyledBreadCrumb separator=">">
      {items.slice(0).map((itemProps) => (
        <Breadcrumb.Item key={itemProps.path}>
          <Link to={itemProps.path}>{itemProps.linkText}</Link>
        </Breadcrumb.Item>
      ))}
    </StyledBreadCrumb>
  );
};
