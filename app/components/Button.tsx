"use client";
import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost';
  size?: 'lg' | 'md';
};

export default function Button({ variant = 'primary', size = 'lg', style, ...rest }: Props) {
  const base: React.CSSProperties = {
    minWidth: 56,
    minHeight: 56,
    padding: size === 'lg' ? '16px 20px' : '12px 16px',
    borderRadius: 16,
    border: 'none',
    fontSize: size === 'lg' ? 20 : 18,
    lineHeight: 1.2,
    cursor: 'pointer',
  };
  const theme: React.CSSProperties =
    variant === 'primary'
      ? { background: '#4F8EF7', color: '#fff' }
      : { background: 'transparent', color: '#1F2430', border: '2px solid #CCD6F6' };
  return <button {...rest} style={{ ...base, ...theme, ...style }} />;
}

