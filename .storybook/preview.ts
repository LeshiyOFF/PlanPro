import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: (background) => {
          if (typeof background === 'string') {
            return background;
          }
          return false;
        },
      },
    },
    docs: {
      toc: true,
    },
  },
  globalTypes: {
    // Color controls - исправляем union type проблему
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'neutral'],
      defaultValue: 'primary',
      description: 'Цветовая тема компонента',
    },
    
    // Variant controls
    variant: {
      control: 'select', 
      options: ['solid', 'outline', 'ghost', 'soft'],
      defaultValue: 'solid',
      description: 'Вариант отображения компонента',
    },
    
    // Size controls
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
      description: 'Размер компонента',
    },
    
    // State controls
    state: {
      control: 'select',
      options: ['default', 'hover', 'active', 'disabled', 'loading'],
      defaultValue: 'default',
      description: 'Состояние компонента',
    },
    
    // Common controls
    disabled: {
      control: 'boolean',
      defaultValue: false,
      description: 'Заблокирован ли компонент',
    },
    
    children: {
      control: 'text',
      description: 'Содержимое компонента',
    },
    
    className: {
      control: 'text',
      description: 'Дополнительные CSS классы',
    },
    
    testId: {
      control: 'text',
      description: 'Test ID для автоматизации',
    },
  },
};

export default preview;