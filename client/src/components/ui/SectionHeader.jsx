import React from 'react';
import { Badge } from './Badge';

export function SectionHeader({
  badgeText,
  title,
  subtitle,
  align = 'center', // 'center' | 'left'
  className = ''
}) {
  return (
    <div className={`section-header section-header--${align} ${className}`.trim()}>
      {badgeText && <Badge>{badgeText}</Badge>}
      <h2 className="section-header__title">{title}</h2>
      {subtitle && <p className="section-header__subtitle">{subtitle}</p>}
    </div>
  );
}
