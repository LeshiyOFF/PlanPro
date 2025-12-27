/**
 * API клиент для взаимодействия с Java backend
 * Отвечает только за выполнение HTTP запросов к Java API
 */
export declare class JavaApiClient {
    private readonly baseUrl;
    constructor(port: number);
    /**
     * Выполнение HTTP запроса к Java API
     */
    makeRequest(command: string, args?: any[]): Promise<any>;
    /**
     * Проверка доступности Java API
     */
    checkConnection(): Promise<boolean>;
}
