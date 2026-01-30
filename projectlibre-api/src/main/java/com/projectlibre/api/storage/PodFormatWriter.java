package com.projectlibre.api.storage;

import com.projectlibre1.pm.task.Project;
import com.projectlibre1.server.data.DataUtil;
import com.projectlibre1.server.data.DocumentData;
import com.projectlibre1.server.data.MSPDISerializer;

import java.io.BufferedOutputStream;
import java.io.OutputStream;
import java.io.ObjectOutputStream;

/**
 * Отвечает за запись POD-файлов в корректном формате.
 * 
 * Формат POD-файла (совместимый с оригинальным ProjectLibre):
 * 1. VERSION (String) - версия формата
 * 2. DocumentData (Object) - сериализованные задачи/ресурсы
 * 3. SEPARATOR (байты) - маркер начала XML
 * 4. XML (текст) - резервная копия в формате MS Project XML
 * 
 * Single Responsibility: запись POD в правильном формате.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class PodFormatWriter {
    
    private static final String VERSION = "1.0.0";
    private static final String XML_SEPARATOR = "@@@@@@@@@@ProjectLibreSeparator_MSXML@@@@@@@@@@";
    
    /**
     * Записывает проект в POD-файл с полной структурой.
     * 
     * @param project проект для сохранения
     * @param output поток вывода
     * @throws Exception если запись не удалась
     */
    public void write(Project project, OutputStream output) throws Exception {
        if (project == null) {
            throw new IllegalArgumentException("Project cannot be null");
        }
        if (output == null) {
            throw new IllegalArgumentException("Output stream cannot be null");
        }
        
        writeBinarySection(project, output);
        writeXmlSection(project, output);
    }
    
    /**
     * Записывает бинарную секцию (VERSION + DocumentData).
     */
    private void writeBinarySection(Project project, OutputStream output) throws Exception {
        System.out.println("[PodFormatWriter] Writing binary section...");
        
        // 🔍 ДИАГНОСТИКА ДАТ: Логируем даты задач ПЕРЕД сериализацией
        System.out.println("[PodFormatWriter] 📅 Task dates BEFORE serialization:");
        try {
            java.util.Iterator<com.projectlibre1.pm.task.Task> taskIter = project.getTaskOutlineIterator();
            int taskCount = 0;
            while (taskIter.hasNext() && taskCount < 10) {
                com.projectlibre1.pm.task.Task task = taskIter.next();
                if (!task.isExternal()) {
                    System.out.println("[PodFormatWriter]   Task '" + task.getName() + "': " +
                        "start=" + new java.util.Date(task.getStart()) + ", " +
                        "end=" + new java.util.Date(task.getEnd()) + ", " +
                        "constraint=" + task.getConstraintType() + ", " +
                        "constraintDate=" + new java.util.Date(task.getConstraintDate()));
                    taskCount++;
                }
            }
        } catch (Exception e) {
            System.err.println("[PodFormatWriter] Failed to log task dates: " + e.getMessage());
        }
        
        // 🔍 ДИАГНОСТИКА: Проверяем состояние ресурсов перед сериализацией
        if (project.getResourcePool() != null) {
            java.util.Collection<?> resources = project.getResourcePool().getResourceList();
            int resourceCount = (resources != null) ? resources.size() : 0;
            System.out.println("[PodFormatWriter] 📊 Resources in project BEFORE serialization: " + resourceCount);
            
            if (resourceCount > 0) {
                System.out.println("[PodFormatWriter] Resource names:");
                int displayCount = 0;
                for (Object obj : resources) {
                    if (obj instanceof com.projectlibre1.pm.resource.Resource) {
                        com.projectlibre1.pm.resource.Resource r = (com.projectlibre1.pm.resource.Resource) obj;
                        System.out.println("[PodFormatWriter]   - " + r.getName() + " (ID: " + r.getUniqueId() + ")");
                        displayCount++;
                        if (displayCount >= 10) {
                            System.out.println("[PodFormatWriter]   ... and " + (resourceCount - 10) + " more");
                            break;
                        }
                    }
                }
                
                logResourceCalendars(resources, resourceCount);
            }
        } else {
            System.out.println("[PodFormatWriter] ⚠️ ResourcePool is NULL!");
        }
        
        DataUtil serializer = new DataUtil();
        DocumentData projectData = serializer.serializeDocument(project);
        
        if (projectData == null) {
            throw new IllegalStateException("Failed to serialize project to DocumentData");
        }
        
        // 🔍 ДИАГНОСТИКА: Проверяем, сколько ресурсов попало в DocumentData
        if (projectData instanceof com.projectlibre1.server.data.ProjectData) {
            com.projectlibre1.server.data.ProjectData pd = (com.projectlibre1.server.data.ProjectData) projectData;
            java.util.Collection<?> serializedResources = pd.getResources();
            int serializedCount = (serializedResources != null) ? serializedResources.size() : 0;
            System.out.println("[PodFormatWriter] 📊 Resources in DocumentData AFTER serialization: " + serializedCount);
            
            if (serializedCount == 0) {
                System.err.println("[PodFormatWriter] ❌ WARNING: NO RESOURCES were serialized into DocumentData!");
            }
        }
        
        projectData.setMaster(true);
        projectData.setLocal(true);
        
        ObjectOutputStream oos = new ObjectOutputStream(output);
        oos.writeObject(VERSION);
        oos.writeObject(projectData);
        oos.flush();
        
        System.out.println("[PodFormatWriter] ✅ Binary section written");
    }
    
    /**
     * Записывает XML-секцию (резервная копия для восстановления).
     */
    private void writeXmlSection(Project project, OutputStream output) throws Exception {
        System.out.println("[PodFormatWriter] Writing XML section...");
        
        BufferedOutputStream buffered = new BufferedOutputStream(output);
        buffered.write(XML_SEPARATOR.getBytes());
        buffered.flush();
        
        MSPDISerializer xmlSerializer = new MSPDISerializer();
        boolean xmlWritten = xmlSerializer.saveProject(project, buffered);
        buffered.flush();
        
        if (!xmlWritten) {
            System.err.println("[PodFormatWriter] ⚠️ XML write returned false");
            throw new IllegalStateException("Failed to write XML backup");
        }
        
        System.out.println("[PodFormatWriter] ✅ XML section written");
    }
    
    /**
     * Логирует календари ресурсов перед сериализацией.
     */
    private void logResourceCalendars(java.util.Collection<?> resources, int resourceCount) {
        System.out.println("[PodFormatWriter] 📅 Resource calendars:");
        int calDisplayCount = 0;
        
        for (Object obj : resources) {
            if (obj instanceof com.projectlibre1.pm.resource.Resource) {
                com.projectlibre1.pm.resource.Resource r = 
                    (com.projectlibre1.pm.resource.Resource) obj;
                com.projectlibre1.pm.calendar.WorkCalendar cal = r.getWorkCalendar();
                if (cal != null && cal instanceof com.projectlibre1.pm.calendar.WorkingCalendar) {
                    com.projectlibre1.pm.calendar.WorkingCalendar wc = 
                        (com.projectlibre1.pm.calendar.WorkingCalendar) cal;
                    com.projectlibre.api.validator.CalendarSafetyValidator.ValidationResult validation = 
                        new com.projectlibre.api.validator.CalendarSafetyValidator().validate(wc);
                    String prefix = !validation.isValid() ? "⚠️ UNSAFE" : "Calendar";
                    System.out.println("[PodFormatWriter]   - '" + r.getName() + "' → " + prefix + 
                        ": '" + wc.getName() + "' (fixedId=" + wc.getFixedId() + 
                        ", uniqueId=" + wc.getUniqueId() + ")");
                } else {
                    System.out.println("[PodFormatWriter]   - '" + r.getName() + "' → NO CALENDAR");
                }
                calDisplayCount++;
                if (calDisplayCount >= 10) {
                    System.out.println("[PodFormatWriter]   ... and " + (resourceCount - 10) + " more");
                    break;
                }
            }
        }
    }
}
