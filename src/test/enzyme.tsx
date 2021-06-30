import { ReactWrapper, mount } from 'enzyme';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router';

const defaultWrapper = MemoryRouter;

/**
 * Mounts a component with a default wrapper
 * and flushes effects.
 */
export async function acwMount<
  C extends React.Component,
  P = C['props'],
  S = C['state']
>(
  node: React.ReactElement<P>,
  opts: {
    wrappingComponent?: React.ComponentType | null;
  } = {},
): Promise<ReactWrapper<P, S, C>> {
  // Mount with wrapper
  const wrapper = mount<C, P, S>(node, {
    wrappingComponent:
      opts.wrappingComponent === null
        ? undefined
        : opts.wrappingComponent ?? defaultWrapper,
  });

  // Flush effects
  await act(async () => undefined);
  wrapper.update();

  return wrapper;
}
