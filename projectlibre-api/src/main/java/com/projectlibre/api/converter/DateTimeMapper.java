package com.projectlibre.api.converter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Утилита для конвертации дат между Core (long millis) и API (ISO-8601 String).
 * 
 * V3.0: Расширенная поддержка форматов дат:
 * - ISO-8601 (приоритет): "2026-01-28T18:37:19.575Z"
 * - BASIC_ISO: "20260128T18:37:19.575Z" (без дефисов в дате)
 * - OffsetDateTime: "2026-01-28T18:37:19+03:00"
 * - Legacy timestamp: "1769547600000"
 * 
 * Clean Architecture: Utility (Domain Layer).
 * SOLID: Single Responsibility - только маппинг дат.
 * 
 * @author ProjectLibre Team
 * @version 3.0.0
 */
public class DateTimeMapper {
    
    private static final Logger log = LoggerFactory.getLogger(DateTimeMapper.class);
    
    /** Стандартный ISO-8601 формат для Instant. */
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    
    /** BASIC_ISO формат без дефисов: yyyyMMdd'T'HH:mm:ss.SSSX */
    private static final DateTimeFormatter BASIC_ISO_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyyMMdd'T'HH:mm:ss.SSS'Z'");
    
    /** BASIC_ISO формат без миллисекунд: yyyyMMdd'T'HH:mm:ss'Z' */
    private static final DateTimeFormatter BASIC_ISO_NO_MILLIS_FORMATTER = 
        DateTimeFormatter.ofPattern("yyyyMMdd'T'HH:mm:ss'Z'");
    
    /**
     * Конвертирует миллисекунды в ISO-8601 строку.
     * 
     * TIMEZONE-FIX: Генерируем ISO string с timezone offset вместо UTC.
     * Это критично для корректного отображения дат на Frontend:
     * - UTC: 14.02 00:00 MSK = "2026-02-13T21:00:00Z" → Frontend видит 13.02 ✗
     * - Offset: 14.02 00:00 MSK = "2026-02-14T00:00:00+03:00" → Frontend видит 14.02 ✓
     * 
     * @param millis timestamp в миллисекундах
     * @return ISO-8601 строка с timezone offset или null если millis <= 0
     */
    public String toIsoString(long millis) {
        if (millis <= 0) {
            return null;
        }
        try {
            // TIMEZONE-FIX: Используем системную timezone вместо UTC
            java.time.ZonedDateTime zdt = java.time.Instant.ofEpochMilli(millis)
                .atZone(java.time.ZoneId.systemDefault());
            return zdt.format(java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        } catch (Exception e) {
            log.warn("[DateTimeMapper] Failed to format millis: {}", millis);
            return null;
        }
    }
    
    /** Счётчик вызовов для трассировки */
    private static int callCounter = 0;
    
    /**
     * Конвертирует строку даты в миллисекунды с поддержкой множества форматов.
     * 
     * @param value строка даты в любом из поддерживаемых форматов
     * @return миллисекунды с эпохи Unix, или 0L при ошибке парсинга
     */
    public long toMillis(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0L;
        }
        
        String trimmed = value.trim();
        String format = detectFormat(trimmed);
        
        long result;
        if (isNumericTimestamp(trimmed)) {
            result = parseNumericTimestamp(trimmed);
        } else {
            result = parseDateTime(trimmed);
        }
        
        // ДИАГНОСТИКА: Логируем каждую конвертацию даты
        callCounter++;
        log.info("[DATE-SYNC-DIAG] DateTimeMapper.toMillis #{}: '{}' (format={}) -> {}ms", 
            callCounter, trimmed, format, result);
        
        return result;
    }
    
    /**
     * Парсит числовой timestamp.
     */
    private long parseNumericTimestamp(String value) {
        try {
            long timestamp = Long.parseLong(value);
            log.debug("[DateTimeMapper] Parsed timestamp: {} -> {}", value, timestamp);
            return timestamp;
        } catch (NumberFormatException e) {
            log.warn("[DateTimeMapper] Invalid numeric timestamp: {}", value);
            return 0L;
        }
    }
    
    /**
     * Парсит строку даты с fallback цепочкой форматов.
     */
    private long parseDateTime(String value) {
        Long result = tryParseIsoInstant(value);
        if (result != null) return result;
        
        result = tryParseBasicIso(value);
        if (result != null) return result;
        
        result = tryParseOffsetDateTime(value);
        if (result != null) return result;
        
        log.warn("[DateTimeMapper] ⚠️ Unsupported date format: '{}'", value);
        return 0L;
    }
    
    /**
     * Попытка парсинга стандартного ISO-8601 формата.
     */
    private Long tryParseIsoInstant(String value) {
        try {
            return Instant.parse(value).toEpochMilli();
        } catch (DateTimeParseException e) {
            return null;
        }
    }
    
    /**
     * Попытка парсинга BASIC_ISO формата (без дефисов).
     */
    private Long tryParseBasicIso(String value) {
        try {
            LocalDateTime ldt = LocalDateTime.parse(value, BASIC_ISO_FORMATTER);
            return ldt.toInstant(ZoneOffset.UTC).toEpochMilli();
        } catch (DateTimeParseException e1) {
            try {
                LocalDateTime ldt = LocalDateTime.parse(value, BASIC_ISO_NO_MILLIS_FORMATTER);
                return ldt.toInstant(ZoneOffset.UTC).toEpochMilli();
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }
    
    /**
     * Попытка парсинга OffsetDateTime (с таймзоной +03:00).
     */
    private Long tryParseOffsetDateTime(String value) {
        try {
            return OffsetDateTime.parse(value).toInstant().toEpochMilli();
        } catch (DateTimeParseException e) {
            return null;
        }
    }
    
    /**
     * Определяет формат входной строки для логирования.
     */
    private String detectFormat(String value) {
        if (value.matches("\\d{10,14}")) return "TIMESTAMP";
        if (value.matches("\\d{8}T.*")) return "BASIC_ISO";
        if (value.matches("\\d{4}-\\d{2}-\\d{2}T.*")) return "ISO-8601";
        return "UNKNOWN";
    }
    
    /**
     * Проверяет, является ли строка числовым timestamp (10-14 цифр).
     */
    private boolean isNumericTimestamp(String value) {
        if (value == null || value.length() < 10 || value.length() > 14) {
            return false;
        }
        for (char c : value.toCharArray()) {
            if (!Character.isDigit(c)) {
                return false;
            }
        }
        return true;
    }
}
