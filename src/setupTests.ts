import 'jest-styled-components';
import Enzyme from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import { createSerializer } from 'enzyme-to-json';
import moment from 'moment-timezone';
import pretty from 'pretty';
import { throwOnConsole } from './test/log-overrides';

Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.setTimeout(5000);

moment.tz.setDefault('UTC');

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

beforeEach(() => {
  jest.clearAllMocks();
});

throwOnConsole(
  'warn',
  /* ignore: */ [
    // Antd form warnings:
    { type: 'regex', value: /async-validator/ },
    { type: 'regex', value: /Please update(.*)(Animate|Form)/ },
    // MaskedInput componentWillReceiveProps warning:
    // https://github.com/antoniopresto/antd-mask-input/issues/16
    { type: 'regex', value: /MaskedInput/ },
  ],
);

throwOnConsole(
  'error',
  /* ignore: */ [
    // Antd form validation "errors" reported by `form.validateFields()`
    { type: 'object', value: { errors: {}, values: {} } },
  ],
);

// Enzyme component serializer
expect.addSnapshotSerializer(createSerializer() as any);

// Serializer for JSDom elements
expect.addSnapshotSerializer({
  test(value: any) {
    return value?.outerHTML;
  },
  print(value: any) {
    return pretty(value.outerHTML, { ocd: true });
  },
});
