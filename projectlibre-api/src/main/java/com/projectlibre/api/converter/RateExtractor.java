package com.projectlibre.api.converter;

import com.projectlibre1.datatype.Rate;

/**
 * Утилита для извлечения числовых значений из Rate объектов.
 * 
 * SOLID: Single Responsibility - только извлечение значений из Rate.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
public class RateExtractor {
    
    /**
     * Извлекает числовое значение из Rate объекта.
     * 
     * @param rateObj объект Rate (может быть null)
     * @return числовое значение или 0.0 если извлечь не удалось
     */
    public double extract(Object rateObj) {
        if (rateObj == null) {
            return 0.0;
        }
        
        try {
            if (rateObj instanceof Rate) {
                Rate rate = (Rate) rateObj;
                return rate.getValue();
            }
            if (rateObj instanceof Number) {
                return ((Number) rateObj).doubleValue();
            }
            String str = rateObj.toString();
            str = str.replaceAll("[^0-9.]", "");
            if (!str.isEmpty()) {
                return Double.parseDouble(str);
            }
        } catch (Exception e) {
        }
        
        return 0.0;
    }
}
