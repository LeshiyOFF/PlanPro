/**
 * Типы для SearchService
 */

export interface SearchQuery {
  query: string;
  type?: 'task' | 'resource' | 'project' | 'all';
  filters?: SearchFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  dateRange?: { start: Date; end: Date };
  tags?: string[];
}

/** Единый тип результата поиска для SearchService, FindDialog, AdvancedSearchDialog и SearchResults */
export interface SearchResult {
  id: string;
  type: 'task' | 'resource' | 'project' | 'document' | 'note';
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  /** Для совместимости с AdvancedSearchDialog (строка даты) */
  modified?: string;
  relevanceScore?: number;
  /** Для совместимости с AdvancedSearchDialog */
  relevance?: number;
  highlights?: string[];
  /** Путь/хлебные крошки для отображения в SearchResults */
  path?: string;
  /** Контекстная строка для отображения в SearchResults */
  context?: string;
  /** Доп. данные для отображения в SearchResults */
  metadata?: Record<string, string | number | boolean>;
}

export interface SearchFacets {
  statuses: { name: string; count: number }[];
  priorities: { name: string; count: number }[];
  assignees: { name: string; count: number }[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  suggestions?: string[];
  facets?: SearchFacets;
}
