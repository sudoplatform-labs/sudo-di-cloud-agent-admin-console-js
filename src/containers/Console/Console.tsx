import React from 'react';
import { NavLayout } from '../../components/NavLayout';
import { RouteRenderer } from '../../components/RouteRenderer';
import { getConsoleRoutesRoot } from './routes';

/**
 * <Console> renders the main app navigation, and console routes deal
 * with customer-level functionality.
 */
export const Console: React.FC = () => {
  return (
    <NavLayout>
      <RouteRenderer routeFactory={getConsoleRoutesRoot} />
    </NavLayout>
  );
};
