import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ButtonGroup } from './ButtonGroup'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Design System/Molecules/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Группа кнопок с логикой. Следует принципам Atomic Design.',
      },
    },
  },
  argTypes: {
    buttons: {
      control: 'object',
      description: 'Массив кнопок',
    },
    variant: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      defaultValue: 'horizontal',
      description: 'Ориентация группы',
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      defaultValue: 'sm',
      description: 'Отступ между кнопками',
    },
    equalWidth: {
      control: 'boolean',
      defaultValue: false,
      description: 'Равная ширина кнопок',
    },
    selected: {
      control: 'text',
      description: 'ID выбранной кнопки',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buttons: [
      { id: '1', children: 'Button 1' },
      { id: '2', children: 'Button 2' },
      { id: '3', children: 'Button 3' },
    ],
  },
}

export const Vertical: Story = {
  args: {
    variant: 'vertical',
    buttons: [
      { id: '1', children: 'Option 1' },
      { id: '2', children: 'Option 2' },
      { id: '3', children: 'Option 3' },
    ],
  },
}

export const WithSpacing: Story = {
  render: () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">No Spacing</h3>
        <ButtonGroup
          variant="horizontal"
          spacing="none"
          buttons={[
            { id: 'a', children: 'A' },
            { id: 'b', children: 'B' },
            { id: 'c', children: 'C' },
          ]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Small Spacing</h3>
        <ButtonGroup
          variant="horizontal"
          spacing="sm"
          buttons={[
            { id: 'd', children: 'D' },
            { id: 'e', children: 'E' },
            { id: 'f', children: 'F' },
          ]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">Large Spacing</h3>
        <ButtonGroup
          variant="horizontal"
          spacing="lg"
          buttons={[
            { id: 'g', children: 'G' },
            { id: 'h', children: 'H' },
            { id: 'i', children: 'I' },
          ]}
        />
      </div>
    </div>
  ),
}

export const EqualWidth: Story = {
  args: {
    variant: 'horizontal',
    equalWidth: true,
    buttons: [
      { id: 'short', children: 'Short' },
      { id: 'medium-length', children: 'Medium Length' },
      { id: 'very-long-button', children: 'Very Long Button' },
    ],
  },
}

export const WithSelection: Story = {
  args: {
    selected: '2',
    buttons: [
      { id: '1', children: 'Option 1' },
      { id: '2', children: 'Option 2' },
      { id: '3', children: 'Option 3' },
    ],
  },
}

export const DifferentColors: Story = {
  args: {
    buttons: [
      { id: 'primary', children: 'Primary', color: 'primary' },
      { id: 'secondary', children: 'Secondary', color: 'secondary' },
      { id: 'success', children: 'Success', color: 'success' },
    ],
  },
}

export const WithIcons: Story = {
  args: {
    buttons: [
      { id: 'save', children: '💾 Save' },
      { id: 'edit', children: '✏️ Edit' },
      { id: 'delete', children: '🗑️ Delete' },
    ],
  },
}

/** Демо-компонент с состоянием выбора для стори RadioGroup (хуки только в компонентах с заглавной буквы). */
function RadioGroupDemo() {
  const [selected, setSelected] = React.useState('option1')

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Option</h3>
      <ButtonGroup
        variant="vertical"
        selected={selected}
        onSelect={setSelected}
        equalWidth
        buttons={[
          { id: 'option1', children: 'First Option' },
          { id: 'option2', children: 'Second Option' },
          { id: 'option3', children: 'Third Option' },
        ]}
      />
      <p className="text-sm text-gray-600">Selected: {selected}</p>
    </div>
  )
}

export const RadioGroup: Story = {
  render: () => <RadioGroupDemo />,
}

