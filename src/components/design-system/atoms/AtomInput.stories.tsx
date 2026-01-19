import type { Meta, StoryObj } from '@storybook/react';
import { AtomInput } from './AtomInput';

const meta: Meta<typeof AtomInput> = {
  title: 'Design System/Atoms/AtomInput',
  component: AtomInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Базовое поле ввода без бизнес-логики. Следует принципам Atomic Design.',
      },
    },
  },
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Подсказка в поле ввода',
    },
    value: {
      control: 'text',
      description: 'Значение поля ввода',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      defaultValue: 'text',
      description: 'Тип поля ввода',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      defaultValue: 'md',
      description: 'Размер поля ввода',
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'active', 'disabled', 'loading'],
      defaultValue: 'default',
      description: 'Состояние поля ввода',
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
      description: 'Заблокировано ли поле ввода',
    },
    required: {
      control: 'boolean',
      defaultValue: false,
      description: 'Обязательное поле',
    },
    error: {
      control: 'boolean',
      defaultValue: false,
      description: 'Есть ли ошибка',
    },
    helperText: {
      control: 'text',
      description: 'Вспомогательный текст',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Sample text',
    placeholder: 'Enter text...',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter email...',
    error: true,
    helperText: 'Please enter a valid email address',
  },
};

export const WithHelper: Story = {
  args: {
    placeholder: 'Enter password...',
    helperText: 'Password must be at least 8 characters',
  },
};

export const Disabled: Story = {
  args: {
    value: 'Disabled input',
    disabled: true,
  },
};

export const Required: Story = {
  args: {
    placeholder: 'Enter name...',
    required: true,
  },
};
