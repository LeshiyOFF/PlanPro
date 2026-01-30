package com.projectlibre.api.converter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit тесты для DateTimeMapper.
 * 
 * Проверяет корректность парсинга и форматирования дат в различных форматах:
 * - ISO-8601 (основной формат)
 * - BASIC_ISO (без дефисов)
 * - OffsetDateTime (с таймзоной)
 * - Legacy timestamp (число)
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@DisplayName("DateTimeMapper Tests")
class DateTimeMapperTest {
    
    private DateTimeMapper mapper;
    
    @BeforeEach
    void setUp() {
        mapper = new DateTimeMapper();
    }
    
    @Nested
    @DisplayName("toIsoString() - Конвертация millis в ISO-8601")
    class ToIsoStringTests {
        
        @Test
        @DisplayName("Должен конвертировать валидный timestamp в ISO-8601")
        void shouldConvertValidTimestamp() {
            long millis = 1738098000000L;
            String result = mapper.toIsoString(millis);
            
            assertNotNull(result);
            assertTrue(result.contains("-"), "Должен содержать дефисы ISO-8601");
            assertTrue(result.contains("T"), "Должен содержать разделитель T");
            assertTrue(result.endsWith("Z"), "Должен заканчиваться на Z (UTC)");
        }
        
        @Test
        @DisplayName("Должен возвращать null для нулевого timestamp")
        void shouldReturnNullForZeroTimestamp() {
            assertNull(mapper.toIsoString(0));
        }
        
        @Test
        @DisplayName("Должен возвращать null для отрицательного timestamp")
        void shouldReturnNullForNegativeTimestamp() {
            assertNull(mapper.toIsoString(-1000));
        }
    }
    
    @Nested
    @DisplayName("toMillis() - Парсинг строки даты")
    class ToMillisTests {
        
        @Test
        @DisplayName("Должен парсить стандартный ISO-8601 формат")
        void shouldParseStandardIso8601() {
            String isoDate = "2026-01-28T21:00:00.000Z";
            long result = mapper.toMillis(isoDate);
            
            assertTrue(result > 0, "Результат должен быть положительным");
        }
        
        @Test
        @DisplayName("Должен парсить BASIC_ISO формат (без дефисов)")
        void shouldParseBasicIsoFormat() {
            String basicIsoDate = "20260128T21:00:00.000Z";
            long result = mapper.toMillis(basicIsoDate);
            
            assertTrue(result > 0, "BASIC_ISO формат должен парситься");
        }
        
        @Test
        @DisplayName("Должен парсить BASIC_ISO формат без миллисекунд")
        void shouldParseBasicIsoWithoutMillis() {
            String basicIsoDate = "20260128T21:00:00Z";
            long result = mapper.toMillis(basicIsoDate);
            
            assertTrue(result > 0, "BASIC_ISO без миллисекунд должен парситься");
        }
        
        @Test
        @DisplayName("Должен парсить OffsetDateTime с таймзоной")
        void shouldParseOffsetDateTime() {
            String offsetDate = "2026-01-28T21:00:00+03:00";
            long result = mapper.toMillis(offsetDate);
            
            assertTrue(result > 0, "OffsetDateTime должен парситься");
        }
        
        @Test
        @DisplayName("Должен парсить числовой timestamp")
        void shouldParseNumericTimestamp() {
            String timestamp = "1738098000000";
            long result = mapper.toMillis(timestamp);
            
            assertEquals(1738098000000L, result);
        }
        
        @Test
        @DisplayName("Должен возвращать 0 для null")
        void shouldReturnZeroForNull() {
            assertEquals(0L, mapper.toMillis(null));
        }
        
        @Test
        @DisplayName("Должен возвращать 0 для пустой строки")
        void shouldReturnZeroForEmptyString() {
            assertEquals(0L, mapper.toMillis(""));
            assertEquals(0L, mapper.toMillis("   "));
        }
        
        @Test
        @DisplayName("Должен возвращать 0 для невалидной строки")
        void shouldReturnZeroForInvalidString() {
            assertEquals(0L, mapper.toMillis("invalid-date"));
            assertEquals(0L, mapper.toMillis("2026/01/28"));
        }
    }
    
    @Nested
    @DisplayName("Round-trip тесты")
    class RoundTripTests {
        
        @Test
        @DisplayName("Конвертация millis -> ISO -> millis должна сохранять значение")
        void shouldPreserveValueInRoundTrip() {
            long originalMillis = 1738098000000L;
            
            String isoString = mapper.toIsoString(originalMillis);
            long restoredMillis = mapper.toMillis(isoString);
            
            assertEquals(originalMillis, restoredMillis);
        }
    }
}
