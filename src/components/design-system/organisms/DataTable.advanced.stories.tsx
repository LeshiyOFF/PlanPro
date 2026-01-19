import type { StoryObj, Meta } from '@storybook/react';
import { DataTable } from './DataTable';

const meta: Meta<typeof DataTable> = {
  title: 'Design System/Organisms/DataTable/Advanced',
  component: DataTable,
  parameters: {
    docs: {
      description: {
        component: 'Расширенные примеры использования DataTable с различными сценариями',
      },
    },
  },
};

// Mock data
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', joinDate: '2023-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', joinDate: '2023-02-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', joinDate: '2023-03-10' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active', joinDate: '2023-04-05' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active', joinDate: '2023-05-12' },
];

type Story = StoryObj<typeof meta>;

export default meta;

export const CustomRendering: Story = {
  args: {
    data: sampleData,
    columns: [
      { key: 'name', title: 'Name', sortable: true },
      { 
        key: 'email', 
        title: 'Email', 
        sortable: true,
        render: (email: string) => (
          <a href={`mailto:${email}`} className="text-primary hover:underline">
            {email}
          </a>
        )
      },
      { 
        key: 'status', 
        title: 'Status', 
        sortable: true,
        render: (status: string) => (
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        )
      },
      { 
        key: 'role', 
        title: 'Role', 
        sortable: true,
        render: (role: string) => (
          <span className={`px-2 py-1 text-xs rounded ${
            role === 'Admin' 
              ? 'bg-purple-100 text-purple-800' 
              : role === 'Manager'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {role}
          </span>
        )
      },
    ],
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8 w-full max-w-6xl">
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Small Table</h3>
        <DataTable
          data={sampleData}
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
          ]}
          size="sm"
        />
      </div>
      
      <div>
        <h3 className="mb-4 text-lg font-medium text-gray-900">Large Table</h3>
        <DataTable
          data={sampleData}
          columns={[
            { key: 'name', title: 'Name' },
            { key: 'email', title: 'Email' },
            { key: 'role', title: 'Role' },
          ]}
          size="lg"
        />
      </div>
    </div>
  ),
};

