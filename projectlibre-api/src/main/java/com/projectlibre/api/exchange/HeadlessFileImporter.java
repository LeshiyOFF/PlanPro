package com.projectlibre.api.exchange;

import com.projectlibre1.exchange.FileImporter;
import com.projectlibre1.exchange.LocalFileImporter;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.ProjectFactory;
import com.projectlibre1.session.Session;
import com.projectlibre1.job.JobQueue;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Field;

/**
 * Headless file importer for ProjectLibre projects.
 * Decouples import logic from GUI dependencies.
 *
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class HeadlessFileImporter {

    private static final Logger log = LoggerFactory.getLogger(HeadlessFileImporter.class);

    private final Session session;
    private final ProjectFactory projectFactory;
    private final CalendarRestorer calendarRestorer;

    public HeadlessFileImporter(Session session) {
        this.session = session;
        this.projectFactory = ProjectFactory.getInstance();
        this.calendarRestorer = new CalendarRestorer();
    }

    public Project importFile(File file) throws Exception {
        log.info("[HeadlessImporter] Importing file: {}", file.getAbsolutePath());
        LocalFileImporter importer = new LocalFileImporter();
        injectDependencies(importer);
        importer.setFileName(file.getAbsolutePath());
        importer.importFile();
        return waitForProjectResult(importer, file.getName());
    }

    public Project importFile(String filePath) throws Exception {
        return importFile(new File(filePath));
    }

    public Project importStream(InputStream inputStream, String fileName) throws Exception {
        log.info("[HeadlessImporter] Importing from stream: {}", fileName);
        LocalFileImporter importer = new LocalFileImporter();
        injectDependencies(importer);
        importer.setFileInputStream(inputStream);
        importer.setFileName(fileName);
        importer.importFile();
        return waitForProjectResult(importer, fileName);
    }

    private void injectDependencies(LocalFileImporter importer) throws Exception {
        Field projectFactoryField = FileImporter.class.getDeclaredField("projectFactory");
        projectFactoryField.setAccessible(true);
        projectFactoryField.set(importer, projectFactory);
        JobQueue jobQueue = session.getJobQueue();
        if (jobQueue != null) {
            Field jobQueueField = FileImporter.class.getDeclaredField("jobQueue");
            jobQueueField.setAccessible(true);
            jobQueueField.set(importer, jobQueue);
        }
    }

    /**
     * Waits for project import to complete with timeout protection.
     */
    private Project waitForProjectResult(LocalFileImporter importer, String fileName)
            throws InterruptedException {
        Project project = importer.getProject();

        if (project != null) {
            log.info("[HeadlessImporter] Project loaded immediately: {}", project.getName());
            applyPostLoadSteps(project);
            return project;
        }

        log.warn("[HeadlessImporter] Project null, waiting with timeout...");
        int timeoutSeconds = 30;
        int attempts = 0;
        while (project == null && attempts < timeoutSeconds) {
            Thread.sleep(1000);
            project = importer.getProject();
            attempts++;
            if (attempts % 5 == 0) {
                log.info("[HeadlessImporter] Still waiting... ({}/{}s)", attempts, timeoutSeconds);
            }
        }

        if (project != null) {
            log.info("[HeadlessImporter] Project loaded after {}s: {}", attempts, project.getName());
            applyPostLoadSteps(project);
        } else {
            log.error("[HeadlessImporter] Timeout ({}s) waiting for: {}", timeoutSeconds, fileName);
        }
        return project;
    }

    private void applyPostLoadSteps(Project project) {
        TaskDateDiagnosticsLogger.logTaskDatesAfterDeserialization(project);
        // ОТКЛЮЧЕНО: TaskDateNormalizer перезаписывал даты из CustomDate(0)/(1), что ломало CPM расчёт.
        // CPM должен сам рассчитывать early/late даты на основе зависимостей и ограничений,
        // а не использовать "сохранённые" даты из CustomDate полей.
        // TaskDateNormalizer.normalizeTaskDatesAfterLoad(project);
        ResourceCalendarDiagnosticsLogger.logAfterDeserialization(project);
        restoreResourceCalendars(project);
        initializeCpmIfPresent(project);
    }

    /**
     * ИНИТ-CPM.1: Инициализация CPM после загрузки файла.
     * Строит список предшественников и связи с сентинелами, чтобы первый recalculate давал корректный критический путь.
     */
    private void initializeCpmIfPresent(Project project) {
        if (project == null) return;
        var algo = project.getSchedulingAlgorithm();
        if (algo != null) {
            algo.initialize(project);
            log.debug("[HeadlessImporter] CPM initialized after load");
        }
    }

    /**
     * Восстанавливает календари ресурсов после десериализации (очистка дубликатов + восстановление).
     */
    private void restoreResourceCalendars(Project project) {
        log.debug("[HeadlessImporter] Restoring resource calendars...");
        try {
            CalendarServiceCleaner cleaner = new CalendarServiceCleaner();
            cleaner.cleanDuplicates();
            log.debug("[HeadlessImporter] Cleanup done, removed: {} duplicates", cleaner.getRemovedCount());
            calendarRestorer.restoreCalendars(project);
            log.info("[HeadlessImporter] Calendars restored: {} restored, {} failed",
                    calendarRestorer.getRestoredCount(), calendarRestorer.getFailedCount());
            ResourceCalendarDiagnosticsLogger.logAfterRestoration(project);
        } catch (Throwable t) {
            log.error("[HeadlessImporter] Calendar restoration failed: {}", t.getMessage());
        }
    }
}
