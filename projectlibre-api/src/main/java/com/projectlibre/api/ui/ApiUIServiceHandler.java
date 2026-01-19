package com.projectlibre.api.ui;

import com.projectlibre1.ui.UIServicePort;
import com.projectlibre1.session.FileHelper;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * API handler for UI services
 * Implements UIServicePort and delegates calls to Electron
 */
public class ApiUIServiceHandler implements UIServicePort {
    
    private static volatile ApiUIServiceHandler instance;
    private static final Object LOCK = new Object();
    private UIServiceCallback callback;
    private final long timeoutSeconds = 300;
    
    private ApiUIServiceHandler() {}
    
    public static ApiUIServiceHandler getInstance() {
        ApiUIServiceHandler result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) instance = result = new ApiUIServiceHandler();
            }
        }
        return result;
    }
    
    public void setCallback(UIServiceCallback callback) { this.callback = callback; }
    
    @Override
    public String chooseFileName(boolean save, String selectedFileName) {
        if (callback == null) return null;
        try {
            CompletableFuture<String> future = new CompletableFuture<>();
            callback.requestFileDialog(save, selectedFileName, future);
            return future.get(timeoutSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    @Override
    public boolean isFileNameAllowed(String fileName, boolean save) {
        return FileHelper.isFileNameAllowed(fileName, save);
    }
    
    @Override
    public String getFileExtension(String fileName) {
        return FileHelper.getFileExtension(fileName);
    }
    
    @Override
    public String changeFileExtension(String fileName, String extension) {
        return FileHelper.changeFileExtension(fileName, extension);
    }
    
    @Override
    public int getFileType(String fileName) {
        return FileHelper.getFileType(fileName);
    }
    
    @Override
    public String getFileExtensionByType(int fileType) {
        return FileHelper.getFileExtension(fileType);
    }

    @Override
    public void warn(Object message) { if (callback != null) callback.notify("warn", message); }

    @Override
    public void error(Object message) { if (callback != null) callback.notify("error", message); }

    @Override
    public int confirm(Object message, int optionType) {
        if (callback == null) return 1; // NO_OPTION equivalent
        try {
            CompletableFuture<Integer> future = new CompletableFuture<>();
            callback.requestConfirm(message, optionType, future);
            return future.get(timeoutSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            e.printStackTrace();
            return 1;
        }
    }
    
    public interface UIServiceCallback {
        void requestFileDialog(boolean save, String selectedFileName, CompletableFuture<String> resultFuture);
        void notify(String level, Object message);
        void requestConfirm(Object message, int optionType, CompletableFuture<Integer> resultFuture);
    }
}
