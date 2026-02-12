package com.projectlibre.api.sync;

import com.projectlibre1.pm.dependency.Dependency;
import com.projectlibre1.pm.dependency.DependencyService;
import com.projectlibre1.pm.task.NormalTask;
import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

/**
 * Сервис удаления устаревших зависимостей из Core Project.
 * 
 * <p>Безопасно удаляет зависимости: сначала собирает в список,
 * затем удаляет (избегает ConcurrentModificationException).</p>
 * 
 * <p><b>КРИТИЧНО:</b> undo=false — не загрязняет Undo-стек пользователя.</p>
 * 
 * @author ProjectLibre Team
 * @version 1.0.0 (DEP-SYNC)
 */
public class DependencyRemovalService {

    private static final Logger log = LoggerFactory.getLogger(DependencyRemovalService.class);

    private final String eventSourceMarker;
    private int removedCount;

    public DependencyRemovalService(String eventSourceMarker) {
        this.eventSourceMarker = eventSourceMarker;
        this.removedCount = 0;
    }

    /**
     * Получает множество ID текущих предшественников задачи из Core.
     * Использует customText(0) как primary key, name как fallback.
     * 
     * @param coreTask задача Core
     * @return Set<String> с ID предшественников (никогда не null)
     */
    public Set<String> getCurrentPredecessorIds(NormalTask coreTask) {
        Set<String> ids = new HashSet<>();
        Iterator<?> it = coreTask.getPredecessorList().iterator();
        while (it.hasNext()) {
            Dependency dep = (Dependency) it.next();
            Task predTask = (Task) dep.getPredecessor();
            String predId = extractTaskId(predTask);
            ids.add(predId);
        }
        return ids;
    }

    /**
     * Извлекает ID задачи: customText(0) как primary, name как fallback.
     * 
     * @param task задача Core
     * @return ID задачи (никогда не null)
     */
    public String extractTaskId(Task task) {
        String id = task.getCustomText(0);
        if (id == null || id.isEmpty()) {
            id = task.getName();
        }
        return id;
    }

    /**
     * Удаляет зависимости, которых нет в новом списке от Frontend.
     * 
     * @param coreTask задача-successor
     * @param toRemoveIds Set ID предшественников для удаления
     */
    public void removeObsoleteDependencies(NormalTask coreTask, Set<String> toRemoveIds) {
        if (toRemoveIds.isEmpty()) {
            return;
        }

        List<Dependency> depsToRemove = collectDependenciesToRemove(coreTask, toRemoveIds);
        executeDependencyRemovals(depsToRemove);
    }

    /**
     * Собирает зависимости для удаления в отдельный список.
     * Безопасно для итерации (не модифицирует коллекцию).
     */
    private List<Dependency> collectDependenciesToRemove(NormalTask coreTask, Set<String> toRemoveIds) {
        List<Dependency> depsToRemove = new ArrayList<>();
        Iterator<?> it = coreTask.getPredecessorList().iterator();
        while (it.hasNext()) {
            Dependency dep = (Dependency) it.next();
            Task predTask = (Task) dep.getPredecessor();
            String predId = extractTaskId(predTask);
            if (toRemoveIds.contains(predId)) {
                depsToRemove.add(dep);
            }
        }
        return depsToRemove;
    }

    /**
     * Выполняет удаление собранных зависимостей.
     * Использует DependencyService.remove с undo=false.
     */
    private void executeDependencyRemovals(List<Dependency> depsToRemove) {
        DependencyService depService = DependencyService.getInstance();
        for (Dependency dep : depsToRemove) {
            depService.remove(dep, eventSourceMarker, false);
            removedCount++;
            logDependencyRemoved(dep);
        }
    }

    private void logDependencyRemoved(Dependency dep) {
        if (log.isDebugEnabled()) {
            log.debug("[DepSync] Removed: {} -> {}", 
                    dep.getPredecessorName(), dep.getSuccessorName());
        }
    }

    public int getRemovedCount() {
        return removedCount;
    }

    public void resetRemovedCount() {
        removedCount = 0;
    }
}
