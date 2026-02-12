package com.projectlibre.api.sync;

import com.projectlibre1.grouping.core.Node;
import com.projectlibre1.grouping.core.OutlineCollection;
import com.projectlibre1.grouping.core.model.NodeModel;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Project;
import com.projectlibre1.pm.task.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit-тесты для WbsHierarchyEngine.
 * Проверяет корректность перестройки wbsChildrenNodes кэша.
 * 
 * <p>Тестовые сценарии (WBS-CACHE.4):</p>
 * <ol>
 *   <li>Rebuild пустого проекта</li>
 *   <li>Rebuild с одной summary task</li>
 *   <li>Rebuild вложенной иерархии</li>
 *   <li>isWbsParent() после rebuild</li>
 *   <li>Null-safety проверки</li>
 * </ol>
 * 
 * @version 1.0.0 (WBS-CACHE.4)
 */
@DisplayName("WbsHierarchyEngine")
class WbsHierarchyEngineTest {

    private WbsHierarchyEngine engine;

    @BeforeEach
    void setUp() {
        engine = new WbsHierarchyEngine();
    }

    @Nested
    @DisplayName("rebuildWbsChildrenCache")
    class RebuildWbsChildrenCacheTest {

        @Test
        @DisplayName("Сценарий 1: Не падает при null project")
        void handlesNullProjectGracefully() {
            // Не должно бросить исключение
            assertDoesNotThrow(() -> engine.rebuildWbsChildrenCache(null));
        }

        @Test
        @DisplayName("Сценарий 1: Не падает при null taskOutlines")
        void handlesNullTaskOutlinesGracefully() {
            Project project = mock(Project.class);
            when(project.getTaskOutlines()).thenReturn(null);
            
            assertDoesNotThrow(() -> engine.rebuildWbsChildrenCache(project));
        }

        @Test
        @DisplayName("Сценарий 1: Не падает при null taskModel")
        void handlesNullTaskModelGracefully() {
            Project project = mock(Project.class);
            OutlineCollection outlines = mock(OutlineCollection.class);
            when(project.getTaskOutlines()).thenReturn(outlines);
            when(outlines.getDefaultOutline()).thenReturn(null);
            
            assertDoesNotThrow(() -> engine.rebuildWbsChildrenCache(project));
        }

        @Test
        @DisplayName("Сценарий 1: Не падает при пустом проекте (root без детей)")
        void handlesEmptyProjectGracefully() {
            Project project = createMockProjectWithTasks(Collections.emptyList());
            
            assertDoesNotThrow(() -> engine.rebuildWbsChildrenCache(project));
        }

        @Test
        @DisplayName("Сценарий 2: Summary task получает children после rebuild")
        void summaryTaskGetsChildrenAfterRebuild() {
            // Создаём иерархию: TASK1 → [TASK2, TASK3]
            NormalTask task1 = createMockTask("TASK1");
            NormalTask task2 = createMockTask("TASK2");
            NormalTask task3 = createMockTask("TASK3");
            
            Node node1 = createNodeForTask(task1);
            Node node2 = createNodeForTask(task2);
            Node node3 = createNodeForTask(task3);
            
            List<Node> task1Children = Arrays.asList(node2, node3);
            
            Project project = createMockProjectWithHierarchy(node1, task1Children);
            
            engine.rebuildWbsChildrenCache(project);
            
            // Проверяем что setWbsChildrenNodes был вызван для TASK1
            verify(task1).setWbsChildrenNodes(task1Children);
        }

        @Test
        @DisplayName("Сценарий 3: Вложенная иерархия — все уровни обновляются")
        void nestedHierarchyAllLevelsUpdated() {
            // Иерархия: TASK1 → TASK2 → TASK3
            NormalTask task1 = createMockTask("TASK1");
            NormalTask task2 = createMockTask("TASK2");
            NormalTask task3 = createMockTask("TASK3");
            
            Node node1 = createNodeForTask(task1);
            Node node2 = createNodeForTask(task2);
            Node node3 = createNodeForTask(task3);
            
            List<Node> task1Children = Collections.singletonList(node2);
            List<Node> task2Children = Collections.singletonList(node3);
            
            Project project = createMockProjectWithNestedHierarchy(
                node1, task1Children, node2, task2Children
            );
            
            engine.rebuildWbsChildrenCache(project);
            
            // Проверяем что оба уровня обновлены
            verify(task1).setWbsChildrenNodes(task1Children);
            verify(task2).setWbsChildrenNodes(task2Children);
        }
    }

    // === Вспомогательные методы ===

    private NormalTask createMockTask(String name) {
        NormalTask task = mock(NormalTask.class);
        when(task.getName()).thenReturn(name);
        return task;
    }

    private Node createNodeForTask(Task task) {
        Node node = mock(Node.class);
        when(node.getImpl()).thenReturn(task);
        return node;
    }

    private Project createMockProjectWithTasks(List<Node> children) {
        Project project = mock(Project.class);
        OutlineCollection outlines = mock(OutlineCollection.class);
        NodeModel taskModel = mock(NodeModel.class);
        Node root = mock(Node.class);
        
        when(project.getTaskOutlines()).thenReturn(outlines);
        when(outlines.getDefaultOutline()).thenReturn(taskModel);
        when(taskModel.getRoot()).thenReturn(root);
        when(taskModel.getChildren(root)).thenReturn(children);
        
        return project;
    }

    private Project createMockProjectWithHierarchy(Node parentNode, List<Node> children) {
        Project project = mock(Project.class);
        OutlineCollection outlines = mock(OutlineCollection.class);
        NodeModel taskModel = mock(NodeModel.class);
        Node root = mock(Node.class);
        
        when(project.getTaskOutlines()).thenReturn(outlines);
        when(outlines.getDefaultOutline()).thenReturn(taskModel);
        when(taskModel.getRoot()).thenReturn(root);
        when(taskModel.getChildren(root)).thenReturn(Collections.singletonList(parentNode));
        when(taskModel.getChildren(parentNode)).thenReturn(children);
        
        // Дети не имеют своих детей
        for (Node child : children) {
            when(taskModel.getChildren(child)).thenReturn(Collections.emptyList());
        }
        
        return project;
    }

    private Project createMockProjectWithNestedHierarchy(
            Node node1, List<Node> node1Children, Node node2, List<Node> node2Children) {
        
        Project project = mock(Project.class);
        OutlineCollection outlines = mock(OutlineCollection.class);
        NodeModel taskModel = mock(NodeModel.class);
        Node root = mock(Node.class);
        
        when(project.getTaskOutlines()).thenReturn(outlines);
        when(outlines.getDefaultOutline()).thenReturn(taskModel);
        when(taskModel.getRoot()).thenReturn(root);
        when(taskModel.getChildren(root)).thenReturn(Collections.singletonList(node1));
        when(taskModel.getChildren(node1)).thenReturn(node1Children);
        when(taskModel.getChildren(node2)).thenReturn(node2Children);
        
        // Leaf node не имеет детей
        for (Node child : node2Children) {
            when(taskModel.getChildren(child)).thenReturn(Collections.emptyList());
        }
        
        return project;
    }
}
