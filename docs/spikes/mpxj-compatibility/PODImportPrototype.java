package net.sf.mpxj.sample;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import net.sf.mpxj.MPXJException;
import net.sf.mpxj.ProjectFile;
import net.sf.mpxj.Task;
import net.sf.mpxj.Resource;
import net.sf.mpxj.ResourceAssignment;
import net.sf.mpxj.Relation;
import net.sf.mpxj.projectlibre.ProjectLibreReader;

/**
 * Прототип импорта .pod файлов для ProjectLibre React интерфейса
 * 
 * Цели:
 * 1. Демонстрация базового импорта POD файлов
 * 2. Конвертация в MVP-модели данных
 * 3. Обработка ошибок и валидация
 * 4. Асинхронная обработка больших файлов
 * 5. Метрики производительности
 */
public class PODImportPrototype {
    
    private final ExecutorService importExecutor = Executors.newFixedThreadPool(4);
    private final Map<String, ImportMetrics> importMetrics = new HashMap<>();
    
    /**
     * Основной метод для демонстрации импорта
     */
    public static void main(String[] args) {
        System.out.println("=== POD Import Prototype ===");
        
        PODImportPrototype prototype = new PODImportPrototype();
        
        // Тестовые файлы
        String[] testFiles = {
            "../../projectlibre_build/resources/samples/New Product.pod",
            "../../projectlibre_build/resources/samples/Microsoft Office Project 2003 deployment.pod",
            "../../projectlibre_build/resources/samples/Commercial construction project plan.pod"
        };
        
        // Синхронный импорт
        System.out.println("\n--- Synchronous Import ---");
        for (String filePath : testFiles) {
            prototype.importFileSync(filePath);
        }
        
        // Асинхронный импорт
        System.out.println("\n--- Asynchronous Import ---");
        List<CompletableFuture<MVPProject>> futures = new ArrayList<>();
        for (String filePath : testFiles) {
            futures.add(prototype.importFileAsync(filePath));
        }
        
        // Ожидание завершения
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
            .thenRun(() -> {
                System.out.println("All async imports completed");
                prototype.printImportMetrics();
            })
            .join();
        
        prototype.shutdown();
    }
    
    /**
     * Синхронный импорт файла
     */
    public MVPProject importFileSync(String filePath) {
        System.out.println("Importing (sync): " + getFileName(filePath));
        
        long startTime = System.currentTimeMillis();
        ImportMetrics metrics = new ImportMetrics();
        metrics.filePath = filePath;
        metrics.startTime = startTime;
        
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                throw new Exception("File not found: " + filePath);
            }
            
            // Валидация размера файла
            if (file.length() > 5 * 1024 * 1024) { // 5MB limit
                throw new Exception("File too large: " + file.length() + " bytes");
            }
            
            // Чтение POD файла
            ProjectFile projectFile = readPODFile(file);
            if (projectFile == null) {
                throw new Exception("Failed to read POD file");
            }
            
            // Конвертация в MVP модель
            MVPProject mvpProject = convertToMVPModel(projectFile, metrics);
            
            long endTime = System.currentTimeMillis();
            metrics.endTime = endTime;
            metrics.success = true;
            metrics.duration = endTime - startTime;
            
            System.out.println("✅ Success: " + mvpProject.tasks.size() + " tasks, " + 
                             mvpProject.resources.size() + " resources, " + metrics.duration + "ms");
            
            importMetrics.put(filePath, metrics);
            return mvpProject;
            
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            metrics.endTime = endTime;
            metrics.success = false;
            metrics.duration = endTime - startTime;
            metrics.errorMessage = e.getMessage();
            
