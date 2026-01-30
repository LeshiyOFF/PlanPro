package com.projectlibre.api.test.integration;

import com.projectlibre.api.converter.DateTimeMapper;
import com.projectlibre.api.dto.ProjectDto;
import com.projectlibre.api.streaming.ProjectItemSerializer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Интеграционные тесты для проверки полного цикла работы с датами.
 * 
 * Проверяет взаимодействие компонентов:
 * - DateTimeMapper (парсинг/форматирование)
 * - ProjectItemSerializer (JSON сериализация)
 * - JacksonConfig (конфигурация ObjectMapper)
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@DisplayName("Date Serialization Integration Tests")
class DateSerializationIntegrationTest {
    
    private DateTimeMapper dateTimeMapper;
    private ProjectItemSerializer projectSerializer;
    
    @BeforeEach
    void setUp() {
        dateTimeMapper = new DateTimeMapper();
        projectSerializer = ProjectItemSerializer.getInstance();
    }
    
    @Nested
    @DisplayName("Frontend -> Backend -> Frontend Round-Trip")
    class RoundTripTests {
        
        @Test
        @DisplayName("ISO-8601 дата должна сохраняться при round-trip")
        void isoDateShouldSurviveRoundTrip() {
            String frontendDate = "2026-01-28T21:00:00.000Z";
            
            long backendMillis = dateTimeMapper.toMillis(frontendDate);
            String restoredDate = dateTimeMapper.toIsoString(backendMillis);
            long finalMillis = dateTimeMapper.toMillis(restoredDate);
            
            assertEquals(backendMillis, finalMillis, "Миллисекунды должны совпадать");
            assertTrue(restoredDate.contains("-"), "Формат должен быть ISO-8601");
        }
        
        @Test
        @DisplayName("BASIC_ISO дата должна конвертироваться в ISO-8601")
        void basicIsoShouldConvertToIso() {
            String basicIsoDate = "20260128T21:00:00.000Z";
            
            long millis = dateTimeMapper.toMillis(basicIsoDate);
            String isoDate = dateTimeMapper.toIsoString(millis);
            
            assertTrue(millis > 0, "Должен успешно распарситься");
            assertTrue(isoDate.contains("-"), "Результат должен быть в ISO-8601");
            assertFalse(isoDate.startsWith("2026012"), "Не должен быть BASIC_ISO");
        }
    }
    
    @Nested
    @DisplayName("ProjectDto Serialization")
    class ProjectSerializationTests {
        
        @Test
        @DisplayName("ProjectDto с датами должен сериализоваться в ISO-8601")
        void projectWithDatesShouldSerializeToIso() {
            ProjectDto project = new ProjectDto();
            project.setId(1L);
            project.setName("Test Project");
            project.setStartDate(LocalDateTime.of(2026, 1, 28, 10, 0));
            project.setEndDate(LocalDateTime.of(2026, 2, 28, 18, 0));
            
            String json = projectSerializer.serialize(project);
            
            assertTrue(json.contains("2026-01-28"), "startDate в ISO-8601");
            assertTrue(json.contains("2026-02-28"), "endDate в ISO-8601");
            assertFalse(json.matches(".*\\d{8}T.*"), "Не должно быть BASIC_ISO");
        }
    }
    
    @Nested
    @DisplayName("Все поддерживаемые форматы")
    class AllFormatsTests {
        
        @Test
        @DisplayName("Должен парсить все форматы без ошибок")
        void shouldParseAllFormats() {
            String[] testDates = {
                "2026-01-28T21:00:00.000Z",
                "2026-01-28T21:00:00Z",
                "20260128T21:00:00.000Z",
                "20260128T21:00:00Z",
                "2026-01-28T21:00:00+03:00",
                "1738098000000"
            };
            
            for (String date : testDates) {
                long result = dateTimeMapper.toMillis(date);
                assertTrue(result > 0, "Формат '" + date + "' должен парситься");
            }
        }
        
        @Test
        @DisplayName("Все форматы должны давать одинаковый результат для одной даты")
        void allFormatsShouldGiveSameResultForSameDate() {
            long isoResult = dateTimeMapper.toMillis("2026-01-28T21:00:00.000Z");
            long basicIsoResult = dateTimeMapper.toMillis("20260128T21:00:00.000Z");
            
            assertEquals(isoResult, basicIsoResult, 
                "ISO-8601 и BASIC_ISO должны давать одинаковый timestamp");
        }
    }
    
    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {
        
        @Test
        @DisplayName("Пустые и null значения не должны вызывать исключений")
        void emptyAndNullShouldNotThrow() {
            assertDoesNotThrow(() -> dateTimeMapper.toMillis(null));
            assertDoesNotThrow(() -> dateTimeMapper.toMillis(""));
            assertDoesNotThrow(() -> dateTimeMapper.toMillis("   "));
            assertDoesNotThrow(() -> dateTimeMapper.toIsoString(0));
            assertDoesNotThrow(() -> dateTimeMapper.toIsoString(-1));
        }
        
        @Test
        @DisplayName("Невалидные даты должны возвращать 0 без исключений")
        void invalidDatesShouldReturnZero() {
            assertEquals(0L, dateTimeMapper.toMillis("invalid"));
            assertEquals(0L, dateTimeMapper.toMillis("2026/01/28"));
            assertEquals(0L, dateTimeMapper.toMillis("28-01-2026"));
        }
    }
}
