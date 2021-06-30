import React from 'react';

export function mockComponent(
  path: any,
  exportName: string,
  renderChildren?: boolean,
): React.FC<any> {
  const mock: React.FC = (props) => <>{renderChildren && props.children}</>;
  mock.displayName = `Mock${exportName}`;

  const componentModule = module.parent!.require(path);
  componentModule[exportName] = mock;

  return mock;
}
