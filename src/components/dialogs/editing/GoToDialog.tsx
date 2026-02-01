import React, { useState, useCallback } from 'react';
import { BaseDialog } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // temporarily removed
// import { ScrollArea } from '@/components/ui/scroll-area'; // temporarily removed
import { Search, FileText, Calendar, MapPin, Hash, ArrowRight } from 'lucide-react';
import { useDialogValidation } from '../hooks/useDialogValidation';

interface GoToTarget {
  id: string;
  type: 'task' | 'resource' | 'date' | 'id';
  identifier: string;
  name: string;
  description?: string;
  position?: {
    startDate?: Date;
    endDate?: Date;
    row?: number;
    column?: number;
  };
}

interface GoToOptions {
  searchType: 'task' | 'resource' | 'date' | 'id';
  dateFormat: 'absolute' | 'relative';
  caseSensitive: boolean;
  exactMatch: boolean;
}

interface GoToDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  currentView?: 'gantt' | 'task-sheet' | 'resource-sheet' | 'calendar';
  onGoTo?: (target: GoToTarget, options: GoToOptions) => void;
  onSearch?: (query: string, type: GoToOptions['searchType']) => GoToTarget[];
}

export const GoToDialog: React.FC<GoToDialogProps> = ({
  open,
  onOpenChange,
  onGoTo,
  onSearch
}) => {
  const [searchType, setSearchType] = useState<GoToOptions['searchType']>('task');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoToTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<GoToTarget | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [options, setOptions] = useState<GoToOptions>({
    searchType: 'task',
    dateFormat: 'absolute',
    caseSensitive: false,
    exactMatch: false
  });

  const { validate, errors } = useDialogValidation({
    searchQuery: {
      required: true,
      minLength: 1
    }
  });

  const validateForm = useCallback(() => {
    const formData = { searchQuery };
    return validate(formData);
  }, [searchQuery, validate]);

  const handleSearch = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSearching(true);
    try {
      const results = onSearch?.(searchQuery, searchType) || [];
      setSearchResults(results);
      setSelectedTarget(results.length > 0 ? results[0] : null);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchType, onSearch, validateForm]);

  const handleGoTo = useCallback(() => {
    if (!selectedTarget) return;
    
    onGoTo?.(selectedTarget, options);
    onOpenChange(false);
  }, [selectedTarget, options, onGoTo, onOpenChange]);

  const handleSearchTypeChange = useCallback((type: GoToOptions['searchType']) => {
    setSearchType(type);
    setOptions(prev => ({ ...prev, searchType: type }));
    setSearchQuery('');
    setSearchResults([]);
    setSelectedTarget(null);
  }, []);

  const handleTargetSelect = useCallback((target: GoToTarget) => {
    setSelectedTarget(target);
  }, []);

  const getTargetIcon = (type: GoToTarget['type']) => {
    switch (type) {
      case 'task': return <FileText className="h-4 w-4" />;
      case 'resource': return <Hash className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'id': return <MapPin className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTargetBadgeColor = (type: GoToTarget['type']) => {
    switch (type) {
      case 'task': return 'bg-slate-100 text-slate-900';
      case 'resource': return 'bg-green-100 text-green-800';
      case 'date': return 'bg-purple-100 text-purple-800';
      case 'id': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSearchPlaceholder = () => {
    switch (searchType) {
      case 'task':
        return 'Введите имя или ID задачи...';
      case 'resource':
        return 'Введите имя или ID ресурса...';
      case 'date':
        return 'Введите дату (ДД.ММ.ГГГГ)...';
      case 'id':
        return 'Введите ID задачи...';
      default:
        return 'Введите текст для поиска...';
    }
  };

  const getSearchExamples = () => {
    switch (searchType) {
      case 'task':
        return ['Разработка модуля', 'ID 123', 'Критическая задача'];
      case 'resource':
        return ['Иван Петров', 'Разработчик', 'RES-001'];
      case 'date':
        return ['01.01.2024', 'Сегодня', 'Следующая неделя'];
      case 'id':
        return ['123', 'TASK-456', '789'];
      default:
        return [];
    }
  };

  const handleConfirm = () => {
    if (selectedTarget) {
      handleGoTo();
    } else {
      handleSearch();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Перейти к"
      width="700px"
      height="600px"
      confirmLabel={selectedTarget ? 'Перейти' : 'Найти'}
      onConfirm={handleConfirm}
      isValid={validateForm() && (selectedTarget !== null || searchResults.length === 0)}
    >
      <div className="flex flex-col h-full gap-4">
        <Tabs value={searchType} onValueChange={(value) => handleSearchTypeChange(value as GoToOptions['searchType'])} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="task" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Задача
            </TabsTrigger>
            <TabsTrigger value="resource" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Ресурс
            </TabsTrigger>
            <TabsTrigger value="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Дата
            </TabsTrigger>
            <TabsTrigger value="id" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ID
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Поиск:</Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={getSearchPlaceholder()}
                  className={errors.searchQuery ? 'border-red-500' : ''}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  size="sm"
                >
                  {isSearching ? 'Поиск...' : 'Найти'}
                </Button>
              </div>
              {errors.searchQuery && (
                <p className="text-sm text-red-500">{errors.searchQuery}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Параметры поиска</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="case-sensitive"
                      checked={options.caseSensitive}
                      onChange={(e) => 
                        setOptions(prev => ({ ...prev, caseSensitive: e.target.checked }))
                      }
                    />
                    <Label htmlFor="case-sensitive" className="text-sm">С учетом регистра</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="exact-match"
                      checked={options.exactMatch}
                      onChange={(e) => 
                        setOptions(prev => ({ ...prev, exactMatch: e.target.checked }))
                      }
                    />
                    <Label htmlFor="exact-match" className="text-sm">Точное совпадение</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Примеры поиска</Label>
                <div className="flex flex-wrap gap-1">
                  {getSearchExamples().map((example, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100"
                      onClick={() => setSearchQuery(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Tabs>

        {searchResults.length > 0 && (
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Результаты поиска ({searchResults.length})
              </Label>
              {selectedTarget && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoTo}
                  className="flex items-center gap-1"
                >
                  <ArrowRight className="h-3 w-3" />
                  Перейти
                </Button>
              )}
            </div>
            <div className="h-64 border rounded-md p-2 overflow-auto">
              <div className="space-y-2">
                {searchResults.map((target) => (
                  <div
                    key={target.id}
                    className={`p-3 rounded cursor-pointer border ${
                      selectedTarget?.id === target.id 
                        ? 'bg-primary/10 border-blue-300' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleTargetSelect(target)}
                  >
                    <div className="flex items-start gap-3">
                      {getTargetIcon(target.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{target.name}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getTargetBadgeColor(target.type)}`}
                          >
                            {target.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {target.identifier}
                        </div>
                        {target.description && (
                          <div className="text-sm text-gray-400 truncate">
                            {target.description}
                          </div>
                        )}
                        {target.position && (
                          <div className="text-xs text-gray-400 mt-1">
                            {target.position.startDate && (
                              <span>Начало: {formatDate(target.position.startDate)} </span>
                            )}
                            {target.position.endDate && (
                              <span>Конец: {formatDate(target.position.endDate)}</span>
                            )}
                            {target.position.row && (
                              <span>Строка: {target.position.row}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchQuery.trim() && !isSearching && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Ничего не найдено</p>
            <p className="text-sm">Попробуйте изменить параметры поиска или запрос</p>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};

