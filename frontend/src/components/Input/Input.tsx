import React from 'react';
import styles from './Input.module.css';

export interface InputProps {
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  /** Input value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Help text */
  helpText?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** CSS class name */
  className?: string;
  /** Input id */
  id?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  defaultValue,
  required = false,
  disabled = false,
  error = false,
  errorMessage,
  helpText,
  onChange,
  className = '',
  id,
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const containerClasses = [styles.container, className]
    .filter(Boolean)
    .join(' ');
  const inputClasses = [
    styles.input,
    error ? styles.error : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        onChange={onChange}
        aria-invalid={error}
        aria-describedby={
          errorMessage
            ? `${inputId}-error`
            : helpText
            ? `${inputId}-help`
            : undefined
        }
      />
      {helpText && !errorMessage && (
        <p id={`${inputId}-help`} className={styles.helpText}>
          {helpText}
        </p>
      )}
      {errorMessage && (
        <p id={`${inputId}-error`} className={styles.errorText}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};