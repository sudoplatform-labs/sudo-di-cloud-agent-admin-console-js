import React from 'react';

export type ImageName =
  | 'home'
  | 'settings'
  | 'sdca_light'
  | 'sdca_dark'
  | 'icon-did-line'
  | 'icon-connection-line'
  | 'icon-issuer-line'
  | 'icon-verifiable-credential-line'
  | 'icon-verifier-line'
  | 'icon-wallet-line';

export const Image: React.FC<{
  name: ImageName;
  className?: string;
}> = (props) => {
  return (
    <img
      className={props.className}
      srcSet={`/images/${props.name}.svg`}
      src="/images/default.png"
      alt={`${props.name} icon`}
    />
  );
};
