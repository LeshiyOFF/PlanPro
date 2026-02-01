import type { StoryObj, Meta } from '@storybook/react';
import { AtomBadge } from './AtomBadge';

const meta: Meta<typeof AtomBadge> = {
  title: 'Design System/Atoms/AtomBadge/Variants',
  component: AtomBadge,
  parameters: {
    docs: {
      description: {
        component: 'Дополнительные варианты AtomBadge для демонстрации всех комбинаций',
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

export const Square: Story = {
  args: {
    rounded: false,
    children: 'Square Badge',
  },
};

export const WithNumbers: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <meta.component color="success">5</meta.component>
      <meta.component color="warning">12</meta.component>
      <meta.component color="error">3</meta.component>
      <meta.component color="info">99+</meta.component>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <meta.component color="success">✓</meta.component>
      <meta.component color="warning">⚠</meta.component>
      <meta.component color="error">✗</meta.component>
      <meta.component color="info">ℹ</meta.component>
    </div>
  ),
};

