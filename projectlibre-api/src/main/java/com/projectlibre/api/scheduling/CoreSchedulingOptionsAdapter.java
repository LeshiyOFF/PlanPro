package com.projectlibre.api.scheduling;

import com.projectlibre1.options.ScheduleOption;
import com.projectlibre1.concurrent.ThreadSafeManager;
import com.projectlibre1.concurrent.ThreadSafeManagerInterface;

/**
 * Адаптер для связи настроек планирования API с Core ScheduleOption
 * Обеспечивает потокобезопасную синхронизацию настроек
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class CoreSchedulingOptionsAdapter implements SchedulingOptionsPort {
    
    private static volatile CoreSchedulingOptionsAdapter instance;
    private static final Object LOCK = new Object();
    
    private final ThreadSafeManagerInterface syncManager;
    
    private CoreSchedulingOptionsAdapter() {
        this.syncManager = ThreadSafeManager.getInstance();
    }
    
    public static CoreSchedulingOptionsAdapter getInstance() {
        CoreSchedulingOptionsAdapter result = instance;
        if (result == null) {
            synchronized (LOCK) {
                result = instance;
                if (result == null) {
                    instance = result = new CoreSchedulingOptionsAdapter();
                }
            }
        }
        return result;
    }
    
    @Override
    public int getSchedulingRule() {
        return syncManager.executeWithReadLock("schedule_options", 
            () -> ScheduleOption.getInstance().getSchedulingRule());
    }
    
    @Override
    public void setSchedulingRule(int schedulingRule) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption.getInstance().setSchedulingRule(schedulingRule);
            logSettingChange("schedulingRule", schedulingRule);
            return null;
        });
    }
    
    @Override
    public boolean isEffortDriven() {
        return syncManager.executeWithReadLock("schedule_options", 
            () -> ScheduleOption.getInstance().isEffortDriven());
    }
    
    @Override
    public void setEffortDriven(boolean effortDriven) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption.getInstance().setEffortDriven(effortDriven);
            logSettingChange("effortDriven", effortDriven);
            return null;
        });
    }
    
    @Override
    public int getDurationEnteredIn() {
        return syncManager.executeWithReadLock("schedule_options", 
            () -> ScheduleOption.getInstance().getDurationEnteredIn());
    }
    
    @Override
    public void setDurationEnteredIn(int durationEnteredIn) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption.getInstance().setDurationEnteredIn(durationEnteredIn);
            logSettingChange("durationEnteredIn", durationEnteredIn);
            return null;
        });
    }
    
    @Override
    public int getWorkUnit() {
        return syncManager.executeWithReadLock("schedule_options", 
            () -> ScheduleOption.getInstance().getWorkUnit());
    }
    
    @Override
    public void setWorkUnit(int workUnit) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption.getInstance().setEffortDisplay(workUnit);
            logSettingChange("workUnit", workUnit);
            return null;
        });
    }
    
    @Override
    public boolean isNewTasksStartToday() {
        return syncManager.executeWithReadLock("schedule_options", 
            () -> ScheduleOption.getInstance().isNewTasksStartToday());
    }
    
    @Override
    public void setNewTasksStartToday(boolean newTasksStartToday) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption.getInstance().setNewTasksStartToday(newTasksStartToday);
            logSettingChange("newTasksStartToday", newTasksStartToday);
            return null;
        });
    }
    
    @Override
    public boolean isHonorRequiredDates() {
        return syncManager.executeWithReadLock("schedule_options", 
            () -> ScheduleOption.getInstance().isHonorRequiredDates());
    }
    
    @Override
    public void setHonorRequiredDates(boolean honorRequiredDates) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption.getInstance().setHonorRequiredDates(honorRequiredDates);
            logSettingChange("honorRequiredDates", honorRequiredDates);
            return null;
        });
    }
    
    @Override
    public void applyAllSettings(int schedulingRule, boolean effortDriven,
                                int durationEnteredIn, int workUnit,
                                boolean newTasksStartToday, boolean honorRequiredDates) {
        syncManager.executeWithWriteLock("schedule_options", () -> {
            ScheduleOption option = ScheduleOption.getInstance();
            option.setSchedulingRule(schedulingRule);
            option.setEffortDriven(effortDriven);
            option.setDurationEnteredIn(durationEnteredIn);
            option.setEffortDisplay(workUnit);
            option.setNewTasksStartToday(newTasksStartToday);
            option.setHonorRequiredDates(honorRequiredDates);
            logAllSettingsApplied();
            return null;
        });
    }
    
    private void logSettingChange(String setting, Object value) {
        System.out.println("[CoreSchedulingOptions] " + setting + " = " + value);
    }
    
    private void logAllSettingsApplied() {
        System.out.println("[CoreSchedulingOptions] All scheduling settings applied to Core");
    }
}
