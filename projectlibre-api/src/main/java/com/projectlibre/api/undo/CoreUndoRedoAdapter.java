package com.projectlibre.api.undo;

import com.projectlibre.api.dto.UndoRedoStateDto;
import com.projectlibre1.undo.UndoController;
import com.projectlibre1.concurrent.ThreadSafeManager;
import com.projectlibre1.concurrent.ThreadSafeManagerInterface;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Adapter for Undo/Redo operations
 * Bridges API layer with Core UndoController
 */
public class CoreUndoRedoAdapter implements UndoRedoPort {
    
    private static volatile CoreUndoRedoAdapter instance;
    private static final Object LOCK = new Object();
    
    private final ThreadSafeManagerInterface syncManager;
    private final Map<Long, UndoController> projectControllers;
    private Long activeProjectId;
    
    private CoreUndoRedoAdapter() {
        this.syncManager = ThreadSafeManager.getInstance();
        this.projectControllers = new ConcurrentHashMap<>();
    }
    
    public static CoreUndoRedoAdapter getInstance() {
        CoreUndoRedoAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new CoreUndoRedoAdapter();
                }
            }
        }
        return result;
    }
    
    public void registerController(Long projectId, UndoController controller) {
        projectControllers.put(projectId, controller);
        if (activeProjectId == null) {
            activeProjectId = projectId;
        }
    }
    
    public void setActiveProject(Long projectId) {
        this.activeProjectId = projectId;
    }
    
    private UndoController getActiveController() {
        if (activeProjectId == null) return null;
        return projectControllers.get(activeProjectId);
    }
    
    @Override
    public boolean undo() {
        return syncManager.executeWithWriteLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            if (controller != null && controller.canUndo()) {
                controller.undo();
                logAction("Undo executed");
                return true;
            }
            return false;
        });
    }
    
    @Override
    public boolean redo() {
        return syncManager.executeWithWriteLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            if (controller != null && controller.canRedo()) {
                controller.redo();
                logAction("Redo executed");
                return true;
            }
            return false;
        });
    }
    
    @Override
    public boolean canUndo() {
        return syncManager.executeWithReadLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            return controller != null && controller.canUndo();
        });
    }
    
    @Override
    public boolean canRedo() {
        return syncManager.executeWithReadLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            return controller != null && controller.canRedo();
        });
    }
    
    @Override
    public UndoRedoStateDto getState() {
        return syncManager.executeWithReadLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            UndoRedoStateDto state = new UndoRedoStateDto();
            
            if (controller != null) {
                state.setCanUndo(controller.canUndo());
                state.setCanRedo(controller.canRedo());
                state.setUndoName(controller.getUndoName());
                state.setRedoName(controller.getRedoName());
                
                List<String> editNames = controller.getEditNames();
                state.setEditHistory(editNames);
                state.setHistorySize(editNames != null ? editNames.size() : 0);
            }
            
            return state;
        });
    }
    
    @Override
    public void clearHistory() {
        syncManager.executeWithWriteLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            if (controller != null) {
                controller.clear();
                logAction("History cleared");
            }
            return null;
        });
    }
    
    @Override
    public void beginTransaction() {
        syncManager.executeWithWriteLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            if (controller != null) controller.beginUpdate();
            return null;
        });
    }
    
    @Override
    public void endTransaction() {
        syncManager.executeWithWriteLock("undo_redo", () -> {
            UndoController controller = getActiveController();
            if (controller != null) controller.endUpdate();
            return null;
        });
    }
    
    private void logAction(String action) {
        System.out.println("[UndoRedo] " + action + " for project " + activeProjectId);
    }
}
