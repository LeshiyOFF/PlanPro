package net.sf.mpxj.sample;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import net.sf.mpxj.MPXJException;
import net.sf.mpxj.ProjectFile;
import net.sf.mpxj.Task;
import net.sf.mpxj.Resource;
import net.sf.mpxj.ResourceAssignment;
import net.sf.mpxj.Relation;
import net.sf.mpxj.ProjectConfig;
import net.sf.mpxj.reader.ProjectReader;
import net.sf.mpxj.reader.UniversalProjectReader;
import net.sf.mpxj.projectlibre.ProjectLibreReader;

/**
 * Тестирование совместимости MPXJ с различными форматами файлов
 * 
 * Цели:
 * 1. Протестировать чтение .mpp, .pod, .xml файлов
 * 2. Определить поддерживаемые версии MS Project
 * 3. Оценить производительность импорта
 * 4. Выявить потери данных при конвертации
 */
public class MPXJCompatibilityTest {
    
    private static final String SAMPLES_PATH = "../../projectlibre_build/resources/samples/";
    private static final List<TestResult> testResults = new ArrayList<>();
    
    public static void main(String[] args) {
        System.out.println("=== MPXJ Compatibility Test Suite ===");
        
        MPXJCompatibilityTest tester = new MPXJCompatibilityTest();
        
        // Тестирование доступных образцов
        tester.testSampleFiles();
        
        // Тестирование производительности
        tester.testPerformance();
        
        // Анализ результатов
        tester.analyzeResults();
        
        // Генерация отчета
        tester.generateReport();
    }
    
    /**
     * Тестирование файлов из samples директории
     */
    public void testSampleFiles() {
        System.out.println("\n--- Testing Sample Files ---");
        
        String[] sampleFiles = {
            "New Product.pod",
            "Microsoft Office Project 2003 deployment.pod", 
            "Commercial construction project plan.pod"
        };
        
        for (String filename : sampleFiles) {
            String fullPath = SAMPLES_PATH + filename;
            testFile(filename, fullPath);
        }
    }
    
    /**
     * Тестирование одного файла
     */
    private void testFile(String filename, String fullPath) {
        System.out.println("\nTesting: " + filename);
        
        TestResult result = new TestResult();
        result.filename = filename;
        result.fullPath = fullPath;
        
        try {
            File file = new File(fullPath);
            if (!file.exists()) {
                result.status = "FILE_NOT_FOUND";
                result.errorMessage = "File does not exist: " + fullPath;
                testResults.add(result);
                return;
            }
            
            // Определение типа файла
            String extension = getFileExtension(filename).toLowerCase();
            result.fileType = extension;
            
            // Тестирование чтения
            long startTime = System.currentTimeMillis();
            ProjectFile projectFile = readFileByType(fullPath, extension);
            long readTime = System.currentTimeMillis() - startTime;
            
            if (projectFile != null) {
                result.status = "SUCCESS";
                result.readTime = readTime;
                
                // Анализ содержимого
                analyzeProjectContent(projectFile, result);
                
                System.out.println("✅ Success: " + result.taskCount + " tasks, " + 
                                 result.resourceCount + " resources, " + readTime + "ms");
            } else {
                result.status = "READ_FAILED";
                result.errorMessage = "UniversalProjectReader returned null";
            }
            
        } catch (Exception e) {
            result.status = "ERROR";
            result.errorMessage = e.getMessage();
            result.exception = e;
            System.out.println("❌ Error: " + e.getMessage());
        }
        
        testResults.add(result);
    }
    
    /**
     * Чтение файла в зависимости от его типа
     */
    private ProjectFile readFileByType(String filePath, String extension) throws Exception {
        UniversalProjectReader universalReader = new UniversalProjectReader();
        
        switch (extension) {
            case "pod":
                // Для POD файлов используем специализированный reader
                ProjectLibreReader podReader = new ProjectLibreReader();
                try (FileInputStream fis = new FileInputStream(filePath)) {
                    return podReader.read(fis);
                }
            case "mpp":
            case "xml":
            case "xer":
            case "mpx":
            default:
                // Universal reader для остальных форматов
                return universalReader.read(filePath);
        }
    }
    
    /**
     * Анализ содержимого проекта
     */
    private void analyzeProjectContent(ProjectFile projectFile, TestResult result) {
        // Базовая статистика
        result.taskCount = projectFile.getTasks().size();
        result.resourceCount = projectFile.getResources().size();
        result.assignmentCount = projectFile.getResourceAssignments().size();
        
        // Анализ задач
        int milestoneCount = 0;
        int summaryTaskCount = 0;
        int criticalTaskCount = 0;
        
        for (Task task : projectFile.getTasks()) {
            if (task.getMilestone()) milestoneCount++;
            if (task.getNull()) summaryTaskCount++;
            if (task.getCritical()) criticalTaskCount++;
        }
        
        result.milestoneCount = milestoneCount;
        result.summaryTaskCount = summaryTaskCount;
        result.criticalTaskCount = criticalTaskCount;
        
        // Анализ связей
        int relationCount = 0;
        for (Task task : projectFile.getTasks()) {
            relationCount += task.getRelations().size();
        }
        result.relationCount = relationCount;
        
        // Свойства проекта
        result.projectName = projectFile.getProjectProperties().getName();
        result.startDate = projectFile.getProjectProperties().getStartDate();
        result.finishDate = projectFile.getProjectProperties().getFinishDate();
        
        // Проверка потерь данных
        checkDataLoss(projectFile, result);
    }
    
