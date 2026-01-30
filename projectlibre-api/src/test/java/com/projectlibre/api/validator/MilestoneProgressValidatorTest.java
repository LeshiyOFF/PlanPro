package com.projectlibre.api.validator;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit тесты для {@link MilestoneProgressValidator}.
 * 
 * <p>Проверяет корректность валидации и нормализации прогресса задач.</p>
 * 
 * @author ProjectLibre API Team
 * @version 1.0.0
 */
@DisplayName("MilestoneProgressValidator Tests")
class MilestoneProgressValidatorTest {
    
    @Nested
    @DisplayName("Нормализация прогресса вех (Milestones)")
    class MilestoneProgressNormalizationTests {
        
        @Test
        @DisplayName("Прогресс < 0.5 должен округляться до 0.0")
        void testMilestoneProgressBelowThreshold() {
            assertEquals(0.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.0));
            assertEquals(0.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.1));
            assertEquals(0.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.3));
            assertEquals(0.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.49));
        }
        
        @Test
        @DisplayName("Прогресс >= 0.5 должен округляться до 1.0")
        void testMilestoneProgressAboveThreshold() {
            assertEquals(1.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.5));
            assertEquals(1.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.7));
            assertEquals(1.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.99));
            assertEquals(1.0, MilestoneProgressValidator.normalizeMilestoneProgress(1.0));
        }
        
        @Test
        @DisplayName("Граничное значение 0.5 округляется до 1.0")
        void testMilestoneProgressExactThreshold() {
            assertEquals(1.0, MilestoneProgressValidator.normalizeMilestoneProgress(0.5));
        }
        
        @Test
        @DisplayName("Недопустимое значение < 0 должно бросить исключение")
        void testMilestoneProgressBelowZero() {
            assertThrows(IllegalArgumentException.class, 
                () -> MilestoneProgressValidator.normalizeMilestoneProgress(-0.1));
        }
        
        @Test
        @DisplayName("Недопустимое значение > 1 должно бросить исключение")
        void testMilestoneProgressAboveOne() {
            assertThrows(IllegalArgumentException.class, 
                () -> MilestoneProgressValidator.normalizeMilestoneProgress(1.5));
        }
    }
    
    @Nested
    @DisplayName("Нормализация прогресса обычных задач")
    class TaskProgressNormalizationTests {
        
        @Test
        @DisplayName("Прогресс должен округляться до 2 знаков после запятой")
        void testTaskProgressRoundingToTwoDecimals() {
            assertEquals(0.18, MilestoneProgressValidator.normalizeTaskProgress(0.18));
            assertEquals(0.19, MilestoneProgressValidator.normalizeTaskProgress(0.185));
            assertEquals(0.18, MilestoneProgressValidator.normalizeTaskProgress(0.184));
            assertEquals(0.50, MilestoneProgressValidator.normalizeTaskProgress(0.5));
        }
        
        @ParameterizedTest
        @ValueSource(doubles = {0.0, 0.25, 0.5, 0.75, 1.0})
        @DisplayName("Точные значения должны оставаться без изменений")
        void testTaskProgressExactValues(double progress) {
            assertEquals(progress, MilestoneProgressValidator.normalizeTaskProgress(progress), 0.001);
        }
        
        @Test
        @DisplayName("Граничные значения 0 и 1 обрабатываются корректно")
        void testTaskProgressBoundaries() {
            assertEquals(0.0, MilestoneProgressValidator.normalizeTaskProgress(0.0));
            assertEquals(1.0, MilestoneProgressValidator.normalizeTaskProgress(1.0));
        }
        
        @Test
        @DisplayName("Недопустимое значение < 0 должно бросить исключение")
        void testTaskProgressBelowZero() {
            assertThrows(IllegalArgumentException.class, 
                () -> MilestoneProgressValidator.normalizeTaskProgress(-0.05));
        }
        
        @Test
        @DisplayName("Недопустимое значение > 1 должно бросить исключение")
        void testTaskProgressAboveOne() {
            assertThrows(IllegalArgumentException.class, 
                () -> MilestoneProgressValidator.normalizeTaskProgress(1.1));
        }
    }
    
    @Nested
    @DisplayName("Универсальная нормализация (normalizeProgress)")
    class UniversalNormalizationTests {
        
        @Test
        @DisplayName("Для вех применяется milestone-логика")
        void testNormalizeProgressForMilestone() {
            assertEquals(0.0, MilestoneProgressValidator.normalizeProgress(0.3, true));
            assertEquals(1.0, MilestoneProgressValidator.normalizeProgress(0.7, true));
        }
        
        @Test
        @DisplayName("Для обычных задач применяется task-логика")
        void testNormalizeProgressForTask() {
            assertEquals(0.18, MilestoneProgressValidator.normalizeProgress(0.18, false));
            assertEquals(0.19, MilestoneProgressValidator.normalizeProgress(0.185, false));
        }
    }
    
    @Nested
    @DisplayName("Валидация прогресса без нормализации")
    class ProgressValidationTests {
        
        @Test
        @DisplayName("isValidMilestoneProgress: только 0.0 и 1.0 валидны")
        void testIsValidMilestoneProgress() {
            assertTrue(MilestoneProgressValidator.isValidMilestoneProgress(0.0));
            assertTrue(MilestoneProgressValidator.isValidMilestoneProgress(1.0));
            
            assertFalse(MilestoneProgressValidator.isValidMilestoneProgress(0.5));
            assertFalse(MilestoneProgressValidator.isValidMilestoneProgress(0.3));
        }
        
        @Test
        @DisplayName("isValidTaskProgress: диапазон [0, 1] валиден")
        void testIsValidTaskProgress() {
            assertTrue(MilestoneProgressValidator.isValidTaskProgress(0.0));
            assertTrue(MilestoneProgressValidator.isValidTaskProgress(0.5));
            assertTrue(MilestoneProgressValidator.isValidTaskProgress(1.0));
            
            assertFalse(MilestoneProgressValidator.isValidTaskProgress(-0.1));
            assertFalse(MilestoneProgressValidator.isValidTaskProgress(1.5));
        }
    }
    
    @Nested
    @DisplayName("Edge Cases и производительность")
    class EdgeCasesTests {
        
        @Test
        @DisplayName("Прецизионность: IEEE 754 артефакты устраняются")
        void testIEEE754PrecisionArtifacts() {
            double problematicValue = 0.18000000000000002;
            double normalized = MilestoneProgressValidator.normalizeTaskProgress(problematicValue);
            
            assertEquals(0.18, normalized, 0.0001);
        }
        
        @Test
        @DisplayName("Производительность: 10000 нормализаций за < 100ms")
        void testPerformance() {
            long start = System.currentTimeMillis();
            
            for (int i = 0; i < 10000; i++) {
                MilestoneProgressValidator.normalizeProgress(0.5, i % 2 == 0);
            }
            
            long duration = System.currentTimeMillis() - start;
            assertTrue(duration < 100, "Performance test failed: " + duration + "ms");
        }
    }
}
