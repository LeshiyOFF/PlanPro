package com.projectlibre.api.sync;

import com.projectlibre1.pm.dependency.Dependency;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit-тесты для DependencyRemovalService.
 * Проверяет логику получения ID предшественников.
 * 
 * @version 1.0.0 (DEP-SYNC.5)
 */
@DisplayName("DependencyRemovalService")
class DependencyRemovalServiceTest {

    private static final String EVENT_SOURCE = "TEST_EVENT_SOURCE";
    private DependencyRemovalService service;

    @BeforeEach
    void setUp() {
        service = new DependencyRemovalService(EVENT_SOURCE);
    }

    @Nested
    @DisplayName("extractTaskId")
    class ExtractTaskIdTest {

        @Test
        @DisplayName("Возвращает customText(0) когда установлен")
        void returnsCustomTextWhenSet() {
            Task task = mock(Task.class);
            when(task.getCustomText(0)).thenReturn("task-id-123");
            when(task.getName()).thenReturn("Task Name");

            String result = service.extractTaskId(task);

            assertEquals("task-id-123", result);
        }

        @Test
        @DisplayName("Fallback на name когда customText пустой")
        void fallsBackToNameWhenCustomTextEmpty() {
            Task task = mock(Task.class);
            when(task.getCustomText(0)).thenReturn("");
            when(task.getName()).thenReturn("Task Name");

            String result = service.extractTaskId(task);

            assertEquals("Task Name", result);
        }

        @Test
        @DisplayName("Fallback на name когда customText null")
        void fallsBackToNameWhenCustomTextNull() {
            Task task = mock(Task.class);
            when(task.getCustomText(0)).thenReturn(null);
            when(task.getName()).thenReturn("Task Name");

            String result = service.extractTaskId(task);

            assertEquals("Task Name", result);
        }
    }

    @Nested
    @DisplayName("getCurrentPredecessorIds")
    class GetCurrentPredecessorIdsTest {

        @Test
        @DisplayName("Возвращает пустой Set для задачи без predecessors")
        void returnsEmptySetForTaskWithoutPredecessors() {
            NormalTask task = createMockTaskWithPredecessors(Collections.emptySet());

            Set<String> result = service.getCurrentPredecessorIds(task);

            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("Возвращает ID одного predecessor")
        void returnsSinglePredecessorId() {
            Set<String> predIds = Set.of("pred-1");
            NormalTask task = createMockTaskWithPredecessors(predIds);

            Set<String> result = service.getCurrentPredecessorIds(task);

            assertEquals(predIds, result);
        }

        @Test
        @DisplayName("Возвращает ID нескольких predecessors")
        void returnsMultiplePredecessorIds() {
            Set<String> predIds = Set.of("pred-1", "pred-2", "pred-3");
            NormalTask task = createMockTaskWithPredecessors(predIds);

            Set<String> result = service.getCurrentPredecessorIds(task);

            assertEquals(predIds, result);
        }
    }

    @Nested
    @DisplayName("removedCount")
    class RemovedCountTest {

        @Test
        @DisplayName("Начальный счётчик равен нулю")
        void initialCountIsZero() {
            assertEquals(0, service.getRemovedCount());
        }

        @Test
        @DisplayName("resetRemovedCount сбрасывает счётчик")
        void resetClearsCount() {
            service.resetRemovedCount();
            assertEquals(0, service.getRemovedCount());
        }
    }

    /**
     * Создаёт mock задачи с заданными ID предшественников.
     */
    private NormalTask createMockTaskWithPredecessors(Set<String> predecessorIds) {
        NormalTask task = mock(NormalTask.class);
        
        Set<Dependency> dependencies = new HashSet<>();
        for (String predId : predecessorIds) {
            Task predTask = mock(Task.class);
            when(predTask.getCustomText(0)).thenReturn(predId);
            
            Dependency dep = mock(Dependency.class);
            when(dep.getPredecessor()).thenReturn(predTask);
            dependencies.add(dep);
        }

        @SuppressWarnings("unchecked")
        Iterator<Dependency> iterator = (Iterator<Dependency>) dependencies.iterator();
        
        // Создаём mock для predecessorList
        var predecessorList = mock(com.projectlibre1.association.AssociationList.class);
        when(predecessorList.iterator()).thenReturn(iterator);
        when(task.getPredecessorList()).thenReturn(predecessorList);

        return task;
    }
}
