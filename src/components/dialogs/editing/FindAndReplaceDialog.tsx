import React, { useState, useCallback } from 'react';
import { BaseDialog } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // temporarily removed
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area'; // temporarily removed
import { Search, Replace, FileText, Calendar, Users } from 'lucide-react';
import { useDialogValidation } from '../hooks/useDialogValidation';

interface SearchScope {
  allFields: boolean;
  taskNames: boolean;
  taskNotes: boolean;
  resourceNames: boolean;
  resourceNotes: boolean;
  projectFields: boolean;
}

interface FindAndReplaceOptions {
  matchCase: boolean;
  matchWholeWord: boolean;
  useWildcards: boolean;
  searchUp: boolean;
  scope: SearchScope;
}

interface SearchResult {
  id: string;
  type: 'task' | 'resource' | 'project';
  name: string;
  field: string;
  value: string;
  lineNumber: number;
}

interface FindAndReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialFindText?: string;
  projectId?: string;
  onFind?: (criteria: FindAndReplaceOptions) => SearchResult[];
  onReplace?: (findText: string, replaceText: string, criteria: FindAndReplaceOptions) => number;
  onReplaceAll?: (findText: string, replaceText: string, criteria: FindAndReplaceOptions) => number;
}

export const FindAndReplaceDialog: React.FC<FindAndReplaceDialogProps> = ({
  open,
  onOpenChange,
  initialFindText = '',
  onFind,
  onReplace,
  onReplaceAll
}) => {
  const [activeTab, setActiveTab] = useState<'find' | 'replace'>('find');
  const [findText, setFindText] = useState(initialFindText);
  const [replaceText, setReplaceText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  
  const [options, setOptions] = useState<FindAndReplaceOptions>({
    matchCase: false,
    matchWholeWord: false,
    useWildcards: false,
    searchUp: false,
    scope: {
      allFields: true,
      taskNames: true,
      taskNotes: false,
      resourceNames: false,
      resourceNotes: false,
      projectFields: false
    }
  });

  const { validate, errors } = useDialogValidation({
    findText: {
      required: activeTab === 'find',
      minLength: activeTab === 'find' ? 1 : undefined
    },
    replaceText: {
      required: activeTab === 'replace'
    }
  });

  const validateForm = useCallback(() => {
    const formData = { findText, replaceText };
    return validate(formData);
  }, [findText, replaceText, validate]);

  const handleFind = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSearching(true);
    try {
      const results = onFind?.(options) || [];
      setSearchResults(results);
      setCurrentResultIndex(results.length > 0 ? 0 : -1);
    } finally {
      setIsSearching(false);
    }
  }, [findText, options, onFind, validateForm]);

  const handleFindNext = useCallback(() => {
    if (searchResults.length === 0) {
      handleFind();
    } else {
      setCurrentResultIndex(prev => (prev + 1) % searchResults.length);
    }
  }, [searchResults, handleFind]);

  const handleFindPrevious = useCallback(() => {
    if (searchResults.length === 0) {
      handleFind();
    } else {
      setCurrentResultIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    }
  }, [searchResults, handleFind]);

  const handleReplace = useCallback(async () => {
    if (!validateForm() || currentResultIndex === -1) return;
    
    try {
      const replaceCount = onReplace?.(findText, replaceText, options) || 0;
      if (replaceCount > 0) {
        // Refresh results after replacement
        handleFind();
      }
    } catch (error) {
      console.error('Replace failed:', error);
    }
  }, [findText, replaceText, options, currentResultIndex, onReplace, handleFind, validateForm]);

  const handleReplaceAll = useCallback(async () => {
    if (!validateForm()) return;
    
    try {
      const replaceCount = onReplaceAll?.(findText, replaceText, options) || 0;
      if (replaceCount > 0) {
        // Clear results after replace all
        setSearchResults([]);
        setCurrentResultIndex(-1);
      }
    } catch (error) {
      console.error('Replace all failed:', error);
    }
  }, [findText, replaceText, options, onReplaceAll, validateForm]);

  const handleScopeChange = useCallback((field: keyof SearchScope, checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      scope: {
        ...prev.scope,
        [field]: checked
      }
    }));
  }, []);

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return <FileText className="h-4 w-4" />;
      case 'resource': return <Users className="h-4 w-4" />;
      case 'project': return <Calendar className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'find') {
      handleFind();
    } else {
      handleReplaceAll();
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Найти и заменить"
      width="800px"
      height="600px"
      confirmLabel={activeTab === 'find' ? 'Найти' : 'Заменить все'}
      onConfirm={handleConfirm}
      isValid={validateForm()}
    >
      <div className="flex flex-col h-full gap-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'find' | 'replace')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="find" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Найти
            </TabsTrigger>
            <TabsTrigger value="replace" className="flex items-center gap-2">
              <Replace className="h-4 w-4" />
              Заменить
            </TabsTrigger>
          </TabsList>

          <TabsContent value="find" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="find-text">Найти:</Label>
                <Input
                  id="find-text"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Введите текст для поиска..."
                  className={errors.findText ? 'border-red-500' : ''}
                />
                {errors.findText && (
                  <p className="text-sm text-red-500">{errors.findText}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFindNext}
                  disabled={isSearching || !findText.trim()}
                >
                  Найти далее
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFindPrevious}
                  disabled={isSearching || !findText.trim()}
                >
                  Найти ранее
                </Button>
                <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                  {searchResults.length > 0 && (
                    <>
                      Результат: {currentResultIndex + 1} из {searchResults.length}
                    </>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="replace" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="find-text-replace">Найти:</Label>
                <Input
                  id="find-text-replace"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  placeholder="Введите текст для поиска..."
                  className={errors.findText ? 'border-red-500' : ''}
                />
                {errors.findText && (
                  <p className="text-sm text-red-500">{errors.findText}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="replace-text">Заменить на:</Label>
                <Input
                  id="replace-text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  placeholder="Введите текст для замены..."
                  className={errors.replaceText ? 'border-red-500' : ''}
                />
                {errors.replaceText && (
                  <p className="text-sm text-red-500">{errors.replaceText}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFindNext}
                  disabled={isSearching || !findText.trim()}
                >
                  Найти далее
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplace}
                  disabled={!findText.trim() || !replaceText.trim() || currentResultIndex === -1}
                >
                  Заменить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReplaceAll}
                  disabled={!findText.trim() || !replaceText.trim()}
                >
                  Заменить все
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Параметры поиска</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="match-case"
                  checked={options.matchCase}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, matchCase: !!checked }))
                  }
                />
                <Label htmlFor="match-case" className="text-sm">С учетом регистра</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whole-word"
                  checked={options.matchWholeWord}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, matchWholeWord: !!checked }))
                  }
                />
                <Label htmlFor="whole-word" className="text-sm">Слово целиком</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wildcards"
                  checked={options.useWildcards}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, useWildcards: !!checked }))
                  }
                />
                <Label htmlFor="wildcards" className="text-sm">Подстановочные знаки</Label>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Область поиска</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-fields"
                  checked={options.scope.allFields}
                  onCheckedChange={(checked) => handleScopeChange('allFields', !!checked)}
                />
                <Label htmlFor="all-fields" className="text-sm">Все поля</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="task-names"
                  checked={options.scope.taskNames}
                  onCheckedChange={(checked) => handleScopeChange('taskNames', !!checked)}
                />
                <Label htmlFor="task-names" className="text-sm">Имена задач</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="task-notes"
                  checked={options.scope.taskNotes}
                  onCheckedChange={(checked) => handleScopeChange('taskNotes', !!checked)}
                />
                <Label htmlFor="task-notes" className="text-sm">Заметки задач</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resource-names"
                  checked={options.scope.resourceNames}
                  onCheckedChange={(checked) => handleScopeChange('resourceNames', !!checked)}
                />
                <Label htmlFor="resource-names" className="text-sm">Имена ресурсов</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="resource-notes"
                  checked={options.scope.resourceNotes}
                  onCheckedChange={(checked) => handleScopeChange('resourceNotes', !!checked)}
                />
                <Label htmlFor="resource-notes" className="text-sm">Заметки ресурсов</Label>
              </div>
            </div>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="flex-1 space-y-2">
            <Label className="text-sm font-medium">Результаты поиска ({searchResults.length})</Label>
            <div className="h-48 border rounded-md p-2 overflow-auto">
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={result.id}
                    className={`p-2 rounded cursor-pointer text-sm ${
                      index === currentResultIndex ? 'bg-slate-100 border-blue-300 border' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentResultIndex(index)}
                  >
                    <div className="flex items-start gap-2">
                      {getResultIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.name}</div>
                        <div className="text-gray-500 truncate">
                          {result.field}: {result.value}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};

