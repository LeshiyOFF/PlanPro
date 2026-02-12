package com.projectlibre.api.service;

import com.projectlibre.api.dto.PreferencesDto;
import com.projectlibre1.util.Alert;

/**
 * Менеджер для интеграции настроек проекта с ядром ProjectLibre.
 * Регистрирует callback-методы только если в core (GraphicManager) есть
 * соответствующие статические методы; в headless — настройки хранятся только в API.
 */
public class ProjectPreferencesManager {
    private static final String GRAPHIC_MANAGER_CLASS = "com.projectlibre1.pm.graphic.frames.GraphicManager";
    private static final String METHOD_GET_PREFS = "GetProjectPreferencesJson";
    private static final String METHOD_APPLY_PREFS = "ApplyProjectPreferencesJson";

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
     * Регистрация callback'ов только при наличии методов в GraphicManager.
     * При отсутствии методов (headless) — логируем и продолжаем без регистрации.
     */
    public void initialize() {
        System.out.println("[ProjectPreferencesManager] Initializing preferences callbacks...");
        if (!isGraphicManagerPreferencesSupported()) {
            System.out.println("[ProjectPreferencesManager] ℹ GraphicManager preferences methods not found (headless) — storing preferences in API only");
            return;
        }
        int successCount = 0;
        if (registerGetPreferences()) {
            successCount++;
        }
        if (registerApplyPreferences()) {
            successCount++;
        }
        System.out.println("[ProjectPreferencesManager] ✅ Preferences callbacks registered (" + successCount + "/2)");
    }

    /**
     * Проверка наличия в core статических методов GetProjectPreferencesJson(Object) и ApplyProjectPreferencesJson(Object).
     * Без них регистрация не выполняется — не бросаем исключение.
     */
    private boolean isGraphicManagerPreferencesSupported() {
        try {
            Class<?> clazz = Class.forName(GRAPHIC_MANAGER_CLASS);
            clazz.getMethod(METHOD_GET_PREFS, Object.class);
            clazz.getMethod(METHOD_APPLY_PREFS, Object.class);
            return true;
        } catch (ClassNotFoundException | NoSuchMethodException e) {
            return false;
        }
    }

    private boolean registerGetPreferences() {
        try {
            Alert.setGraphicManagerMethod(METHOD_GET_PREFS, (Alert.Method) args -> {
                PreferencesDto dto = getCurrentPreferencesAsDto();
                return persistenceService.serialize(dto);
            });
            System.out.println("[ProjectPreferencesManager]   ✓ GetProjectPreferencesJson registered");
            return true;
        } catch (Exception e) {
            System.out.println("[ProjectPreferencesManager]   ✗ GetProjectPreferencesJson not registered: " + e.getMessage());
            return false;
        }
    }

    private boolean registerApplyPreferences() {
        try {
            Alert.setGraphicManagerMethod(METHOD_APPLY_PREFS, (Alert.Method) args -> {
                if (args != null && args.length > 0 && args[0] instanceof String) {
                    String json = (String) args[0];
                    PreferencesDto dto = persistenceService.deserialize(json);
                    if (dto != null) {
                        preferenceService.applyPreferences(dto);
                    }
                }
                return null;
            });
            System.out.println("[ProjectPreferencesManager]   ✓ ApplyProjectPreferencesJson registered");
            return true;
        } catch (Exception e) {
            System.out.println("[ProjectPreferencesManager]   ✗ ApplyProjectPreferencesJson not registered: " + e.getMessage());
            return false;
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
