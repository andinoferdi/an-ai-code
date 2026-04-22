function noopRule() {
  return {
    meta: {
      type: 'problem',
      docs: { description: 'Local custom rule (stubbed)' },
      schema: [],
    },
    create() {
      return {}
    },
  }
}

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
  rules: {
    'no-cross-platform-process-issues': noopRule(),
    'no-direct-json-operations': noopRule(),
    'no-direct-ps-commands': noopRule(),
    'no-lookbehind-regex': noopRule(),
    'no-process-cwd': noopRule(),
    'no-process-env-top-level': noopRule(),
    'no-process-exit': noopRule(),
    'no-sync-fs': noopRule(),
    'no-top-level-dynamic-import': noopRule(),
    'no-top-level-side-effects': noopRule(),
    'prefer-use-keybindings': noopRule(),
    'prefer-use-terminal-size': noopRule(),
    'prompt-spacing': noopRule(),
    'require-bun-typeof-guard': noopRule(),
    'require-tool-match-name': noopRule(),
    'safe-env-boolean-check': noopRule(),
  },
}

export default plugin
