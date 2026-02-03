'use client';
import { ReactNode } from 'react';

interface SettingsLayoutProps {
  children?: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="p-6">
      {children}
    </div>
  );
}
