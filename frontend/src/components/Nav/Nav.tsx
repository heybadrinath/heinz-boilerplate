import React from 'react';
import styles from './Nav.module.css';

export interface NavItem {
  /** Navigation item label */
  label: string;
  /** Navigation item href */
  href: string;
  /** Is item active */
  active?: boolean;
}

export interface NavProps {
  /** Navigation brand/logo text */
  brand?: string;
  /** Navigation items */
  items?: NavItem[];
  /** CSS class name */
  className?: string;
}

export const Nav: React.FC<NavProps> = ({
  brand = 'Heinz Boilerplate',
  items = [],
  className = '',
}) => {
  const navClasses = [styles.nav, className].filter(Boolean).join(' ');

  return (
    <nav className={navClasses}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <a href="/" className={styles.brandLink}>
            {brand}
          </a>
        </div>
        {items.length > 0 && (
          <div className={styles.items}>
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className={`${styles.item} ${item.active ? styles.active : ''}`}
              >
                {item.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};