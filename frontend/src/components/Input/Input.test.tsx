import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input Component', () => {
  it('renders input with placeholder', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('associates label with input using htmlFor', () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', 'email-input');
    expect(input).toHaveAttribute('id', 'email-input');
  });

  it('shows required asterisk when required', () => {
    render(<Input label="Required Field" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders help text when provided', () => {
    render(<Input helpText="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(<Input error errorMessage="This is an error" />);
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('prioritizes error message over help text', () => {
    render(
      <Input
        helpText="Help text"
        error
        errorMessage="Error message"
      />
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Help text')).not.toBeInTheDocument();
  });

  it('applies error class when error prop is true', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('error');
  });

  it('applies disabled class when disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('disabled');
    expect(input).toBeDisabled();
  });

  it('handles onChange events', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('sets correct input type', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('sets aria-invalid when error is true', () => {
    render(<Input error />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('sets aria-describedby for error message', () => {
    render(<Input id="test-input" error errorMessage="Error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('sets aria-describedby for help text', () => {
    render(<Input id="test-input" helpText="Help" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-help');
  });

  it('applies custom className to container', () => {
    render(<Input className="custom-class" />);
    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});