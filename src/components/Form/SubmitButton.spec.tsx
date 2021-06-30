import React from 'react';

import { SubmitButton } from './SubmitButton';
import { shallow } from 'enzyme';

describe('SubmitButton', () => {
  it('should render correctly when isBusy is false', () => {
    const component = shallow(
      <SubmitButton loading={false} buttonText="Kiwi" />,
    );

    expect(component).toMatchSnapshot();
  });

  it('should render correctly when isBusy is true', () => {
    const component = shallow(
      <SubmitButton loading={true} buttonText="Kiwi" />,
    );

    expect(component).toMatchSnapshot();
  });
});
