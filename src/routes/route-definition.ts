import { ImageName } from '../components/Image';
import { FeatureFlag } from '../feature-flags';

export interface RouteDefinition {
  /** Route path */
  path: string;

  /** Results in partial match if set to false (default = true) */
  exact?: boolean;

  /** Component to render for this route */
  component?: React.ComponentType;

  /** Child routes that are nested under this route */
  routes?: RouteDefinition[];

  /** Display name of route, used in Sidebar etc. */
  displayName?: string;

  /** Icon to be displayed in sidebar */
  iconName?: ImageName;

  /** Allow Icon classes to apply styling if necessary */
  iconClass?: string;

  /** Set to true if this route should appear in the sidebar */
  showInSidebar?: boolean;

  /** Restrict visibility based on a feature flag  */
  featureFlag?: FeatureFlag;
}

export type RouteDefinitionFactory = () => RouteDefinition;
