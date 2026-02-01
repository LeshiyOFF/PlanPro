import type { Meta, StoryObj } from '@storybook/react'
import { AtomButton } from './AtomButton'

const meta: Meta<typeof AtomButton> = {
  title: 'Design System/Atoms/AtomButton',
  component: AtomButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Базовая кнопка без бизнес-логики. Следует принципам Atomic Design.',
      },
    },
  },
  argTypes: {
    // ПОЛНОСТЬЮ ОТКЛЮЧАЕМ ПРОБЛЕМНЫЕ UNION TYPES
    variant: { control: false },
    color: { control: false },
    size: { control: false },
    state: { control: false },

    // ОСТАВЛЯЕМ РАБОЧИЕ КОНТРОЛЫ
    disabled: {
      control: 'boolean',
      defaultValue: false,
      description: 'Заблокирована ли кнопка',
    },
    children: {
      control: 'text',
      description: 'Содержимое кнопки',
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
}

export default meta
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Solid: Story = {
  args: {
    variant: 'solid',
    children: 'Solid Button',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
}

export const Soft: Story = {
  args: {
    variant: 'soft',
    children: 'Soft Button',
  },
}

