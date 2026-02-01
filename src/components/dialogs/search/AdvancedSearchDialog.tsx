import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SearchResult } from '@/types/search-types';
import { SearchService } from '@/services/SearchService';

export interface SearchScope {
  id: string;
  name: string;
  fields: string[];
}

export interface AdvancedSearchDialogProps extends Omit<BaseDialogProps, 'children'> {
  searchScopes?: SearchScope[];
  recentSearches?: string[];
  savedSearches?: Array<{
    id: string;
    name: string;
    query: string;
    scope: string[];
    filters: Record<string, string | number | boolean | string[]>;
  }>;
  onSearch?: (query: string, scope: string[], filters: Record<string, string | number | boolean | string[]>) => void;
  onSaveSearch?: (name: string, query: string, scope: string[], filters: Record<string, string | number | boolean | string[]>) => void;
  onOpenResult?: (result: SearchResult) => void;
}

const SEARCH_OPERATORS = [
  { value: 'any', label: 'Any words' },
  { value: 'all', label: 'All words' },
  { value: 'exact', label: 'Exact phrase' },
  { value: 'wildcard', label: 'Wildcard (*)' }
];

const DATE_FILTERS = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'This year' },
  { value: 'custom', label: 'Custom range' }
];

export const AdvancedSearchDialog: React.FC<AdvancedSearchDialogProps> = ({
  searchScopes = [],
  recentSearches = [],
  savedSearches = [],
  onSearch,
  onSaveSearch,
  onOpenResult,
  onClose,
  ...props
}) => {
  const [activeTab, setActiveTab] = React.useState('search');
  const [query, setQuery] = React.useState('');
  const [searchOperator, setSearchOperator] = React.useState('any');
  const [selectedScopes, setSelectedScopes] = React.useState<string[]>([]);
  const [caseSensitive, setCaseSensitive] = React.useState(false);
  const [includeContent, setIncludeContent] = React.useState(true);
  const [dateFilter, setDateFilter] = React.useState('any');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  // Saved search state
  const [saveSearchName, setSaveSearchName] = React.useState('');
  const [saveSearchDescription, setSaveSearchDescription] = React.useState('');

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId)
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    );
  };

  const handleSearch = async () => {
    if (!query.trim() || selectedScopes.length === 0) return;

    setIsSearching(true);
    try {
      const searchService = SearchService.getInstance();
      const searchType =
        selectedScopes.includes('task') && selectedScopes.includes('resource')
          ? 'all'
          : selectedScopes.includes('task')
            ? 'task'
            : selectedScopes.includes('resource')
              ? 'resource'
              : 'all';
      const response = await searchService.search({
        query: query.trim(),
        type: searchType,
        limit: 50,
        offset: 0
      });
      const results: SearchResult[] = response.results.map(r => ({
        ...r,
        modified: r.modifiedDate instanceof Date ? r.modifiedDate.toISOString().slice(0, 10) : r.modified,
        relevance: r.relevanceScore ?? r.relevance
      }));
      setSearchResults(results);
      searchService.saveRecentSearch(query.trim());
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
    onSearch?.(query, selectedScopes, {
      searchOperator,
      caseSensitive,
      includeContent,
      dateFilter,
      customStartDate,
      customEndDate
    });
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim() && query.trim()) {
      onSaveSearch?.(saveSearchName.trim(), query, selectedScopes, {
        searchOperator,
        caseSensitive,
        includeContent,
        dateFilter
      });
      setSaveSearchName('');
      setSaveSearchDescription('');
      setActiveTab('saved');
    }
  };

  const handleLoadSavedSearch = (savedSearch: { query: string; scope: string[] }) => {
    setQuery(savedSearch.query);
    setSelectedScopes(savedSearch.scope);
    setActiveTab('search');
  };

  const handleResultClick = (result: SearchResult) => {
    onOpenResult?.(result);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-slate-100 text-slate-900';
      case 'resource': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-yellow-100 text-yellow-800';
      case 'note': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return 'text-green-600';
    if (relevance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const { title: _omitTitle, ...dialogProps } = props;
  return (
    <BaseDialog
      {...dialogProps}
      title="Advanced Search"
      size="fullscreen"
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {searchResults.length} result(s) found
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSearch} disabled={!query.trim() || selectedScopes.length === 0}>
              Search
            </Button>
          </div>
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          {/* Query Input */}
          <div className="space-y-3">
            <Label htmlFor="query">Search Query</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search terms..."
              rows={3}
            />
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="caseSensitive"
                  checked={caseSensitive}
                  onCheckedChange={(checked) => setCaseSensitive(checked === true)}
                />
                <Label htmlFor="caseSensitive">Case sensitive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeContent"
                  checked={includeContent}
                  onCheckedChange={(checked) => setIncludeContent(checked === true)}
                />
                <Label htmlFor="includeContent">Search content</Label>
              </div>
            </div>
          </div>

          {/* Search Options */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Search Operator</Label>
              <Select
                value={searchOperator}
                onValueChange={setSearchOperator}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_OPERATORS.map(operator => (
                    <SelectItem key={operator.value} value={operator.value}>
                      {operator.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Date Filter</Label>
              <Select
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Search Scopes */}
          <div className="space-y-3">
            <Label>Search In</Label>
            <div className="grid grid-cols-2 gap-4">
              {searchScopes.map(scope => (
                <div key={scope.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedScopes.includes(scope.id)}
                    onCheckedChange={() => handleScopeToggle(scope.id)}
                  />
                  <div>
                    <div className="font-medium">{scope.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {scope.fields.length} fields
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Recent Searches Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Label>Recent Searches</Label>
          {recentSearches.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <div className="text-lg font-medium text-muted-foreground">
                No recent searches
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    setQuery(search);
                    setActiveTab('search');
                  }}
                >
                  <div className="font-medium">{search}</div>
                  <div className="text-sm text-muted-foreground">
                    Search term from recent history
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Saved Searches Tab */}
        <TabsContent value="saved" className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Saved Searches</Label>
            <Button 
              variant="outline"
              onClick={() => setActiveTab('search')}
            >
              Save Current
            </Button>
          </div>

          {savedSearches.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No saved searches
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Save your frequently used search queries
              </div>
              <Button onClick={() => setActiveTab('search')}>
                Create First Search
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {savedSearches.map(search => (
                <div
                  key={search.id}
                  className="border rounded-lg p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{search.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {search.query}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {search.scope.length} scope(s)
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadSavedSearch(search)}
                      >
                        Load
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Search Form */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3">Save Current Search</Label>
            <div className="space-y-3">
              <Input
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder="Search name..."
              />
              <Input
                value={saveSearchDescription}
                onChange={(e) => setSaveSearchDescription(e.target.value)}
                placeholder="Optional description..."
              />
              <Button 
                onClick={handleSaveSearch} 
                disabled={!saveSearchName.trim() || !query.trim()}
              >
                Save Search
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          <Label>Search Results</Label>
          
          {isSearching ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium text-muted-foreground">
                Searching...
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/30">
              <div className="text-lg font-medium text-muted-foreground">
                No results found
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Try modifying your search terms or filters
              </div>
              <Button onClick={() => setActiveTab('search')}>
                Modify Search
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map(result => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(result.type)}>
                        {result.type}
                      </Badge>
                      <span className="font-medium">{result.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Relevance: 
                      <span className={`ml-1 font-medium ${getRelevanceColor(result.relevance ?? result.relevanceScore ?? 0)}`}>
                        {(result.relevance ?? result.relevanceScore ?? 0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {result.description}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div>
                      Path: {result.path}
                    </div>
                    <div>
                      Modified: {result.modified}
                    </div>
                  </div>

                  {result.highlights && result.highlights.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {result.highlights.map((highlight, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </BaseDialog>
  );
};

