import { shallow } from 'enzyme';
import { FlaggedFeature } from './FlaggedFeature';
import React from 'react';
import { FeatureFlag } from '../../feature-flags';

const context = { featureFlags: [] as FeatureFlag[] };
jest.spyOn(React, 'useContext').mockImplementation(() => context);

describe('FlaggedFeature', () => {
  it('should render disabled content', () => {
    context.featureFlags = [];

    const wrapper = shallow(
      <FlaggedFeature
        flag={FeatureFlag.EXAMPLE_FEATURE}
        ifEnabled={<>ENABLED</>}
        ifDisabled={<>DISABLED</>}
      />,
    );

    expect(wrapper.text()).toBe('DISABLED');
  });

  it('should render enabled content', () => {
    context.featureFlags = [FeatureFlag.EXAMPLE_FEATURE];

    const wrapper = shallow(
      <FlaggedFeature
        flag={FeatureFlag.EXAMPLE_FEATURE}
        ifEnabled={<>ENABLED</>}
        ifDisabled={<>DISABLED</>}
      />,
    );
    expect(wrapper.text()).toBe('ENABLED');
  });
});
