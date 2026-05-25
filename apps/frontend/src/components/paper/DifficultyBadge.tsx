import React from 'react';
import { Badge } from '@/components/ui/Badge';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
}

const difficultyConfig = {
  easy: { variant: 'success' as const, label: 'Easy' },
  medium: { variant: 'warning' as const, label: 'Medium' },
  hard: { variant: 'danger' as const, label: 'Hard' },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty];

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
