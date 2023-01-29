import React, { FC, memo, PropsWithChildren } from 'react';

import './snackbar-container.css';

import { Portal, PortalProps } from './portal';

export type SnackbarContainerProps = PropsWithChildren<{
  /**
   * По-умолчанию снэкбар всегда будет выводится в портале,
   * но если вдруг очень хочется, то можно без него
   */
  withPortal?: boolean;
  portalProps?: PortalProps;
}>;

export const SnackbarContainer: FC<SnackbarContainerProps> = ({
  withPortal = true,
  portalProps = {
    portalClassName: 'MEConfig SnackbarModal',
  },
  children,
}) => {
  return (
    <WithPortal withPortal={withPortal} portalProps={portalProps}>
      <div className="SnackbarContainer">{children}</div>
    </WithPortal>
  );
};

const WithPortal: FC<Required<SnackbarContainerProps>> = memo(
  ({ withPortal, children, portalProps }) => {
    if (withPortal) {
      return <Portal {...portalProps}>{children}</Portal>;
    }

    return <>{children}</>;
  }
);
