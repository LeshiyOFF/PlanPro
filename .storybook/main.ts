/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-viewport'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        // Исключаем проблемные union types
        if (prop.name === 'color' || prop.name === 'variant' || prop.name === 'size' || prop.name === 'state') {
          return false;
        }
        // Фильтруем node_modules
        if (prop.parent?.fileName && /node_modules/.test(prop.parent.fileName)) {
          return false;
        }
        return true;
      },
      extractComponentComments: false,
      skipChildrenPropWithoutDoc: false,
    },
  },
  features: {
    buildStoriesJson: true,
    storyStoreV7: true,
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;