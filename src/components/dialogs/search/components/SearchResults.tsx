import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Search, User, Briefcase, Folder } from 'lucide-react';
import { SearchResult } from '@/services/SearchService';

export interface SearchResultsProps {
  results: SearchResult[];
  selectedResult: SearchResult | null;
  onResultSelect: (result: SearchResult) => void;
  isSearching: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ 
  results, 
  selectedResult, 
  onResultSelect, 
  isSearching 
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <User className="h-4 w-4" />;
      case 'resource':
        return <Briefcase className="h-4 w-4" />;
      case 'project':
        return <Folder className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-slate-100 text-slate-900 dark:bg-blue-900 dark:text-blue-200';
      case 'resource':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'project':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Задача';
      case 'resource':
        return 'Ресурс';
      case 'project':
        return 'Проект';
      default:
        return 'Другое';
    }
  };

  if (isSearching) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 animate-spin" />
          <span>Поиск...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Ничего не найдено</p>
          <p className="text-sm">Попробуйте изменить поисковый запрос</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {results.map((result) => (
        <div
          key={result.id}
          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
            selectedResult?.id === result.id ? 'bg-accent border-primary' : ''
          }`}
          onClick={() => onResultSelect(result)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getIcon(result.type)}
                <span className="font-medium truncate">{result.title}</span>
                <Badge variant="secondary" className={getTypeColor(result.type)}>
                  {getTypeLabel(result.type)}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.description}
              </p>
              
              {result.context && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {result.context}
                </p>
              )}
              
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs text-muted-foreground">
                  {result.path}
                </span>
                
                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="flex items-center space-x-1">
                    {Object.entries(result.metadata).slice(0, 2).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

