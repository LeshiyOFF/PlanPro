package com.projectlibre.api.util;

import java.text.Normalizer;
import java.util.Locale;

/**
 * Нормализатор имён календарей для консистентного сравнения и хранения.
 * 
 * Решает проблемы:
 * - "Календарь" vs "календарь" (регистр) — для сравнения
 * - "Мой  календарь" vs "Мой календарь" (whitespace)
 * - Unicode-нормализация (NFC)
 * 
 * КРИТИЧЕСКОЕ ИЗМЕНЕНИЕ V2.0:
 * - sanitize() больше НЕ делает lowercase — сохраняет оригинальный регистр
 * - Добавлен sanitizeForComparison() для lowercase сравнения
 * - Это исправляет баг с "КАСТОМ" → "кастом" → "Кастом"
 * 
 * Clean Architecture: Utility (Domain Layer).
 * SOLID: Single Responsibility - только нормализация имён.
 * 
 * @author ProjectLibre Team
 * @version 2.0.0
 */
public final class CalendarNameNormalizer {
    
    private CalendarNameNormalizer() { }
    
    /**
     * Полная нормализация имени для сравнения (case-insensitive).
     * 
     * @param name исходное имя
     * @return нормализованное имя (lowercase, trimmed, NFC)
     */
    public static String normalize(String name) {
        if (name == null) return "";
        
        String result = name;
        
        result = Normalizer.normalize(result, Normalizer.Form.NFC);
        result = result.trim().replaceAll("\\s+", " ");
        result = result.toLowerCase(Locale.ROOT);
        
        return result;
    }
    
    /**
     * Проверяет, эквивалентны ли два имени после нормализации.
     * 
     * @param name1 первое имя
     * @param name2 второе имя
     * @return true если имена эквивалентны
     */
    public static boolean areEquivalent(String name1, String name2) {
        return normalize(name1).equals(normalize(name2));
    }
    
    /**
     * Санитизация для использования в ID — СОХРАНЯЕТ ОРИГИНАЛЬНЫЙ РЕГИСТР.
     * Удаляет спецсимволы, заменяет пробелы на подчёркивания.
     * 
     * V2.0: Не делает lowercase — это критическое исправление бага!
     * 
     * @param name исходное имя
     * @return санитизированное имя для ID с сохранением регистра
     */
    public static String sanitize(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "unnamed";
        }
        
        return name.trim()
            .replaceAll("[^a-zA-Zа-яА-ЯёЁ0-9\\s-]", "")
            .replaceAll("\\s+", "_");
    }
    
    /**
     * Санитизация для сравнения (lowercase).
     * Используется только для поиска и сравнения ID, не для хранения.
     * 
     * @param name исходное имя
     * @return санитизированное имя в lowercase для сравнения
     */
    public static String sanitizeForComparison(String name) {
        return sanitize(name).toLowerCase(Locale.ROOT);
    }
    
    /**
     * Восстанавливает читаемое имя из санитизированной версии.
     * V2.0: Просто заменяет подчёркивания на пробелы, БЕЗ изменения регистра.
     * 
     * @param sanitized санитизированное имя
     * @return читаемое имя с пробелами
     */
    public static String reconstruct(String sanitized) {
        if (sanitized == null || sanitized.isEmpty()) {
            return "";
        }
        
        return sanitized.replace("_", " ").trim();
    }
    
    /**
     * Извлекает имя календаря из calendarId формата custom_<uniqueId>_<name>.
     * Сохраняет оригинальный регистр имени.
     * 
     * @param calendarId ID календаря
     * @return извлечённое имя или null
     */
    public static String extractNameFromCalendarId(String calendarId) {
        if (calendarId == null || !calendarId.startsWith("custom_")) {
            return null;
        }
        
        String withoutPrefix = calendarId.substring(7);
        int underscoreIndex = withoutPrefix.indexOf('_');
        
        if (underscoreIndex < 0 || underscoreIndex >= withoutPrefix.length() - 1) {
            return null;
        }
        
        String sanitizedName = withoutPrefix.substring(underscoreIndex + 1);
        return reconstruct(sanitizedName);
    }
}
