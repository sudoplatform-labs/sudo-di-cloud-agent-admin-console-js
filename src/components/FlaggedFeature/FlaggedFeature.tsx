import React, { useContext } from 'react';
import { FeatureFlag } from '../../feature-flags';
import { AppContext } from '../../containers/App';

interface Props {
  flag: FeatureFlag;
  ifEnabled: React.ReactElement;
  ifDisabled: React.ReactElement;
}

export const FlaggedFeature: React.FC<Props> = (props) => {
  const { featureFlags } = useContext(AppContext);

  return featureFlags.includes(props.flag) ? props.ifEnabled : props.ifDisabled;
};
