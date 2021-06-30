/**
 * Configuration for import sorting helpers.
 * In VSCode, use `sort-imports` extension for write-on-save support in 
 * the .vscode/settings.json.
 */
module.exports = {
  '.js, .jsx, .es6, .es, .mjs, .ts, .tsx': {
    parser: 'babylon',
    style: 'import-sort-style-chardy',
  },
}
