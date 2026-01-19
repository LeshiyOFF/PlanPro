package com.projectlibre1.exchange;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Детектор формата POD-файлов ProjectLibre.
 * 
 * Поддерживаемые форматы:
 * - BINARY_WITH_XML: Современный формат (VERSION + DocumentData + XML)
 * - LEGACY_BINARY: Старый формат (только Project object)
 * - XML_ONLY: Древний формат (только XML без бинарных данных)
 * - CORRUPTED: Невалидный формат
 * 
 * Single Responsibility: детекция формата POD по заголовку.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class PodFormatDetector {
    
    private static final int HEADER_SIZE = 8;
    
    private static final byte JAVA_SERIALIZATION_MAGIC_1 = (byte) 0xAC;
    private static final byte JAVA_SERIALIZATION_MAGIC_2 = (byte) 0xED;
    
    private static final byte XML_START_1 = 0x3C;
    private static final byte XML_START_2 = 0x3F;
    private static final byte XML_START_3 = 0x78;
    private static final byte XML_START_4 = 0x6D;
    
    /**
     * Типы поддерживаемых форматов POD.
     */
    public enum PodFormat {
        BINARY_WITH_XML("Modern POD with DocumentData and XML backup"),
        LEGACY_BINARY("Legacy POD with direct Project serialization"),
        XML_ONLY("Ancient XML-only POD format"),
        CORRUPTED("Invalid or corrupted POD file");
        
        private final String description;
        
        PodFormat(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    /**
     * Детектирует формат POD-файла по заголовку.
     * Требует BufferedInputStream для поддержки mark/reset.
     */
    public PodFormat detect(InputStream input) throws IOException {
        if (!(input instanceof BufferedInputStream)) {
            throw new IllegalArgumentException(
                "Input stream must be BufferedInputStream for mark/reset support");
        }
        
        byte[] header = new byte[HEADER_SIZE];
        input.mark(HEADER_SIZE);
        
        int bytesRead = input.read(header);
        input.reset();
        
        if (bytesRead < 4) {
            return PodFormat.CORRUPTED;
        }
        
        if (isJavaSerialization(header)) {
            return PodFormat.BINARY_WITH_XML;
        }
        
        if (isXmlStart(header)) {
            return PodFormat.XML_ONLY;
        }
        
        return PodFormat.CORRUPTED;
    }
    
    /**
     * Проверяет Java Serialization magic: AC ED 00 05.
     */
    private boolean isJavaSerialization(byte[] header) {
        return header[0] == JAVA_SERIALIZATION_MAGIC_1 &&
               header[1] == JAVA_SERIALIZATION_MAGIC_2;
    }
    
    /**
     * Проверяет XML start: "<?xm" (начало "<?xml").
     */
    private boolean isXmlStart(byte[] header) {
        return header[0] == XML_START_1 &&
               header[1] == XML_START_2 &&
               header[2] == XML_START_3 &&
               header[3] == XML_START_4;
    }
}
