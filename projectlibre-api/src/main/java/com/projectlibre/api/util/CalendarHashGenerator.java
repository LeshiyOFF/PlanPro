package com.projectlibre.api.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Генератор детерминистических хешей для идентификации календарей.
 * 
 * Использует SHA-1 вместо String.hashCode() для:
 * - Минимизации коллизий (160 бит vs 32 бита)
 * - Стабильности между JVM-версиями
 * - Криптографической надёжности
 * 
 * Clean Architecture: Utility (Infrastructure Layer).
 * SOLID: Single Responsibility - только генерация хешей.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public final class CalendarHashGenerator {
    
    private static final int HASH_LENGTH = 12;
    private static final Object DIGEST_LOCK = new Object();
    private static MessageDigest sha1Digest;
    
    static {
        try {
            sha1Digest = MessageDigest.getInstance("SHA-1");
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-1 not available", e);
        }
    }
    
    private CalendarHashGenerator() { }
    
    /**
     * Генерирует детерминистический хеш для имени календаря.
     * 
     * @param name Имя календаря (будет нормализовано)
     * @return 12-символьный hex-хеш (например: "a1b2c3d4e5f6")
     */
    public static String generateHash(String name) {
        if (name == null || name.isEmpty()) {
            return "000000000000";
        }
        
        String normalized = CalendarNameNormalizer.normalize(name);
        
        byte[] hashBytes;
        synchronized (DIGEST_LOCK) {
            sha1Digest.reset();
            hashBytes = sha1Digest.digest(normalized.getBytes(StandardCharsets.UTF_8));
        }
        
        return bytesToHex(hashBytes, HASH_LENGTH);
    }
    
    /**
     * Генерирует хеш из сырой строки без нормализации.
     * Используется для тестирования.
     */
    public static String generateRawHash(String input) {
        if (input == null || input.isEmpty()) {
            return "000000000000";
        }
        
        byte[] hashBytes;
        synchronized (DIGEST_LOCK) {
            sha1Digest.reset();
            hashBytes = sha1Digest.digest(input.getBytes(StandardCharsets.UTF_8));
        }
        
        return bytesToHex(hashBytes, HASH_LENGTH);
    }
    
    /**
     * Проверяет, возможна ли коллизия между двумя именами.
     * Используется для тестирования и валидации.
     */
    public static boolean wouldCollide(String name1, String name2) {
        return generateHash(name1).equals(generateHash(name2));
    }
    
    private static String bytesToHex(byte[] bytes, int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < bytes.length && sb.length() < length; i++) {
            sb.append(String.format("%02x", bytes[i]));
        }
        return sb.substring(0, Math.min(sb.length(), length));
    }
}
