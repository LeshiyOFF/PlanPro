import type { Meta, StoryObj } from '@storybook/react';
import { FormField } from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Design System/Molecules/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Поле формы с лейблом и инпутом. Следует принципам Atomic Design.',
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: 'Текст лейбла',
    },
    inputProps: {
      control: 'object',
      description: 'Пропсы для инпута',
    },
    error: {
      control: 'text',
      description: 'Текст ошибки',
    },
    required: {
      control: 'boolean',
      defaultValue: false,
      description: 'Обязательное поле',
    },
    helperText: {
      control: 'text',
      description: 'Вспомогательный текст',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
      description: 'Размер поля',
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'left', 'inline'],
      defaultValue: 'top',
      description: 'Позиция лейбла',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email Address',
    inputProps: {
      type: 'email',
      placeholder: 'Enter your email',
    },
  },
};

export const WithError: Story = {
  args: {
    label: 'Password',
    inputProps: {
      type: 'password',
      placeholder: 'Enter your password',
    },
    error: 'Password must be at least 8 characters',
  },
};

export const WithHelper: Story = {
  args: {
    label: 'Username',
    inputProps: {
      type: 'text',
      placeholder: 'Enter your username',
    },
    helperText: 'Username must be unique and contain only letters and numbers',
  },
};

export const Required: Story = {
  args: {
    label: 'Full Name',
    inputProps: {
      type: 'text',
      placeholder: 'Enter your full name',
    },
    required: true,
  },
};

export const LeftLabel: Story = {
  args: {
    label: 'NAME',
    labelPosition: 'left',
    inputProps: {
      type: 'text',
      placeholder: 'Enter name...',
    },
  },
};

export const Inline: Story = {
  args: {
    label: 'Email',
    labelPosition: 'inline',
    inputProps: {
      type: 'email',
      placeholder: 'Enter email...',
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <FormField
        label="Small Field"
        size="sm"
        inputProps={{
          type: 'text',
          placeholder: 'Small input'
        }}
      />
      <FormField
        label="Medium Field"
        size="md"
        inputProps={{
          type: 'text',
          placeholder: 'Medium input'
        }}
      />
      <FormField
        label="Large Field"
        size="lg"
        inputProps={{
          type: 'text',
          placeholder: 'Large input'
        }}
      />
    </div>
  ),
};

