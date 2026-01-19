import { logger } from '@/utils/logger';

export interface SearchQuery {
  query: string;
  type?: 'task' | 'resource' | 'project' | 'all';
  filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    tags?: string[];
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  type: 'task' | 'resource' | 'project';
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  createdDate: Date;
  modifiedDate: Date;
  relevanceScore?: number;
  highlights?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  suggestions?: string[];
  facets?: {
    statuses: { name: string; count: number }[];
    priorities: { name: string; count: number }[];
    assignees: { name: string; count: number }[];
  };
}

class SearchService {
  private static instance: SearchService;
  private readonly API_ENDPOINT = '/api/search';

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    try {
      logger.dialog('Search initiated', { query }, 'Search');

      // TODO: Replace with actual API call
      const response = await this.performSearch(query);
      
      logger.dialog('Search completed', { 
        resultsCount: response.results.length,
        total: response.total 
      }, 'Search');

      return response;
    } catch (error) {
      logger.dialogError('Search failed', error, 'Search');
      return {
        results: [],
        total: 0,
        hasMore: false,
        suggestions: []
      };
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      // TODO: Replace with actual API call
      const suggestions = await this.generateSuggestions(query, limit);
      return suggestions;
    } catch (error) {
      logger.dialogError('Suggestions failed', error, 'Search');
      return [];
    }
  }

  async getRecentSearches(limit: number = 10): Promise<string[]> {
    try {
      // TODO: Replace with actual API call
      const recentSearches = this.getStoredRecentSearches().slice(0, limit);
      return recentSearches;
    } catch (error) {
      logger.dialogError('Recent searches failed', error, 'Search');
      return [];
    }
  }

  saveRecentSearch(query: string): void {
    try {
      const recentSearches = this.getStoredRecentSearches();
      
      // Remove if already exists
      const filteredSearches = recentSearches.filter(search => search !== query);
      
      // Add to beginning
      filteredSearches.unshift(query);
      
      // Keep only last 20
      const limitedSearches = filteredSearches.slice(0, 20);
      
      localStorage.setItem('recent_searches', JSON.stringify(limitedSearches));
    } catch (error) {
      logger.dialogError('Save recent search failed', error, 'Search');
    }
  }

  clearRecentSearches(): void {
    try {
      localStorage.removeItem('recent_searches');
    } catch (error) {
      logger.dialogError('Clear recent searches failed', error, 'Search');
    }
  }

  private async performSearch(query: SearchQuery): Promise<SearchResponse> {
    // TODO: Replace with actual API implementation
    // This is a temporary implementation for development
    
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data generation based on query
    const mockResults = this.generateMockResults(query);
    
    return {
      results: mockResults,
      total: mockResults.length + Math.floor(Math.random() * 50),
      hasMore: mockResults.length < (query.limit || 20),
      suggestions: this.generateMockSuggestions(query.query),
      facets: {
        statuses: [
          { name: 'Новая', count: 15 },
          { name: 'В работе', count: 23 },
          { name: 'Завершена', count: 45 }
        ],
        priorities: [
          { name: 'Высокий', count: 8 },
          { name: 'Средний', count: 25 },
          { name: 'Низкий', count: 50 }
        ],
        assignees: [
          { name: 'Иван Петров', count: 12 },
          { name: 'Мария Иванова', count: 18 },
          { name: 'Алексей Сидоров', count: 23 }
        ]
      }
    };
  }

  private generateMockResults(query: SearchQuery): SearchResult[] {
    const mockTasks: SearchResult[] = [
      {
        id: 'task-1',
        type: 'task',
        title: 'Разработать пользовательский интерфейс',
        description: 'Создать адаптивный интерфейс для управления задачами',
        status: 'В работе',
        priority: 'Высокий',
        assignee: 'Иван Петров',
        createdDate: new Date('2024-01-15'),
        modifiedDate: new Date('2024-01-20'),
        relevanceScore: 0.95,
        highlights: ['разработать', 'интерфейс']
      },
      {
        id: 'task-2',
        type: 'task',
        title: 'Настроить CI/CD pipeline',
        description: 'Автоматизировать процесс сборки и развертывания',
        status: 'Новая',
        priority: 'Средний',
        assignee: 'Мария Иванова',
        createdDate: new Date('2024-01-10'),
        modifiedDate: new Date('2024-01-10'),
        relevanceScore: 0.87,
        highlights: ['настроить', 'pipeline']
      },
      {
        id: 'resource-1',
        type: 'resource',
        title: 'Frontend разработчик',
        description: 'Специалист по React и TypeScript',
        status: 'Доступен',
        priority: 'Высокий',
        assignee: 'Алексей Сидоров',
        createdDate: new Date('2024-01-05'),
        modifiedDate: new Date('2024-01-18'),
        relevanceScore: 0.78,
        highlights: ['frontend', 'разработчик']
      },
      {
        id: 'project-1',
        type: 'project',
        title: 'Система управления проектами',
        description: 'Веб-приложение для управления задачами и ресурсами',
        status: 'Активен',
        priority: 'Высокий',
        createdDate: new Date('2024-01-01'),
        modifiedDate: new Date('2024-01-25'),
        relevanceScore: 0.92,
        highlights: ['проектами', 'управления']
      }
    ];

    // Filter by type if specified
    let filteredResults = mockTasks;
    if (query.type && query.type !== 'all') {
      filteredResults = mockTasks.filter(result => result.type === query.type);
    }

    // Filter by query text
    if (query.query) {
      const queryLower = query.query.toLowerCase();
      filteredResults = filteredResults.filter(result =>
        result.title.toLowerCase().includes(queryLower) ||
        (result.description && result.description.toLowerCase().includes(queryLower))
      );
    }

    // Sort by relevance
    filteredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // Apply limit
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    return filteredResults.slice(offset, offset + limit);
  }

  private generateMockSuggestions(query: string): string[] {
    const allSuggestions = [
      'разработка интерфейса',
      'управление задачами',
      'CI/CD настройка',
      'frontend разработка',
      'проект менеджмент',
      'реакт компоненты',
      'typescript',
      'автоматизация',
      'deploy процесс',
      'user interface'
    ];

    return allSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  private async generateSuggestions(query: string, limit: number): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.generateMockSuggestions(query).slice(0, limit);
  }

  private getStoredRecentSearches(): string[] {
    try {
      const stored = localStorage.getItem('recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export { SearchService };
export const searchService = SearchService.getInstance();
