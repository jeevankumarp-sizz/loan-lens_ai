import React from 'react';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        {icon || <FileSearch size={24} style={{ color: 'var(--muted-foreground)' }} />}
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}