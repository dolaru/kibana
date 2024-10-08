/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { Component, ComponentType } from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import { Route } from '@kbn/shared-ux-router';
import { History, LocationDescriptor } from 'history';

const stringifyPath = (path: LocationDescriptor): string => {
  if (typeof path === 'string') {
    return path;
  }

  return path.pathname || '/';
};

const locationDescriptorToRoutePath = (
  paths: LocationDescriptor | LocationDescriptor[]
): string | string[] => {
  if (Array.isArray(paths)) {
    return paths.map((path: LocationDescriptor) => {
      return stringifyPath(path);
    });
  }

  return stringifyPath(paths);
};

export const WithMemoryRouter =
  (initialEntries: LocationDescriptor[] = ['/'], initialIndex: number = 0) =>
  (WrappedComponent: ComponentType) =>
  (props: any) =>
    (
      <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
        <WrappedComponent {...props} />
      </MemoryRouter>
    );

export function WithRoute<T extends object = Record<string, any>>(
  componentRoutePath: LocationDescriptor | LocationDescriptor[] = ['/'],
  onRouter = (router: any) => {}
) {
  return (WrappedComponent: ComponentType<T>) => {
    // Create a class component that will catch the router
    // and forward it to our "onRouter()" handler.
    const CatchRouter = withRouter(
      class extends Component<any> {
        componentDidMount() {
          const { match, location, history } = this.props;
          const router = { route: { match, location }, history };
          onRouter(router);
        }

        render() {
          return <WrappedComponent {...(this.props as any)} />;
        }
      }
    );

    return (props: any) => (
      <Route
        path={locationDescriptorToRoutePath(componentRoutePath)}
        render={(routerProps) => <CatchRouter {...routerProps} {...props} />}
      />
    );
  };
}

interface Router {
  history: Partial<History>;
  route: {
    location: LocationDescriptor;
  };
}

export const reactRouterMock: Router = {
  history: {
    push: () => {},
    createHref: (location) => location.pathname!,
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: '',
    },
  },
  route: {
    location: {
      pathname: '',
      search: '',
      state: '',
      hash: '',
    },
  },
};
