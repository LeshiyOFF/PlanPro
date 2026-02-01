import * as net from 'net';

/**
 * Сервис проверки доступности сетевых портов.
 * Реализует логику проверки через создание кратковременного TCP-соединения.
 * Соответствует принципу Single Responsibility (SOLID).
 */
export class PortValidator {
  /**
   * Проверяет, свободен ли указанный порт.
   */
  public async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(false);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve(true);
      });

      server.listen(port, '127.0.0.1');
    });
  }

  /**
   * Ищет первый свободный порт в заданном диапазоне.
   */
  public async findAvailablePort(startPort: number, endPort: number): Promise<number | null> {
    for (let port = startPort; port <= endPort; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    return null;
  }
}

