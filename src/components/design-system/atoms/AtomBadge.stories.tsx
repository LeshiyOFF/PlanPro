import type { Meta, StoryObj } from '@storybook/react';
import { AtomBadge } from './AtomBadge';

const meta: Meta<typeof AtomBadge> = {
  title: 'Design System/Atoms/AtomBadge',
  component: AtomBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Базовый значок без бизнес-логики. Следует принципам Atomic Design.',
      },
    },
  },
  argTypes: {
    // ПОЛНОСТЬЮ ОТКЛЮЧАЕМ ПРОБЛЕМНЫЕ UNION TYPES
    color: { control: false },
    size: { control: false },
    variant: { control: false },
    
    // ОСТАВЛЯЕМ РАБОЧИЕ КОНТРОЛЫ
    children: {
      control: 'text',
      description: 'Содержимое значка',
    },
    rounded: {
      control: 'boolean',
      defaultValue: true,
      description: 'Скругленные углы',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Solid: Story = {
  args: {
    variant: 'solid',
    children: 'Solid Badge',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Badge',
  },
};

export const Soft: Story = {
  args: {
    variant: 'soft',
    children: 'Soft Badge',
  },
};

