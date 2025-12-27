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
            console.error('API request failed:', error);
            throw error;
        }
    }
    /**
     * Проверка доступности Java API
     */
    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
}
exports.JavaApiClient = JavaApiClient;
//# sourceMappingURL=JavaApiClient.js.map