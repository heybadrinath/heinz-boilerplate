import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with label, validation, and help text support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'Input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    error: {
      control: 'boolean',
      description: 'Whether the input has an error state',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
  },
};

export const WithHelpText: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
    helpText: 'We will never share your email with anyone else.',
    type: 'email',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'john@example.com',
    type: 'email',
    error: true,
    errorMessage: 'Please enter a valid email address.',
    defaultValue: 'invalid-email',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
      <Input label="Text Input" type="text" placeholder="Enter text" />
      <Input label="Email Input" type="email" placeholder="Enter email" />
      <Input label="Password Input" type="password" placeholder="Enter password" />
      <Input label="Number Input" type="number" placeholder="Enter number" />
      <Input label="Phone Input" type="tel" placeholder="Enter phone" />
      <Input label="URL Input" type="url" placeholder="Enter URL" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types available in the component.',
      },
    },
  },
};