import type { Meta, StoryObj } from '@storybook/react';
import { Nav } from './Nav';

const meta: Meta<typeof Nav> = {
  title: 'Components/Nav',
  component: Nav,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A responsive navigation component with brand and navigation items.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    brand: {
      control: 'text',
      description: 'Brand/logo text displayed in the navigation',
    },
    items: {
      control: 'object',
      description: 'Array of navigation items',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brand: 'Heinz Boilerplate',
    items: [
      { label: 'Home', href: '/', active: true },
      { label: 'Documentation', href: '/docs', active: false },
      { label: 'API', href: '/api', active: false },
      { label: 'GitHub', href: '#', active: false },
    ],
  },
};

export const BrandOnly: Story = {
  args: {
    brand: 'My App',
    items: [],
  },
};

export const WithManyItems: Story = {
  args: {
    brand: 'Heinz Boilerplate',
    items: [
      { label: 'Home', href: '/', active: false },
      { label: 'Products', href: '/products', active: false },
      { label: 'Services', href: '/services', active: true },
      { label: 'About', href: '/about', active: false },
      { label: 'Blog', href: '/blog', active: false },
      { label: 'Contact', href: '/contact', active: false },
    ],
  },
};