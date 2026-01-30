package com.projectlibre.api.validator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Валидатор прогресса задач с учётом типа (веха vs обычная задача).
 * 
 * <p><b>Бизнес-правила:</b></p>
 * <ul>
 *   <li>Вехи (milestones): прогресс только 0.0 или 1.0 (0% или 100%)</li>
 *   <li>Обычные задачи: прогресс от 0.0 до 1.0 с округлением до 2 знаков</li>
 *   <li>Summary tasks: прогресс вычисляется Core автоматически</li>
 * </ul>
 * 
 * <p><b>Clean Architecture:</b> Domain Layer - бизнес-логика валидации.</p>
 * <p><b>SOLID:</b> Single Responsibility - только валидация прогресса.</p>
 * <p><b>Thread-Safe:</b> Stateless, может использоваться из нескольких потоков.</p>
 * 
 * @author ProjectLibre API Team
 * @version 1.0.0
 * @since 2026-01-29
 */
public final class MilestoneProgressValidator {
    
    private static final Logger log = LoggerFactory.getLogger(MilestoneProgressValidator.class);
    
    /** Порог для округления прогресса вехи до 100% */
    private static final double MILESTONE_COMPLETION_THRESHOLD = 0.5;
    
    /** Минимальное допустимое значение прогресса */
    private static final double MIN_PROGRESS = 0.0;
    
    /** Максимальное допустимое значение прогресса */
    private static final double MAX_PROGRESS = 1.0;
    
    /** Точность округления для обычных задач (2 знака после запятой) */
    private static final int PRECISION_SCALE = 100;
    
    private MilestoneProgressValidator() {
        throw new AssertionError("Utility class cannot be instantiated");
    }
    
    /**
     * Нормализует прогресс для вехи (milestone).
     * 
     * <p><b>Правило:</b> Вехи либо не выполнены (0%), либо выполнены (100%).</p>
     * <p>Значения >= 0.5 округляются до 1.0, остальные - до 0.0.</p>
     * 
     * @param progress исходное значение прогресса (0.0 - 1.0)
     * @return 0.0 если progress < 0.5, иначе 1.0
     * @throws IllegalArgumentException если progress вне диапазона [0, 1]
     */
    public static double normalizeMilestoneProgress(double progress) {
        validateProgressRange(progress, "milestone");
        
        double normalized = progress >= MILESTONE_COMPLETION_THRESHOLD ? MAX_PROGRESS : MIN_PROGRESS;
        
        if (normalized != progress) {
            log.debug("[MilestoneProgressValidator] Milestone progress normalized: {} -> {}", 
                progress, normalized);
        }
        
        return normalized;
    }
    
    /**
     * Нормализует прогресс для обычной задачи.
     * 
     * <p><b>Правило:</b> Округление до 2 знаков после запятой для минимизации артефактов IEEE 754.</p>
     * <p>Пример: 0.18499 -> 0.18, 0.18500 -> 0.19</p>
     * 
     * @param progress исходное значение прогресса (0.0 - 1.0)
     * @return округлённое значение с точностью до 0.01
     * @throws IllegalArgumentException если progress вне диапазона [0, 1]
     */
    public static double normalizeTaskProgress(double progress) {
        validateProgressRange(progress, "task");
        
        double normalized = Math.round(progress * PRECISION_SCALE) / (double) PRECISION_SCALE;
        
        if (Math.abs(normalized - progress) > 0.001) {
            log.debug("[MilestoneProgressValidator] Task progress normalized: {} -> {}", 
                progress, normalized);
        }
        
        return normalized;
    }
    
    /**
     * Универсальный метод нормализации прогресса.
     * 
     * <p>Автоматически выбирает стратегию нормализации в зависимости от типа задачи.</p>
     * 
     * @param progress исходное значение прогресса (0.0 - 1.0)
     * @param isMilestone true если задача является вехой
     * @return нормализованное значение прогресса
     * @throws IllegalArgumentException если progress вне диапазона [0, 1]
     */
    public static double normalizeProgress(double progress, boolean isMilestone) {
        return isMilestone 
            ? normalizeMilestoneProgress(progress) 
            : normalizeTaskProgress(progress);
    }
    
    /**
     * Проверяет, что значение прогресса находится в допустимом диапазоне [0, 1].
     * 
     * @param progress значение для проверки
     * @param taskType тип задачи для логирования ("milestone" или "task")
     * @throws IllegalArgumentException если значение вне диапазона
     */
    private static void validateProgressRange(double progress, String taskType) {
        if (progress < MIN_PROGRESS || progress > MAX_PROGRESS) {
            String message = String.format(
                "[MilestoneProgressValidator] Invalid %s progress: %.4f (must be in range [0, 1])", 
                taskType, progress
            );
            log.error(message);
            throw new IllegalArgumentException(message);
        }
    }
    
    /**
     * Проверяет, является ли прогресс валидным для вехи без нормализации.
     * 
     * @param progress значение прогресса
     * @return true если прогресс равен 0.0 или 1.0
     */
    public static boolean isValidMilestoneProgress(double progress) {
        return progress == MIN_PROGRESS || progress == MAX_PROGRESS;
    }
    
    /**
     * Проверяет, является ли прогресс валидным для обычной задачи.
     * 
     * @param progress значение прогресса
     * @return true если прогресс в диапазоне [0, 1]
     */
    public static boolean isValidTaskProgress(double progress) {
        return progress >= MIN_PROGRESS && progress <= MAX_PROGRESS;
    }
}
