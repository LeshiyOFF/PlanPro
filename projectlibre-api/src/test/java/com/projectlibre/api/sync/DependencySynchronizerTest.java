package com.projectlibre.api.sync;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit-тесты для DependencySynchronizer.
 * Проверяет логику идемпотентной синхронизации: set difference расчёты.
 * 
 * <p>Сценарии согласно DEP-SYNC.5:</p>
 * <ol>
 *   <li>Создать связь: Frontend [A→B], Core [] → add B</li>
 *   <li>Удалить связь: Frontend [], Core [A→B] → remove B</li>
 *   <li>Заменить связь: Frontend [A→C], Core [A→B] → remove B, add C</li>
 *   <li>Нет изменений: Frontend [A→B], Core [A→B] → no changes</li>
 *   <li>Удалить все: Frontend [], Core [A→B, A→C] → remove B,C</li>
 *   <li>Добавить несколько: Frontend [A→B, A→C], Core [] → add B,C</li>
 *   <li>Смешанный: Frontend [A→B, A→D], Core [A→B, A→C] → remove C, add D</li>
 * </ol>
 * 
 * @version 1.0.0 (DEP-SYNC.5)
 */
@DisplayName("DependencySynchronizer")
class DependencySynchronizerTest {

    private DependencySynchronizer synchronizer;

    @BeforeEach
    void setUp() {
        synchronizer = new DependencySynchronizer();
    }

    @Nested
    @DisplayName("calculateSetDifference (via reflection)")
    class SetDifferenceTest {

        @Test
        @DisplayName("Сценарий 1: Создать связь — Frontend [B], Core [] → toAdd=[B]")
        void scenario1_createLink() throws Exception {
            Set<String> current = Set.of();
            Set<String> newPreds = Set.of("B");

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertTrue(toRemove.isEmpty(), "toRemove должен быть пустым");
            assertEquals(Set.of("B"), toAdd, "toAdd должен содержать B");
        }

        @Test
        @DisplayName("Сценарий 2: Удалить связь — Frontend [], Core [B] → toRemove=[B]")
        void scenario2_deleteLink() throws Exception {
            Set<String> current = Set.of("B");
            Set<String> newPreds = Set.of();

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertEquals(Set.of("B"), toRemove, "toRemove должен содержать B");
            assertTrue(toAdd.isEmpty(), "toAdd должен быть пустым");
        }

        @Test
        @DisplayName("Сценарий 3: Заменить связь — Frontend [C], Core [B] → remove B, add C")
        void scenario3_replaceLink() throws Exception {
            Set<String> current = Set.of("B");
            Set<String> newPreds = Set.of("C");

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertEquals(Set.of("B"), toRemove);
            assertEquals(Set.of("C"), toAdd);
        }

        @Test
        @DisplayName("Сценарий 4: Нет изменений — Frontend [B], Core [B] → no changes")
        void scenario4_noChanges() throws Exception {
            Set<String> current = Set.of("B");
            Set<String> newPreds = Set.of("B");

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertTrue(toRemove.isEmpty());
            assertTrue(toAdd.isEmpty());
        }

        @Test
        @DisplayName("Сценарий 5: Удалить все — Frontend [], Core [B,C] → remove B,C")
        void scenario5_deleteAll() throws Exception {
            Set<String> current = Set.of("B", "C");
            Set<String> newPreds = Set.of();

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertEquals(Set.of("B", "C"), toRemove);
            assertTrue(toAdd.isEmpty());
        }

        @Test
        @DisplayName("Сценарий 6: Добавить несколько — Frontend [B,C], Core [] → add B,C")
        void scenario6_addMultiple() throws Exception {
            Set<String> current = Set.of();
            Set<String> newPreds = Set.of("B", "C");

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertTrue(toRemove.isEmpty());
            assertEquals(Set.of("B", "C"), toAdd);
        }

        @Test
        @DisplayName("Сценарий 7: Смешанный — Frontend [B,D], Core [B,C] → remove C, add D")
        void scenario7_mixed() throws Exception {
            Set<String> current = Set.of("B", "C");
            Set<String> newPreds = Set.of("B", "D");

            Set<String> toRemove = invokeCalculateSetDifference(current, newPreds);
            Set<String> toAdd = invokeCalculateSetDifference(newPreds, current);

            assertEquals(Set.of("C"), toRemove);
            assertEquals(Set.of("D"), toAdd);
        }

        /**
         * Вызывает private метод calculateSetDifference через reflection.
         */
        @SuppressWarnings("unchecked")
        private Set<String> invokeCalculateSetDifference(Set<String> source, Set<String> toSubtract) 
                throws Exception {
            Method method = DependencySynchronizer.class.getDeclaredMethod(
                    "calculateSetDifference", Set.class, Set.class);
            method.setAccessible(true);
            return (Set<String>) method.invoke(synchronizer, 
                    new HashSet<>(source), new HashSet<>(toSubtract));
        }
    }

    @Nested
    @DisplayName("Counters")
    class CountersTest {

        @Test
        @DisplayName("Начальные счётчики равны нулю")
        void initialCountersAreZero() {
            assertEquals(0, synchronizer.getCreatedCount());
            assertEquals(0, synchronizer.getRemovedCount());
            assertEquals(0, synchronizer.getSkippedCount());
        }
    }
}
