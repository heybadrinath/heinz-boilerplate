import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined';
  /** Padding size */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** CSS class name */
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  variant = 'default',
  padding = 'medium',
  className = '',
}) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};