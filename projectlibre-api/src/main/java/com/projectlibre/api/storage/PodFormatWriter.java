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
        
        DataUtil serializer = new DataUtil();
        DocumentData projectData = serializer.serializeDocument(project);
        
        if (projectData == null) {
            throw new IllegalStateException("Failed to serialize project to DocumentData");
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
}
