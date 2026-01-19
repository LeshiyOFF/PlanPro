import React from 'react';
import type { StoryObj, Meta } from '@storybook/react';
import { AtomButton } from './AtomButton';

const meta: Meta<typeof AtomButton> = {
  title: 'Design System/Atoms/AtomButton/Variants',
  component: AtomButton,
  parameters: {
    docs: {
      description: {
        component: 'Дополнительные варианты AtomButton для демонстрации всех комбинаций',
      },
    },
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Colors: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <meta.component variant="solid" color="primary">Primary</meta.component>
      <meta.component variant="solid" color="secondary">Secondary</meta.component>
      <meta.component variant="solid" color="success">Success</meta.component>
      <meta.component variant="solid" color="warning">Warning</meta.component>
      <meta.component variant="solid" color="error">Error</meta.component>
      <meta.component variant="solid" color="info">Info</meta.component>
      <meta.component variant="solid" color="neutral">Neutral</meta.component>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <meta.component size="xs">XS</meta.component>
      <meta.component size="sm">SM</meta.component>
      <meta.component size="md">MD</meta.component>
      <meta.component size="lg">LG</meta.component>
      <meta.component size="xl">XL</meta.component>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <span>
        <span className="mr-2">🚀</span>
        With Icon
      </span>
    ),
  },
};

