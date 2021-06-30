import { shallow } from 'enzyme';
import React from 'react';
import { FeatureUnavailable } from './FeatureUnavailable';

describe('FeatureUnavailable', () => {
  it('should render correctly', () => {
    const component = shallow(
      <FeatureUnavailable
        pageHeading="Chris in Montana"
        ctaHeading="Chris is the name and desertion is the game"
        ctaDescription="Chris left me and I can't function..."
        ctaSubDescription="CHRISTOPHER!!!!  WHY!!!!!"
        ctaLink="www.never-leave-again.com"
        imageName="settings"
      />,
    );

    expect(component).toMatchSnapshot();
  });
});
