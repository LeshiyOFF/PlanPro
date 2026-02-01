import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Базовый компонент для секции настроек
 */
interface PreferencesSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  title,
  description,
  children,
  className = ''
}) => {
  return (
    <Card className={`preferences-section ${className}`}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

