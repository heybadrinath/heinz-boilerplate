import type { Meta, StoryObj } from '@storybook/react';
import { Landing } from './Landing';

const meta: Meta<typeof Landing> = {
  title: 'Components/Landing',
  component: Landing,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main landing page component showcasing the boilerplate features and API status.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    apiStatus: {
      control: 'select',
      options: ['checking', 'healthy', 'unhealthy'],
      description: 'Current status of the backend API',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    apiStatus: 'checking',
  },
};

export const HealthyAPI: Story = {
  args: {
    apiStatus: 'healthy',
  },
  parameters: {
    docs: {
      description: {
        story: 'Landing page when the backend API is healthy and responding.',
      },
    },
  },
};

export const UnhealthyAPI: Story = {
  args: {
    apiStatus: 'unhealthy',
  },
  parameters: {
    docs: {
      description: {
        story: 'Landing page when the backend API is not responding or unhealthy.',
      },
    },
  },
};

export const CheckingAPI: Story = {
  args: {
    apiStatus: 'checking',
  },
  parameters: {
    docs: {
      description: {
        story: 'Landing page while checking the backend API status.',
      },
    },
  },
};