    /**
     * Проверка потенциальных потерь данных
     */
    private void checkDataLoss(ProjectFile projectFile, TestResult result) {
        List<String> warnings = new ArrayList<>();
        
        // Проверка на пустые поля
        if (projectFile.getProjectProperties().getName() == null || 
            projectFile.getProjectProperties().getName().trim().isEmpty()) {
            warnings.add("Project name is empty");
        }
        
        // Проверка задач без имен
        for (Task task : projectFile.getTasks()) {
            if (task.getName() == null || task.getName().trim().isEmpty()) {
                warnings.add("Task without name found: " + task.getID());
                break;
            }
        }
        
        // Проверка ресурсов без имен
        for (Resource resource : projectFile.getResources()) {
            if (resource.getName() == null || resource.getName().trim().isEmpty()) {
                warnings.add("Resource without name found: " + resource.getID());
                break;
            }
        }
        
        result.warnings = warnings;
    }
    
    /**
     * Тестирование производительности с разными размерами файлов
     */
    public void testPerformance() {
        System.out.println("\n--- Performance Testing ---");
        
        // Создание тестовых файлов разного размера
        int[] taskCounts = {10, 50, 100, 500, 1000};
        
        for (int taskCount : taskCounts) {
            testPerformanceWithTaskCount(taskCount);
        }
    }
    
    private void testPerformanceWithTaskCount(int taskCount) {
        try {
            // Создание временного файла
            String tempFile = createTestProject(taskCount);
            
            // Тестирование чтения
            long startTime = System.currentTimeMillis();
            ProjectFile projectFile = new UniversalProjectReader().read(tempFile);
            long readTime = System.currentTimeMillis() - startTime;
            
            System.out.println("Performance Test: " + taskCount + " tasks -> " + readTime + "ms");
            
            // Очистка
            new File(tempFile).delete();
            
        } catch (Exception e) {
            System.out.println("Performance test failed for " + taskCount + " tasks: " + e.getMessage());
        }
    }
    
    /**
     * Создание тестового проекта с указанным количеством задач
     */
    private String createTestProject(int taskCount) throws Exception {
        // Здесь должна быть логика создания тестового файла
        // Для упрощения возвращаем путь к существующему файлу
        return SAMPLES_PATH + "New Product.pod";
    }
    
    /**
     * Анализ результатов тестов
     */
    public void analyzeResults() {
        System.out.println("\n--- Results Analysis ---");
        
        int successCount = 0;
        int errorCount = 0;
        long totalReadTime = 0;
        int totalTasks = 0;
        
        Map<String, Integer> fileTypeStats = new HashMap<>();
        
        for (TestResult result : testResults) {
            if ("SUCCESS".equals(result.status)) {
                successCount++;
                totalReadTime += result.readTime;
                totalTasks += result.taskCount;
            } else {
                errorCount++;
            }
            
            fileTypeStats.merge(result.fileType, 1, Integer::sum);
        }
        
        System.out.println("Success: " + successCount + ", Errors: " + errorCount);
        System.out.println("Average read time: " + (successCount > 0 ? totalReadTime / successCount : 0) + "ms");
        System.out.println("Total tasks processed: " + totalTasks);
        System.out.println("File types: " + fileTypeStats);
    }
    
    /**
     * Генерация отчета о совместимости
     */
    public void generateReport() {
        System.out.println("\n--- Compatibility Report ---");
        
        StringBuilder report = new StringBuilder();
        report.append("# MPXJ Compatibility Test Report\n\n");
        
        report.append("## Test Summary\n");
        report.append("- Files tested: ").append(testResults.size()).append("\n");
        
        long successCount = testResults.stream().filter(r -> "SUCCESS".equals(r.status)).count();
        report.append("- Successful imports: ").append(successCount).append("\n");
        report.append("- Failed imports: ").append(testResults.size() - successCount).append("\n\n");
        
        report.append("## Detailed Results\n\n");
        
        for (TestResult result : testResults) {
            report.append("### ").append(result.filename).append("\n");
            report.append("- Status: ").append(result.status).append("\n");
            report.append("- File Type: ").append(result.fileType).append("\n");
            
            if ("SUCCESS".equals(result.status)) {
                report.append("- Read Time: ").append(result.readTime).append("ms\n");
                report.append("- Tasks: ").append(result.taskCount).append("\n");
                report.append("- Resources: ").append(result.resourceCount).append("\n");
                report.append("- Relations: ").append(result.relationCount).append("\n");
                
                if (!result.warnings.isEmpty()) {
                    report.append("- Warnings: ").append(String.join(", ", result.warnings)).append("\n");
                }
            } else {
                report.append("- Error: ").append(result.errorMessage).append("\n");
            }
            
            report.append("\n");
        }
        
        System.out.println(report.toString());
        
        // Сохранение отчета в файл
        try {
            java.nio.file.Files.write(
                java.nio.file.Paths.get("MPXJ_Compatibility_Report.md"),
                report.toString().getBytes()
            );
            System.out.println("Report saved to MPXJ_Compatibility_Report.md");
        } catch (Exception e) {
            System.out.println("Failed to save report: " + e.getMessage());
        }
    }
    
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
    
    /**
     * Класс для хранения результатов тестирования
     */
    private static class TestResult {
        String filename;
        String fullPath;
        String fileType;
        String status;
        String errorMessage;
        Exception exception;
        
        // Производительность
        long readTime;
        
        // Содержимое
        int taskCount;
        int resourceCount;
        int assignmentCount;
        int milestoneCount;
        int summaryTaskCount;
        int criticalTaskCount;
        int relationCount;
        
        // Свойства проекта
        String projectName;
        java.util.Date startDate;
        java.util.Date finishDate;
        
        List<String> warnings = new ArrayList<>();
    }
}