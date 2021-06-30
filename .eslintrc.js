module.exports = {
  root: true,

  settings: {
    react: {
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
  },
  overrides: [
    // Standard typescript rules
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'prettier',
        'prettier/@typescript-eslint',
      ],
      rules: {
        'no-unused-expressions': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        // Not all react components use display names
        'react/display-name': 'off',

        // For convenience:
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          { allowExpressions: true, allowTypedFunctionExpressions: true },
        ],
        // To allow placeholder vars:
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        // To allow e.g. `interface Props extends RouteComponentProps {}`:
        '@typescript-eslint/no-empty-interface': [
          'error',
          {
            allowSingleExtends: true,
          },
        ],
        // Typescript will do this:
        'react/prop-types': 'off',
        // Allow newspaper code structure:
        '@typescript-eslint/no-use-before-define': 'off',
        // We are using a REST API defined by Aries RFCs which 
        // explicitely uses snake case fields.  I originally implemented
        // conversion routines to internal format of camel case.
        // However the issue with that is displays of data don't 
        // reflect on the wire format and can be confusing. It is
        // also prone to error and difficulty in maintaining type
        // safety.
        '@typescript-eslint/camelcase': 'off',
      },
    },
    // Additional rules for TS unit test files
    {
      files: [
        'src/setupTests.ts',
        'src/test/**/*.{ts,tsx}',
        'e2e/**/*.ts',
        '**/*.spec.{ts,tsx}',
        '**/__mocks__/**/*.{ts,tsx}',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        // The OpenAPI generated code for di-cloud-agent-sdk
        // uses camelcase as otherwise it wont match up with
        // the actual http response bodies from ACA-py
        '@typescript-eslint/camelcase': 'off',
      },
    },
    // JS configuration files in the root dir
    {
      files: ['*.js'],
      extends: 'eslint:recommended',
      parserOptions: {
        ecmaVersion: 2018,
      },
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
