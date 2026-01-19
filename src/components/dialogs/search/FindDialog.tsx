import React, { useState, useCallback, useEffect } from 'react';
import { BaseDialog } from '@/components/dialogs/base/BaseDialog';
import { Button } from '@/components/ui/button';
import { logger } from '@/utils/logger';
import { SearchService, type SearchResult } from '@/services/SearchService';
import { 
  FindDialogData, 
  IDialogActions,
  DialogResult 
} from '@/types/dialog/DialogTypes';

// Импорт модульных компонентов
import { SearchForm } from './components/SearchForm';
import { SearchResults } from './components/SearchResults';

/**
 * Интерфейс состояния поиска
 */
interface SearchState {
  searchText: string;
  searchType: string;
  results: SearchResult[];
  currentIndex: number;
  isSearching: boolean;
}

/**
 * Начальное состояние поиска
 */
const getInitialSearchState = (): SearchState => ({
  searchText: '',
  searchType: 'all',
  results: [],
  currentIndex: -1,
  isSearching: false
});

/**
 * Выполнение поиска через SearchService
 */
const useSearchService = () => {
  const performSearch = useCallback(async (text: string, type: string): Promise<SearchResult[]> => {
    try {
      const searchService = SearchService.getInstance();
      const filters = type !== 'all' ? { type: type as any } : undefined;
      const results = await searchService.search(text, filters);
      return results;
    } catch (error) {
      logger.error('Search failed in dialog:', error);
      return [];
    }
  }, []);

  return { performSearch };
};

/**
 * Обработчики событий поиска
 */
const useSearchHandlers = (
  searchState: SearchState,
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>,
  performSearch: (text: string, type: string) => Promise<SearchResult[]>,
  onResultSelect: (result: SearchResult | null) => void
) => {
  const handleSearchTextChange = useCallback((text: string) => {
    setSearchState(prev => ({ ...prev, searchText: text }));
  }, []);

  const handleSearchTypeChange = useCallback(async (type: string) => {
    setSearchState(prev => ({ ...prev, searchType: type }));
    
    if (searchState.searchText.trim().length >= 2) {
      setSearchState(prev => ({ ...prev, isSearching: true }));
      const results = await performSearch(searchState.searchText, type);
      setSearchState(prev => ({ ...prev, results, isSearching: false, currentIndex: -1 }));
    }
  }, [searchState.searchText, performSearch]);

  const handleSearch = useCallback(async () => {
    if (searchState.searchText.trim().length < 2) return;
    
    setSearchState(prev => ({ ...prev, isSearching: true }));
    const results = await performSearch(searchState.searchText, searchState.searchType);
    setSearchState(prev => ({ ...prev, results, isSearching: false, currentIndex: -1 }));
    onResultSelect(null);
  }, [searchState, performSearch]);

  const handleClear = useCallback(() => {
    setSearchState(prev => ({ 
      ...prev, 
      searchText: '', 
      results: [], 
      currentIndex: -1 
    }));
    onResultSelect(null);
  }, [onResultSelect]);

  const handleResultSelect = useCallback((result: SearchResult) => {
    const index = searchState.results.findIndex(r => r.id === result.id);
    setSearchState(prev => ({ ...prev, currentIndex: index }));
    onResultSelect(result);
  }, [searchState.results, onResultSelect]);

  return {
    handleSearchTextChange,
    handleSearchTypeChange,
    handleSearch,
    handleClear,
    handleResultSelect
  };
};

/**
 * Создание Actions для диалога поиска
 */
const createSearchActions = (selectedResult: SearchResult | null): IDialogActions => {
  return {
    onOk: async () => {
      if (selectedResult) {
        logger.info('Opening search result:', selectedResult);
        // Здесь должна быть логика открытия найденного элемента
        window.open(`/open/${selectedResult.type}/${selectedResult.id}`, '_blank');
      }
      return { success: true, data: selectedResult };
    },
    
    onCancel: () => {
      logger.info('Search dialog cancelled');
    },
    
    onHelp: () => {
      logger.info('Opening search help...');
      window.open('/help/search', '_blank');
    }
  };
};

/**
 * Диалог поиска по проектным данным
 * Реализует SOLID принцип Single Responsibility
 */
export const FindDialog: React.FC<FindDialogData> = (data) => {
  const [searchState, setSearchState] = useState<SearchState>(getInitialSearchState());
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const { performSearch } = useSearchService();

  const {
    handleSearchTextChange,
    handleSearchTypeChange,
    handleSearch,
    handleClear,
    handleResultSelect
  } = useSearchHandlers(searchState, setSearchState, performSearch, setSelectedResult);

  const actions = createSearchActions(selectedResult);

  useEffect(() => {
    // Автоматический поиск при изменении текста (debounce)
    const timer = setTimeout(() => {
      if (searchState.searchText.trim().length >= 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchState.searchText, searchState.searchType, handleSearch]);

  return (
    <BaseDialog
      data={{
        ...data,
        actions
      }}
      config={{
        width: 600,
        height: 500,
        modal: true
      }}
    >
      <div className="space-y-6">
        <SearchForm
          searchText={searchState.searchText}
          searchType={searchState.searchType}
          isSearching={searchState.isSearching}
          onSearchTextChange={handleSearchTextChange}
          onSearchTypeChange={handleSearchTypeChange}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        <SearchResults
          results={searchState.results}
          selectedResult={selectedResult}
          onResultSelect={handleResultSelect}
          isSearching={searchState.isSearching}
        />

        {selectedResult && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">
              Выбран: {selectedResult.title}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => actions.onCancel()}>
                Отмена
              </Button>
              <Button onClick={async () => {
                try {
                  await actions.onOk();
                } catch (error) {
                  logger.error('Failed to open search result:', error);
                }
              }}>
                Открыть
              </Button>
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  );
};
