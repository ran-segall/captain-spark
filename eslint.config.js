import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import unusedImports from 'eslint-plugin-unused-imports'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Unused variables and imports (critical for Vercel deployment)
      'no-unused-vars': [
        'error',
        { 
          vars: 'all', 
          args: 'after-used', 
          ignoreRestSiblings: false, 
          varsIgnorePattern: '^_', 
          argsIgnorePattern: '^_' 
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          varsIgnorePattern: '^_', 
          argsIgnorePattern: '^_',
          caughtErrors: 'all'
        }
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      
      // React-specific unused rules (commented out - requires react plugin)
      // 'react/jsx-no-undef': 'error',
      // 'react/jsx-uses-react': 'error',
      // 'react/jsx-uses-vars': 'error',
      
      // Import/export rules
      'no-duplicate-imports': 'error',
      '@typescript-eslint/no-duplicate-imports': 'error',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      
      // Additional deployment safety rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-eval': 'error',
      
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
])
