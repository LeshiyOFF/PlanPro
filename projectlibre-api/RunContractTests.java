/**
 * Упрощенный запуск контрактных тестов без JUnit launcher
 */
public class RunContractTests {
    public static void main(String[] args) {
        System.out.println("=== Запуск контрактных тестов ProjectLibre API ===");
        
        try {
            // Создаем экземпляр теста
            com.projectlibre.api.contract.SimpleContractTest test = new com.projectlibre.api.contract.SimpleContractTest();
            
            System.out.println("Выполняем тесты контрактов...");
            
            // Запускаем каждый метод теста
            test.testGetProjectsContract();
            System.out.println("✓ testGetProjectsContract пройден");
            
            test.testCreateProjectContract();
            System.out.println("✓ testCreateProjectContract пройден");
            
            System.out.println("\n=== Все контрактные тесты успешно пройдены! ===");
            System.out.println("Контрактные тесты (Pact) реализованы и работают корректно.");
            
        } catch (Exception e) {
            System.err.println("❌ Ошибка при выполнении контрактных тестов: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}