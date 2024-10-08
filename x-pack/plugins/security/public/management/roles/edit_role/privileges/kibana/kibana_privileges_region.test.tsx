/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { shallow } from 'enzyme';
import React from 'react';

import { coreMock } from '@kbn/core/public/mocks';
import type { Role } from '@kbn/security-plugin-types-common';
import { KibanaPrivileges } from '@kbn/security-role-management-model';
import { spacesManagerMock } from '@kbn/spaces-plugin/public/spaces_manager/mocks';
import { getUiApi } from '@kbn/spaces-plugin/public/ui_api';

import { KibanaPrivilegesRegion } from './kibana_privileges_region';
import { SimplePrivilegeSection } from './simple_privilege_section';
import { SpaceAwarePrivilegeSection } from './space_aware_privilege_section';
import { TransformErrorSection } from './transform_error_section';
import { RoleValidator } from '../../validate_role';

const spacesManager = spacesManagerMock.create();
const { getStartServices } = coreMock.createSetup();
const spacesApiUi = getUiApi({ spacesManager, getStartServices });

const buildProps = () => {
  return {
    role: {
      name: '',
      elasticsearch: {
        cluster: [],
        indices: [],
        run_as: [],
      },
      kibana: [],
    },
    spaces: [
      {
        id: 'default',
        name: 'Default Space',
        disabledFeatures: [],
        _reserved: true,
      },
      {
        id: 'marketing',
        name: 'Marketing',
        disabledFeatures: [],
      },
    ],
    features: [],
    kibanaPrivileges: new KibanaPrivileges(
      {
        global: {},
        space: {},
        features: {},
        reserved: {},
      },
      []
    ),
    intl: null as any,
    uiCapabilities: {
      navLinks: {},
      management: {},
      catalogue: {},
      spaces: {
        manage: true,
      },
    },
    editable: true,
    onChange: jest.fn(),
    validator: new RoleValidator(),
    canCustomizeSubFeaturePrivileges: true,
    spacesEnabled: true,
    spacesApiUi,
  };
};

describe('<KibanaPrivileges>', () => {
  it('renders without crashing', () => {
    const props = buildProps();
    expect(shallow(<KibanaPrivilegesRegion {...props} />)).toMatchSnapshot();
  });

  it('renders the space-aware privilege form', () => {
    const props = buildProps();
    const wrapper = shallow(<KibanaPrivilegesRegion {...props} />);
    expect(wrapper.find(SpaceAwarePrivilegeSection)).toHaveLength(1);
  });

  it('renders simple privilege form when spaces is disabled', () => {
    const props = buildProps();
    const wrapper = shallow(<KibanaPrivilegesRegion {...props} spacesEnabled={false} />);
    expect(wrapper.find(SimplePrivilegeSection)).toHaveLength(1);
  });

  it('renders the transform error section when the role has a transform error', () => {
    const props = buildProps();
    (props.role as Role)._transform_error = ['kibana'];

    const wrapper = shallow(<KibanaPrivilegesRegion {...props} />);
    expect(wrapper.find(SpaceAwarePrivilegeSection)).toHaveLength(0);
    expect(wrapper.find(TransformErrorSection)).toHaveLength(1);
  });
});
