import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RotateCcw, Filter } from 'lucide-react';

export interface SearchFormProps {
  searchText: string;
  searchType: string;
  isSearching: boolean;
  onSearchTextChange: (text: string) => void;
  onSearchTypeChange: (type: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  searchText,
  searchType,
  isSearching,
  onSearchTextChange,
  onSearchTypeChange,
  onSearch,
  onClear
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const searchTypes = [
    { value: 'all', label: 'Все типы' },
    { value: 'task', label: 'Задачи' },
    { value: 'resource', label: 'Ресурсы' },
    { value: 'project', label: 'Проекты' },
    { value: 'document', label: 'Документы' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      onSearch();
    }
  };

  const handleClear = () => {
    onSearchTextChange('');
    onClear();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="searchText">Текст поиска</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="searchText"
                type="text"
                placeholder="Введите текст для поиска..."
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                className="pl-10"
                disabled={isSearching}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isSearching}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="space-y-2">
            <Label htmlFor="searchType">Тип поиска</Label>
            <Select 
              value={searchType} 
              onValueChange={onSearchTypeChange}
              disabled={isSearching}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {searchTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end space-x-2">
            <Button
              type="submit"
              disabled={!searchText.trim() || isSearching}
            >
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  <span>Поиск...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Найти</span>
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="text-sm font-medium mb-2">Дополнительные фильтры</div>
            <div className="text-sm text-muted-foreground">
              Расширенные фильтры будут доступны в следующей версии
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

