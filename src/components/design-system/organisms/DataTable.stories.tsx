import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './DataTable';

// Mock data
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2023-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joinDate: '2023-02-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', joinDate: '2023-03-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active', joinDate: '2023-04-05' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active', joinDate: '2023-05-12' },
];

const meta: Meta<typeof DataTable> = {
  title: 'Design System/Organisms/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Сложная таблица данных с пагинацией и действиями. Следует принципам Atomic Design.',
      },
    },
  },
  argTypes: {
    data: {
      control: 'object',
      description: 'Массив данных для отображения',
    },
    columns: {
      control: 'object',
      description: 'Конфигурация колонок',
    },
    loading: {
      control: 'boolean',
      defaultValue: false,
      description: 'Состояние загрузки',
    },
    selectable: {
      control: 'boolean',
      defaultValue: false,
      description: 'Возможность выбора строк',
    },
    emptyMessage: {
      control: 'text',
      description: 'Сообщение при отсутствии данных',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      defaultValue: 'md',
      description: 'Размер таблицы',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'email', title: 'Email', sortable: true },
      { key: 'role', title: 'Role', sortable: true },
      { key: 'status', title: 'Status', sortable: true },
    ],
  },
};

export const Selectable: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'email', title: 'Email', sortable: true },
      { key: 'role', title: 'Role', sortable: true },
      { key: 'status', title: 'Status', sortable: true },
    ],
    selectable: true,
  },
};

export const WithPagination: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'email', title: 'Email', sortable: true },
      { key: 'role', title: 'Role', sortable: true },
      { key: 'status', title: 'Status', sortable: true },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 3,
      totalItems: 25,
      itemsPerPage: 10,
    },
  },
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { key: 'email', title: 'Email', sortable: true },
      { key: 'role', title: 'Role', sortable: true },
    ],
    emptyMessage: 'No users found',
  },
};

