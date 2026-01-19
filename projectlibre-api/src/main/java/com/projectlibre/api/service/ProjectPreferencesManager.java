package com.projectlibre.api.service;

import com.projectlibre.api.dto.PreferencesDto;
import com.projectlibre1.util.Alert;

import java.io.PrintStream;

/**
 * Менеджер для интеграции настроек проекта с ядром ProjectLibre.
 * Регистрирует Callback-методы, которые вызываются из ядра при сохранении/загрузке.
 */
public class ProjectPreferencesManager {
    private static ProjectPreferencesManager instance;
    private final PreferenceService preferenceService = PreferenceService.getInstance();
    private final ProjectPreferencesPersistenceService persistenceService = ProjectPreferencesPersistenceService.getInstance();

    private ProjectPreferencesManager() {}

    public static synchronized ProjectPreferencesManager getInstance() {
        if (instance == null) {
            instance = new ProjectPreferencesManager();
        }
        return instance;
    }

    /**
     * Регистрация методов в механизме алертов ядра.
     * Это позволяет ядру вызывать API-слой без прямой зависимости.
     * В headless режиме GraphicManager недоступен - тихо игнорируем ошибки.
     */
    public void initialize() {
        System.out.println("[ProjectPreferencesManager] Initializing preferences callbacks...");
        
        int successCount = 0;
        
        // Регистрация метода получения JSON для сохранения
        if (silentRegister("GetProjectPreferencesJson", new Alert.Method() {
            @Override
            public Object execute(Object[] args) {
                PreferencesDto dto = getCurrentPreferencesAsDto();
                return persistenceService.serialize(dto);
            }
        })) {
            successCount++;
            System.out.println("[ProjectPreferencesManager]   ✓ GetProjectPreferencesJson callback registered");
        }

        // Регистрация метода применения JSON при загрузке
        if (silentRegister("ApplyProjectPreferencesJson", new Alert.Method() {
            @Override
            public Object execute(Object[] args) {
                if (args != null && args.length > 0 && args[0] instanceof String) {
                    String json = (String) args[0];
                    PreferencesDto dto = persistenceService.deserialize(json);
                    if (dto != null) {
                        preferenceService.applyPreferences(dto);
                    }
                }
                return null;
            }
        })) {
            successCount++;
            System.out.println("[ProjectPreferencesManager]   ✓ ApplyProjectPreferencesJson callback registered");
        }
        
        if (successCount > 0) {
            System.out.println("[ProjectPreferencesManager] ✅ Preferences manager initialized (" + successCount + "/2 callbacks)");
        } else {
            System.out.println("[ProjectPreferencesManager] ℹ Preferences manager initialized (headless mode - GUI callbacks unavailable)");
        }
    }
    
    /**
     * Тихая регистрация callback'а с подавлением стектрейсов.
     * В headless режиме Alert.setGraphicManagerMethod() печатает стектрейс - подавляем его.
     */
    private boolean silentRegister(String methodName, Alert.Method callback) {
        // Сохраняем оригинальный System.err
        PrintStream originalErr = System.err;
        
        try {
            // Временно перенаправляем stderr в /dev/null (подавляем стектрейсы)
            System.setErr(new PrintStream(new java.io.OutputStream() {
                @Override
                public void write(int b) {
                    // Ничего не делаем - выбрасываем вывод
                }
            }));
            
            // Пытаемся зарегистрировать
            Alert.setGraphicManagerMethod(methodName, callback);
            
            // Успех
            return true;
            
        } catch (Exception e) {
            // Неудача (это норма в headless режиме)
            return false;
            
        } finally {
            // ОБЯЗАТЕЛЬНО восстанавливаем System.err
            System.setErr(originalErr);
        }
    }

    /**
     * Собирает текущие настройки из синглтонов ядра в один DTO
     */
    private PreferencesDto getCurrentPreferencesAsDto() {
        PreferencesDto dto = new PreferencesDto();
        
        // General
        com.projectlibre1.options.GeneralOption gen = com.projectlibre1.options.GeneralOption.getInstance();
        com.projectlibre.api.dto.GeneralPreferencesDto gDto = new com.projectlibre.api.dto.GeneralPreferencesDto();
        gDto.setUserName(gen.getUserName());
        gDto.setCompanyName(gen.getCompanyName());
        gDto.setCurrency(gen.getCurrency());
        gDto.setDefaultStandardRate(gen.getDefaultStandardRate());
        gDto.setDefaultOvertimeRate(gen.getDefaultOvertimeRate());
        
        // Date format from EditOption
        com.projectlibre1.options.EditOption edit = com.projectlibre1.options.EditOption.getInstance();
        if (edit.getDateFormat() != null) {
            gDto.setDateFormat(edit.getDateFormat().toPattern());
        }
        dto.setGeneral(gDto);
        
        // Calculations
        com.projectlibre1.options.CalculationOption calc = com.projectlibre1.options.CalculationOption.getInstance();
        com.projectlibre.api.dto.CalculationPreferencesDto cDto = new com.projectlibre.api.dto.CalculationPreferencesDto();
        cDto.setCalculateMultipleCriticalPaths(calc.isCalculateMultipleCriticalPaths());
        
        com.projectlibre.api.dto.DurationDto slack = new com.projectlibre.api.dto.DurationDto();
        slack.setValue(calc.getCriticalSlackThreshold());
        slack.setUnit("ms");
        cDto.setCriticalSlack(slack);
        
        // Gantt options
        com.projectlibre1.options.GanttOption gantt = com.projectlibre1.options.GanttOption.getInstance();
        cDto.setShowEstimatedDurations(gantt.isShowEstimatedDurations());
        cDto.setShowActualWork(gantt.isShowActualWork());
        cDto.setShowBaselineWork(gantt.isShowBaselineWork());
        dto.setCalculations(cDto);
        
        // Editing
        com.projectlibre.api.dto.EditingPreferencesDto eDto = new com.projectlibre.api.dto.EditingPreferencesDto();
        eDto.setAutoCalculate(edit.isAutoCalculate());
        eDto.setAutoLinkTasks(edit.isAutoLinkTasks());
        eDto.setSplitTasksEnabled(edit.isSplitTasksEnabled());
        eDto.setAllowTaskDeletion(edit.isAllowTaskDeletion());
        eDto.setConfirmDeletions(gen.isConfirmDeletes());
        dto.setEditing(eDto);
        
        return dto; 
    }
}
