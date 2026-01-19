package com.projectlibre1.ui;

import com.projectlibre1.job.JobAdapter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Assertions;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.HashSet;
import java.util.Set;

/**
 * Tests for UI adapters
 * Tests SwingUtilities adaptation and abstraction
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
class UIAdapterTest {
    
    private UIExecutorInterface uiExecutor;
    private UIAlert uiAlert;
    private JobAdapter jobAdapter;
    private UIAdapterFactory factory;
    
    @BeforeEach
    void setUp() {
        factory = UIAdapterFactory.getInstance();
        factory.setHeadless(true); // Test in headless mode
        uiExecutor = factory.createExecutor();
        uiAlert = factory.createAlert(uiExecutor);
        jobAdapter = factory.createJobAdapter(uiExecutor);
    }
    
    @Test
    @DisplayName("Test UI executor singleton")
    void testUIExecutorSingleton() {
        UIExecutorInterface executor1 = UIThreadExecutor.getInstance();
        UIExecutorInterface executor2 = UIThreadExecutor.getInstance();
        
        Assertions.assertSame(executor1, executor2, "Should return same instance");
    }
    
    @Test
    @DisplayName("Test UI factory singleton")
    void testUIFactorySingleton() {
        UIAdapterFactory factory1 = UIAdapterFactory.getInstance();
        UIAdapterFactory factory2 = UIAdapterFactory.getInstance();
        
        Assertions.assertSame(factory1, factory2, "Should return same instance");
    }
    
    @Test
    @DisplayName("Test headless mode")
    void testHeadlessMode() {
        uiExecutor.setHeadless(true);
        Assertions.assertTrue(uiExecutor.isHeadless(), "Should be in headless mode");
        
        uiExecutor.setHeadless(false);
        Assertions.assertFalse(uiExecutor.isHeadless(), "Should not be in headless mode");
    }
    
    @Test
    @DisplayName("Test invokeLater execution")
    void testInvokeLaterExecution() throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(1);
        boolean[] executed = {false};
        
        uiExecutor.invokeLater(() -> {
            executed[0] = true;
            latch.countDown();
        });
        
        Assertions.assertTrue(latch.await(1, TimeUnit.SECONDS), "Task should execute");
        Assertions.assertTrue(executed[0], "Task should be executed");
    }
    
    @Test
    @DisplayName("Test immediate execution in headless mode")
    void testImmediateExecutionInHeadlessMode() {
        uiExecutor.setHeadless(true);
        
        boolean[] executed = {false};
        CountDownLatch latch = new CountDownLatch(1);
        
        uiExecutor.invokeLater(() -> {
            executed[0] = true;
            latch.countDown();
        });
        
        // Should execute immediately in headless mode
        Assertions.assertTrue(executed[0], "Should execute immediately in headless mode");
    }
    
    @Test
    @DisplayName("Test UI alert operations")
    void testUIAlertOperations() {
        // Test warn (should not throw exception in headless mode)
        Assertions.assertDoesNotThrow(() -> {
            uiAlert.warn("Test warning");
        });
        
        // Test error (should not throw exception in headless mode)
        Assertions.assertDoesNotThrow(() -> {
            uiAlert.error("Test error");
        });
        
        // Test confirm (should return default in headless mode)
        int confirmResult = uiAlert.confirm("Test confirm");
        Assertions.assertTrue(confirmResult >= 0, "Should return valid result");
        
        // Test ok/cancel (should return default in headless mode)
        boolean okCancelResult = uiAlert.okCancel("Test ok cancel");
        Assertions.assertTrue(okCancelResult, "Should return true in headless mode");
    }
    
    @Test
    @DisplayName("Test job adapter operations")
    void testJobAdapterOperations() {
        // Test progress update
        Assertions.assertDoesNotThrow(() -> {
            jobAdapter.updateProgress(null, 50, "Test progress");
        });
        
        // Test close progress
        Assertions.assertDoesNotThrow(() -> {
            jobAdapter.closeProgress(null);
        });
        
        // Test show warning
        Assertions.assertDoesNotThrow(() -> {
            jobAdapter.showWarning("Test warning");
        });
        
        // Test show error
        Assertions.assertDoesNotThrow(() -> {
            jobAdapter.showError("Test error");
        });
        
        // Test show confirm
        int confirmResult = jobAdapter.showConfirm("Test confirm");
        Assertions.assertTrue(confirmResult >= 0, "Should return valid result");
        
        // Test show ok/cancel
        boolean okCancelResult = jobAdapter.showOkCancel("Test ok cancel");
        Assertions.assertTrue(okCancelResult, "Should return true in headless mode");
    }
    
    @Test
    @DisplayName("Test rename project dialog")
    void testRenameProjectDialog() {
        Set<String> existingNames = new HashSet<>();
        existingNames.add("Project1");
        existingNames.add("Project2");
        
        String result = jobAdapter.showRenameDialog("NewProject", existingNames, true);
        Assertions.assertNotNull(result, "Should return name");
        Assertions.assertTrue(result.length() > 0, "Should return non-empty name");
    }
    
    @Test
    @DisplayName("Test factory create methods")
    void testFactoryCreateMethods() {
        // Test executor creation
        UIExecutorInterface executor = factory.createExecutor();
        Assertions.assertNotNull(executor, "Should create executor");
        
        // Test alert creation
        UIAlert alert = factory.createAlert();
        Assertions.assertNotNull(alert, "Should create alert");
        
        // Test job adapter creation
        JobAdapter adapter = factory.createJobAdapter();
        Assertions.assertNotNull(adapter, "Should create job adapter");
    }
    
    @Test
    @DisplayName("Test concurrent execution")
    void testConcurrentExecution() throws InterruptedException {
        int threadCount = 5;
        CountDownLatch latch = new CountDownLatch(threadCount);
        int[] executedCount = {0};
        
        for (int i = 0; i < threadCount; i++) {
            uiExecutor.invokeLater(() -> {
                synchronized (executedCount) {
                    executedCount[0]++;
                }
                latch.countDown();
            });
        }
        
        Assertions.assertTrue(latch.await(2, TimeUnit.SECONDS), "All tasks should execute");
        Assertions.assertEquals(threadCount, executedCount[0], "All tasks should be executed");
    }
    
    @Test
    @DisplayName("Test invokeAndWait execution")
    void testInvokeAndWaitExecution() throws InterruptedException {
        boolean[] executed = {false};
        
        uiExecutor.invokeAndWait(() -> {
            executed[0] = true;
        });
        
        Assertions.assertTrue(executed[0], "Task should be executed");
    }
}