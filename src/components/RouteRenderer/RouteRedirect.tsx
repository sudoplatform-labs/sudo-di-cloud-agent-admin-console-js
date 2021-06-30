import React from 'react';
import { Redirect, generatePath } from 'react-router';

interface Props {
  routePath: string;
}

export const RouteRedirect: React.FC<Props> = (props) => {
  return <Redirect to={generatePath(props.routePath)} />;
};

export function createRouteRedirect(routePath: string): React.FC {
  const BoundRouteRedirect: React.FC = () => (
    <RouteRedirect routePath={routePath} />
  );

  return BoundRouteRedirect;
}
