package com.projectlibre.api.sync;

import com.projectlibre.api.dto.TaskSyncRequestDto.FrontendTaskDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit-тесты для логики CONSTRAINT-FIX.
 * Проверяет корректность определения типа ограничения по стандарту MS Project.
 * 
 * <p>Сценарии:</p>
 * <ol>
 *   <li>Задача без predecessors с явной датой → SNET</li>
 *   <li>Задача с predecessors → ASAP</li>
 *   <li>Параллельные задачи → независимые SNET</li>
 * </ol>
 * 
 * @version 1.0.0 (CONSTRAINT-FIX.4)
 */
@DisplayName("Constraint Logic (MS Project Standard)")
class ConstraintLogicTest {

    @Nested
    @DisplayName("FrontendTaskDto predecessor detection")
    class PredecessorDetectionTest {

        @Test
        @DisplayName("Задача без predecessors: hasPredecessors = false")
        void taskWithoutPredecessors() {
            FrontendTaskDto task = createTask("TASK-1", "Task A", "2026-03-17", null);
            
            boolean hasPredecessors = task.getPredecessors() != null 
                                    && !task.getPredecessors().isEmpty();
            
            assertFalse(hasPredecessors, "Задача без predecessors должна вернуть false");
        }

        @Test
        @DisplayName("Задача с пустым списком predecessors: hasPredecessors = false")
        void taskWithEmptyPredecessors() {
            FrontendTaskDto task = createTask("TASK-1", "Task A", "2026-03-17", null);
            task.setPredecessors(Collections.emptyList());
            
            boolean hasPredecessors = task.getPredecessors() != null 
                                    && !task.getPredecessors().isEmpty();
            
            assertFalse(hasPredecessors, "Задача с пустым списком должна вернуть false");
        }

        @Test
        @DisplayName("Задача с одним predecessor: hasPredecessors = true")
        void taskWithOnePredecessor() {
            FrontendTaskDto task = createTask("TASK-2", "Task B", "2026-03-20", "TASK-1");
            
            boolean hasPredecessors = task.getPredecessors() != null 
                                    && !task.getPredecessors().isEmpty();
            
            assertTrue(hasPredecessors, "Задача с predecessor должна вернуть true");
        }

        @Test
        @DisplayName("Задача с несколькими predecessors: hasPredecessors = true")
        void taskWithMultiplePredecessors() {
            FrontendTaskDto task = new FrontendTaskDto();
            task.setId("TASK-3");
            task.setName("Task C");
            task.setStartDate("2026-03-25T00:00:00.000Z");
            task.setPredecessors(Arrays.asList("TASK-1", "TASK-2"));
            
            boolean hasPredecessors = task.getPredecessors() != null 
                                    && !task.getPredecessors().isEmpty();
            
            assertTrue(hasPredecessors, "Задача с несколькими predecessors должна вернуть true");
            assertEquals(2, task.getPredecessors().size());
        }
    }

    @Nested
    @DisplayName("Constraint type decision")
    class ConstraintTypeDecisionTest {

        @Test
        @DisplayName("SNET для задачи без predecessors с явной датой")
        void snetForTaskWithoutPredecessors() {
            FrontendTaskDto task = createTask("TASK-1", "Parallel Task", "2026-03-17", null);
            
            // По логике CONSTRAINT-FIX: нет predecessors → SNET
            String expectedConstraint = shouldUseSnet(task) ? "SNET" : "ASAP";
            
            assertEquals("SNET", expectedConstraint);
        }

        @Test
        @DisplayName("ASAP для задачи с predecessors")
        void asapForTaskWithPredecessors() {
            FrontendTaskDto task = createTask("TASK-2", "Dependent Task", "2026-03-20", "TASK-1");
            
            // По логике CONSTRAINT-FIX: есть predecessors → ASAP
            String expectedConstraint = shouldUseSnet(task) ? "SNET" : "ASAP";
            
            assertEquals("ASAP", expectedConstraint);
        }

        @Test
        @DisplayName("Параллельные задачи: обе получают SNET")
        void parallelTasksBothGetSnet() {
            FrontendTaskDto taskA = createTask("TASK-A", "Branch A", "2026-02-06", null);
            FrontendTaskDto taskB = createTask("TASK-B", "Branch B", "2026-03-17", null);
            
            assertTrue(shouldUseSnet(taskA), "Branch A без predecessors → SNET");
            assertTrue(shouldUseSnet(taskB), "Branch B без predecessors → SNET");
        }
    }

    @Nested
    @DisplayName("FrontendTaskDto constraint fields")
    class ConstraintFieldsTest {

        @Test
        @DisplayName("constraintType поле по умолчанию null")
        void constraintTypeDefaultNull() {
            FrontendTaskDto task = new FrontendTaskDto();
            assertNull(task.getConstraintType());
        }

        @Test
        @DisplayName("constraintType может быть установлен")
        void constraintTypeCanBeSet() {
            FrontendTaskDto task = new FrontendTaskDto();
            task.setConstraintType("SNET");
            assertEquals("SNET", task.getConstraintType());
        }

        @Test
        @DisplayName("constraintDate может быть установлен")
        void constraintDateCanBeSet() {
            FrontendTaskDto task = new FrontendTaskDto();
            task.setConstraintDate("2026-03-17T00:00:00.000Z");
            assertEquals("2026-03-17T00:00:00.000Z", task.getConstraintDate());
        }
    }

    /**
     * Создаёт тестовую задачу.
     */
    private FrontendTaskDto createTask(String id, String name, String startDate, 
                                       String predecessorId) {
        FrontendTaskDto task = new FrontendTaskDto();
        task.setId(id);
        task.setName(name);
        task.setStartDate(startDate + "T00:00:00.000Z");
        task.setEndDate(startDate + "T00:00:00.000Z");
        if (predecessorId != null) {
            task.setPredecessors(Arrays.asList(predecessorId));
        } else {
            task.setPredecessors(Collections.emptyList());
        }
        return task;
    }

    /**
     * Логика определения SNET (реплика из ApiToCoreTaskSynchronizer).
     */
    private boolean shouldUseSnet(FrontendTaskDto task) {
        boolean hasPredecessors = task.getPredecessors() != null 
                                && !task.getPredecessors().isEmpty();
        return !hasPredecessors;
    }
}
