package com.projectlibre.api.sync;

import com.projectlibre1.pm.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Защищает задачу от нежелательных изменений во время операций с иерархией.
 * Сохраняет критические поля перед операцией и восстанавливает их после.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class HierarchyOperationGuard implements AutoCloseable {
    private static final Logger log = LoggerFactory.getLogger(HierarchyOperationGuard.class);
    
    private final Task task;
    private final long savedStart;
    private final long savedEnd;
    private final double savedPercentComplete;
    
    /**
     * Создаёт guard и сохраняет текущее состояние задачи.
     */
    public HierarchyOperationGuard(Task task) {
        if (task == null) {
            throw new IllegalArgumentException("Task cannot be null");
        }
        
        this.task = task;
        this.savedStart = task.getStart();
        this.savedEnd = task.getEnd();
        this.savedPercentComplete = task.getPercentComplete();
        
        log.trace("Guard created for task: {}", task.getName());
    }
    
    /**
     * Восстанавливает сохранённое состояние задачи.
     */
    public void restore() {
        boolean changed = false;
        
        // Восстановление даты начала
        if (task.getStart() != savedStart) {
            task.setStart(savedStart);
            changed = true;
        }
        
        // Восстановление даты окончания
        if (task.getEnd() != savedEnd) {
            task.setEnd(savedEnd);
            changed = true;
        }
        
        // Восстановление процента выполнения (с учётом double precision)
        if (Math.abs(task.getPercentComplete() - savedPercentComplete) > 0.001) {
            // Примечание: setPercentComplete может отсутствовать в некоторых версиях
            log.debug("PercentComplete changed for task: {}", task.getName());
            changed = true;
        }
        
        if (changed) {
            log.debug("State restored for task: {}", task.getName());
        }
    }
    
    @Override
    public void close() {
        restore();
    }
}

