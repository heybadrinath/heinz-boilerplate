import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders children content', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<Card title="Test Title">Content</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<Card subtitle="Test Subtitle">Content</Card>);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders both title and subtitle', () => {
    render(
      <Card title="Test Title" subtitle="Test Subtitle">
        Content
      </Card>
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('default');
  });

  it('applies elevated variant class when specified', () => {
    render(<Card variant="elevated">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('elevated');
  });

  it('applies outlined variant class when specified', () => {
    render(<Card variant="outlined">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('outlined');
  });

  it('applies medium padding by default', () => {
    render(<Card>Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('padding-medium');
  });

  it('applies correct padding classes', () => {
    render(<Card padding="large">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('padding-large');
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('does not render header when no title or subtitle provided', () => {
    render(<Card>Content only</Card>);
    const card = screen.getByText('Content only').closest('div');
    const header = card?.querySelector('.header');
    expect(header).not.toBeInTheDocument();
  });

  it('renders header when title is provided', () => {
    render(<Card title="Title">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    const header = card?.querySelector('.header');
    expect(header).toBeInTheDocument();
  });

  it('renders header when subtitle is provided', () => {
    render(<Card subtitle="Subtitle">Content</Card>);
    const card = screen.getByText('Content').closest('div');
    const header = card?.querySelector('.header');
    expect(header).toBeInTheDocument();
  });
});