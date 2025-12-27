"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaApiClient = void 0;
/**
 * API клиент для взаимодействия с Java backend
 * Отвечает только за выполнение HTTP запросов к Java API
 */
class JavaApiClient {
    baseUrl;
    constructor(port) {
        this.baseUrl = `http://localhost:${port}`;
    }
    /**
     * Выполнение HTTP запроса к Java API
     */
    async makeRequest(command, args = []) {
        const url = `${this.baseUrl}/api/${command}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ args })
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new Error(`Failed to make API request: ${error}`);
        }
    }
    /**
     * Проверка доступности API
     */
    async isApiAvailable() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET'
            });
            return response.ok;
        }
        catch {
            return false;
        }
    }
}
exports.JavaApiClient = JavaApiClient;
//# sourceMappingURL=JavaApiClient.js.map