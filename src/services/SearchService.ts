import { logger } from '@/utils/logger';
import { useProjectStore } from '@/store/projectStore';
import type { Task } from '@/store/project/interfaces';
import type { Resource } from '@/types/resource-types';
import type { SearchQuery, SearchResult, SearchResponse, SearchFacets } from '@/types/search-types';

export type { SearchQuery, SearchResult, SearchResponse, SearchFacets };

/**
 * Сервис поиска по проектным данным
 * Интегрирован с projectStore для реального поиска
 */
class SearchService {
  private static instance: SearchService;
  private readonly RECENT_SEARCHES_KEY = 'recent_searches';
  private readonly MAX_RECENT_SEARCHES = 20;

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    try {
      logger.dialog('Search initiated', { query: query.query }, 'Search');
      const response = this.performSearch(query);
      logger.dialog('Search completed', { resultsCount: response.results.length, total: response.total }, 'Search');
      return response;
    } catch (error) {
      logger.dialogError('Search failed', error instanceof Error ? error : String(error), 'Search');
      return { results: [], total: 0, hasMore: false, suggestions: [] };
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      return this.generateSuggestions(query, limit);
    } catch (error) {
      logger.dialogError('Suggestions failed', error instanceof Error ? error : String(error), 'Search');
      return [];
    }
  }

  async getRecentSearches(limit: number = 10): Promise<string[]> {
    try {
      return this.getStoredRecentSearches().slice(0, limit);
    } catch (error) {
      logger.dialogError('Recent searches failed', error instanceof Error ? error : String(error), 'Search');
      return [];
    }
  }

  saveRecentSearch(query: string): void {
    try {
      const searches = this.getStoredRecentSearches().filter(s => s !== query);
      searches.unshift(query);
      localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, this.MAX_RECENT_SEARCHES)));
    } catch (error) {
      logger.dialogError('Save recent search failed', error instanceof Error ? error : String(error), 'Search');
    }
  }

  clearRecentSearches(): void {
    try {
      localStorage.removeItem(this.RECENT_SEARCHES_KEY);
    } catch (error) {
      logger.dialogError('Clear recent searches failed', error instanceof Error ? error : String(error), 'Search');
    }
  }

  private performSearch(query: SearchQuery): SearchResponse {
    const store = useProjectStore.getState();
    const results: SearchResult[] = [];
    const queryLower = query.query.toLowerCase();

    if (query.type === 'all' || query.type === 'task' || !query.type) {
      results.push(...this.searchTasks(store.tasks, queryLower));
    }
    if (query.type === 'all' || query.type === 'resource' || !query.type) {
      results.push(...this.searchResources(store.resources, queryLower));
    }

    results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    return {
      results: results.slice(offset, offset + limit),
      total: results.length,
      hasMore: offset + limit < results.length,
      suggestions: this.generateSuggestions(query.query, 5),
      facets: this.calculateFacets(results)
    };
  }

  private searchTasks(tasks: Task[], query: string): SearchResult[] {
    return tasks
      .filter(task => task.name.toLowerCase().includes(query) || (task.notes?.toLowerCase().includes(query)))
      .map(task => ({
        id: task.id,
        type: 'task' as const,
        title: task.name,
        description: task.notes || '',
        status: task.progress === 1 ? 'Завершена' : task.progress > 0 ? 'В работе' : 'Новая',
        createdDate: task.startDate,
        modifiedDate: task.endDate,
        relevanceScore: this.calculateRelevance(task.name, query),
        highlights: this.extractHighlights(task.name, query)
      }));
  }

  private searchResources(resources: Resource[], query: string): SearchResult[] {
    return resources
      .filter(resource => resource.name.toLowerCase().includes(query))
      .map(resource => ({
        id: resource.id,
        type: 'resource' as const,
        title: resource.name,
        description: resource.type || '',
        status: 'Активен',
        createdDate: new Date(),
        modifiedDate: new Date(),
        relevanceScore: this.calculateRelevance(resource.name, query),
        highlights: this.extractHighlights(resource.name, query)
      }));
  }

  private calculateRelevance(text: string, query: string): number {
    const textLower = text.toLowerCase();
    if (textLower === query) return 1.0;
    if (textLower.startsWith(query)) return 0.9;
    return textLower.includes(query) ? 0.7 : 0.5;
  }

  private extractHighlights(text: string, query: string): string[] {
    return text.match(new RegExp(`(${query})`, 'gi')) || [];
  }

  private generateSuggestions(query: string, limit: number): string[] {
    const store = useProjectStore.getState();
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    store.tasks.forEach(task => {
      if (task.name.toLowerCase().includes(queryLower)) suggestions.add(task.name);
    });
    store.resources.forEach(resource => {
      if (resource.name.toLowerCase().includes(queryLower)) suggestions.add(resource.name);
    });

    return Array.from(suggestions).slice(0, limit);
  }

  private calculateFacets(results: SearchResult[]): SearchFacets {
    const statuses = new Map<string, number>();
    const priorities = new Map<string, number>();
    const assignees = new Map<string, number>();

    results.forEach(result => {
      if (result.status) statuses.set(result.status, (statuses.get(result.status) || 0) + 1);
      if (result.priority) priorities.set(result.priority, (priorities.get(result.priority) || 0) + 1);
      if (result.assignee) assignees.set(result.assignee, (assignees.get(result.assignee) || 0) + 1);
    });

    return {
      statuses: Array.from(statuses.entries()).map(([name, count]) => ({ name, count })),
      priorities: Array.from(priorities.entries()).map(([name, count]) => ({ name, count })),
      assignees: Array.from(assignees.entries()).map(([name, count]) => ({ name, count }))
    };
  }

  private getStoredRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem(this.RECENT_SEARCHES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export { SearchService };
export const searchService = SearchService.getInstance();
