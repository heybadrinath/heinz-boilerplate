import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Button } from '../Button';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component for displaying content with optional title and subtitle.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      description: 'Visual style variant of the card',
    },
    padding: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description: 'Internal padding of the card',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'This is a subtitle for the card',
    children: 'This is the main content of the card. It can contain any React elements.',
  },
};

export const Elevated: Story = {
  args: {
    title: 'Elevated Card',
    subtitle: 'This card has a shadow effect',
    variant: 'elevated',
    children: 'Elevated cards are great for highlighting important content.',
  },
};

export const Outlined: Story = {
  args: {
    title: 'Outlined Card',
    subtitle: 'This card has a colored border',
    variant: 'outlined',
    children: 'Outlined cards draw attention with their prominent border.',
  },
};

export const WithoutHeader: Story = {
  args: {
    children: 'This card has no title or subtitle, just content.',
    variant: 'elevated',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Card with Actions',
    subtitle: 'This card includes action buttons',
    children: (
      <div>
        <p>This card demonstrates how to include interactive elements.</p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <Button variant="primary" size="small">Primary Action</Button>
          <Button variant="outline" size="small">Secondary Action</Button>
        </div>
      </div>
    ),
    variant: 'elevated',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', width: '100%', maxWidth: '900px' }}>
      <Card variant="default" title="Default Card" subtitle="Basic card style">
        Default variant with subtle border.
      </Card>
      <Card variant="elevated" title="Elevated Card" subtitle="Card with shadow">
        Elevated variant with shadow effect.
      </Card>
      <Card variant="outlined" title="Outlined Card" subtitle="Card with border">
        Outlined variant with colored border.
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All card variants displayed together for comparison.',
      },
    },
  },
};