            System.out.println("❌ Error: " + e.getMessage());
            importMetrics.put(filePath, metrics);
            return null;
        }
    }
    
    /**
     * Асинхронный импорт файла
     */
    public CompletableFuture<MVPProject> importFileAsync(String filePath) {
        return CompletableFuture.supplyAsync(() -> importFileSync(filePath), importExecutor);
    }
    
    /**
     * Чтение POD файла используя ProjectLibreReader
     */
    private ProjectFile readPODFile(File file) throws Exception {
        ProjectLibreReader reader = new ProjectLibreReader();
        
        try (FileInputStream fis = new FileInputStream(file)) {
            ProjectFile projectFile = reader.read(fis);
            
            // Базовая валидация
            if (projectFile.getTasks().isEmpty()) {
                throw new Exception("No tasks found in project file");
            }
            
            return projectFile;
        }
    }
    
    /**
     * Конвертация MPXJ ProjectFile в MVP модель
     */
    private MVPProject convertToMVPModel(ProjectFile projectFile, ImportMetrics metrics) {
        MVPProject mvpProject = new MVPProject();
        
        // Конвертация свойств проекта
        mvpProject.name = projectFile.getProjectProperties().getName();
        if (mvpProject.name == null || mvpProject.name.trim().isEmpty()) {
            mvpProject.name = "Imported Project";
        }
        
        mvpProject.startDate = projectFile.getProjectProperties().getStartDate();
        mvpProject.finishDate = projectFile.getProjectProperties().getFinishDate();
        
        // Конвертация задач
        List<String> warnings = new ArrayList<>();
        int taskCount = 0;
        
        for (Task mpxjTask : projectFile.getTasks()) {
            if (taskCount >= 500) { // MVP ограничение
                warnings.add("Task limit reached (500), skipping remaining tasks");
                break;
            }
            
            try {
                MVPTask mvpTask = convertTask(mpxjTask);
                if (mvpTask != null) {
                    mvpProject.tasks.add(mvpTask);
                    taskCount++;
                }
            } catch (Exception e) {
                warnings.add("Error converting task " + mpxjTask.getID() + ": " + e.getMessage());
            }
        }
        
        // Конвертация ресурсов
        int resourceCount = 0;
        for (Resource mpxjResource : projectFile.getResources()) {
            if (resourceCount >= 50) { // MVP ограничение
                warnings.add("Resource limit reached (50), skipping remaining resources");
                break;
            }
            
            try {
                MVPResource mvpResource = convertResource(mpxjResource);
                if (mvpResource != null) {
                    mvpProject.resources.add(mvpResource);
                    resourceCount++;
                }
            } catch (Exception e) {
                warnings.add("Error converting resource " + mpxjResource.getID() + ": " + e.getMessage());
            }
        }
        
        // Конвертация назначений
        int assignmentCount = 0;
        for (ResourceAssignment mpxjAssignment : projectFile.getResourceAssignments()) {
            if (assignmentCount >= 200) { // MVP ограничение
                warnings.add("Assignment limit reached (200), skipping remaining assignments");
                break;
            }
            
            try {
                MVPAssignment mvpAssignment = convertAssignment(mpxjAssignment);
                if (mvpAssignment != null) {
                    mvpProject.assignments.add(mvpAssignment);
                    assignmentCount++;
                }
            } catch (Exception e) {
                warnings.add("Error converting assignment: " + e.getMessage());
            }
        }
        
        // Конвертация зависимостей
        for (Task mpxjTask : projectFile.getTasks()) {
            for (Relation mpxjRelation : mpxjTask.getRelations()) {
                try {
                    MVPDependency mvpDependency = convertDependency(mpxjTask, mpxjRelation);
                    if (mvpDependency != null) {
                        mvpProject.dependencies.add(mvpDependency);
                    }
                } catch (Exception e) {
                    warnings.add("Error converting dependency: " + e.getMessage());
                }
            }
        }
        
        // Метрики
        metrics.taskCount = taskCount;
        metrics.resourceCount = resourceCount;
        metrics.assignmentCount = assignmentCount;
        metrics.dependencyCount = mvpProject.dependencies.size();
        metrics.warnings = warnings;
        
        return mvpProject;
    }
    
    /**
     * Конвертация задачи
     */
    private MVPTask convertTask(Task mpxjTask) {
        if (mpxjTask.getNull()) {
            return null; // Пропуск summary задач для MVP
        }
        
        MVPTask mvpTask = new MVPTask();
        mvpTask.id = mpxjTask.getID().toString();
        mvpTask.name = mpxjTask.getName();
        
        if (mvpTask.name == null || mvpTask.name.trim().isEmpty()) {
            mvpTask.name = "Task " + mvpTask.getID();
        }
        
        mvpTask.start = mpxjTask.getStart();
        mvpTask.finish = mpxjTask.getFinish();
        mvpTask.duration = mpxjTask.getDuration().getDuration();
        mvpTask.progress = (int) (mpxjTask.getPercentageComplete() * 100);
        mvpTask.milestone = mpxjTask.getMilestone();
        mvpTask.critical = mpxjTask.getCritical();
        
        // Определение приоритета
        mvpTask.priority = mapPriority(mpxjTask.getPriority());
        
        return mvpTask;
    }
    
    /**
     * Конвертация ресурса
     */
    private MVPResource convertResource(Resource mpxjResource) {
        MVPResource mvpResource = new MVPResource();
        mvpResource.id = mpxjResource.getID().toString();
        mvpResource.name = mpxjResource.getName();
        
        if (mvpResource.name == null || mvpResource.name.trim().isEmpty()) {
            mvpResource.name = "Resource " + mpxjResource.getID();
        }
        
        mvpResource.type = mapResourceType(mpxjResource.getType());
        mvpResource.maxUnits = mpxjResource.getMaxUnits().getUnits() / 100.0;
        mvpResource.standardRate = mpxjResource.getStandardRate().getAmount();
        
        return mvpResource;
    }
    
    /**
     * Конвертация назначения
     */
    private MVPAssignment convertAssignment(ResourceAssignment mpxjAssignment) {
        MVPAssignment mvpAssignment = new MVPAssignment();
        mvpAssignment.taskId = mpxjAssignment.getTask().getID().toString();
        mvpAssignment.resourceId = mpxjAssignment.getResource().getID().toString();
        mvpAssignment.units = mpxjAssignment.getUnits().getUnits() / 100.0;
        mvpAssignment.work = mpxjAssignment.getWork().getDuration();
        mvpAssignment.start = mpxjAssignment.getStart();
        mvpAssignment.finish = mpxjAssignment.getFinish();
        
        return mvpAssignment;
    }
    
    /**
     * Конвертация зависимости
     */
    private MVPDependency convertDependency(Task task, Relation relation) {
        MVPDependency mvpDependency = new MVPDependency();
        mvpDependency.taskId = task.getID().toString();
        mvpDependency.predecessorId = relation.getTargetTask().getID().toString();
        mvpDependency.type = mapDependencyType(relation.getType());
        mvpDependency.lag = relation.getLag().getDuration();
        
        return mvpDependency;
    }
    
    // Вспомогательные методы для маппинга
    private String mapPriority(Integer priority) {
        if (priority == null) return "medium";
        if (priority <= 400) return "low";
        if (priority >= 600) return "high";
        return "medium";
    }
    
    private String mapResourceType(net.sf.mpxj.ResourceType type) {
        if (type == null) return "work";
        switch (type) {
            case MATERIAL: return "material";
            case COST: return "cost";
            default: return "work";
        }
    }
    
    private String mapDependencyType(net.sf.mpxj.RelationType type) {
        if (type == null) return "FS";
        switch (type) {
            case START_START: return "SS";
            case FINISH_FINISH: return "FF";
            case FINISH_START: return "SF";
            default: return "FS";
        }
    }
    
    /**
     * Вывод метрик импорта
     */
    public void printImportMetrics() {
        System.out.println("\n--- Import Metrics ---");
        
        for (Map.Entry<String, ImportMetrics> entry : importMetrics.entrySet()) {
            ImportMetrics metrics = entry.getValue();
            System.out.println("\nFile: " + getFileName(entry.getKey()));
            System.out.println("Status: " + (metrics.success ? "SUCCESS" : "FAILED"));
            System.out.println("Duration: " + metrics.duration + "ms");
            
            if (metrics.success) {
                System.out.println("Tasks: " + metrics.taskCount);
                System.out.println("Resources: " + metrics.resourceCount);
                System.out.println("Assignments: " + metrics.assignmentCount);
                System.out.println("Dependencies: " + metrics.dependencyCount);
                
                if (!metrics.warnings.isEmpty()) {
                    System.out.println("Warnings: " + metrics.warnings.size());
                    metrics.warnings.forEach(w -> System.out.println("  - " + w));
                }
            } else {
                System.out.println("Error: " + metrics.errorMessage);
            }
        }
    }
    
    private String getFileName(String fullPath) {
        return new File(fullPath).getName();
    }
    
    public void shutdown() {
        importExecutor.shutdown();
    }
    
    // MVP классы данных
    
    public static class MVPProject {
        public String name;
        public Date startDate;
        public Date finishDate;
        public List<MVPTask> tasks = new ArrayList<>();
        public List<MVPResource> resources = new ArrayList<>();
        public List<MVPAssignment> assignments = new ArrayList<>();
        public List<MVPDependency> dependencies = new ArrayList<>();
    }
    
    public static class MVPTask {
        public String id;
        public String name;
        public Date start;
        public Date finish;
        public double duration;
        public int progress;
        public boolean milestone;
        public boolean critical;
        public String priority;
    }
    
    public static class MVPResource {
        public String id;
        public String name;
        public String type;
        public double maxUnits;
        public double standardRate;
    }
    
    public static class MVPAssignment {
        public String taskId;
        public String resourceId;
        public double units;
        public double work;
        public Date start;
        public Date finish;
    }
    
    public static class MVPDependency {
        public String taskId;
        public String predecessorId;
        public String type;
        public double lag;
    }
    
    public static class ImportMetrics {
        public String filePath;
        public long startTime;
        public long endTime;
        public long duration;
        public boolean success;
        public String errorMessage;
        public int taskCount;
        public int resourceCount;
        public int assignmentCount;
        public int dependencyCount;
        public List<String> warnings = new ArrayList<>();
    }
}