package com.projectlibre.api.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Централизованная конфигурация Jackson для ProjectLibre API.
 * 
 * Обеспечивает корректную сериализацию/десериализацию дат Java 8 Date/Time API.
 * Гарантирует использование ISO-8601 формата для всех дат в API.
 * 
 * Clean Architecture: Configuration (Infrastructure Layer).
 * SOLID: Single Responsibility - только конфигурация Jackson ObjectMapper.
 * 
 * @author ProjectLibre Team
 * @version 1.0.0
 */
@Configuration
public class JacksonConfig {
    
    private static final Logger log = LoggerFactory.getLogger(JacksonConfig.class);
    
    /**
     * ISO-8601 форматтер для LocalDateTime.
     * Формат: "2026-01-28T21:00:00" (без Z, так как LocalDateTime не имеет таймзоны).
     */
    private static final DateTimeFormatter ISO_LOCAL_DATE_TIME_FORMATTER = 
        DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    /**
     * Создаёт и конфигурирует основной ObjectMapper.
     * 
     * @Primary гарантирует использование этого bean во всём приложении Spring.
     * 
     * @param builder Spring-предоставленный builder с базовыми настройками
     * @return сконфигурированный ObjectMapper
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        JavaTimeModule javaTimeModule = createJavaTimeModule();
        SimpleModule doubleRoundingModule = createDoubleRoundingModule();
        
        ObjectMapper mapper = builder
            .modules(javaTimeModule, doubleRoundingModule)
            .featuresToDisable(
                SerializationFeature.WRITE_DATES_AS_TIMESTAMPS,
                SerializationFeature.FAIL_ON_EMPTY_BEANS
            )
            .build();
        
        logInitialization();
        return mapper;
    }
    
    /**
     * Создаёт JavaTimeModule с кастомными сериализаторами для Java 8 Date/Time API.
     */
    private JavaTimeModule createJavaTimeModule() {
        JavaTimeModule module = new JavaTimeModule();
        module.addSerializer(
            LocalDateTime.class, 
            new LocalDateTimeSerializer(ISO_LOCAL_DATE_TIME_FORMATTER)
        );
        return module;
    }
    
    /**
     * Создаёт модуль с кастомным сериализатором для Double.
     * Округляет все double значения до 2 знаков при JSON-сериализации.
     * 
     * <p><b>Цель:</b> Устранение артефактов IEEE 754 (например: 0.2800000004 -> 0.28)</p>
     * <p><b>Применение:</b> Все double/Double поля в JSON-ответах API</p>
     * <p><b>Безопасность:</b> Округление только при сериализации, внутренние вычисления не затронуты</p>
     * 
     * @return SimpleModule с Double serializers
     */
    private SimpleModule createDoubleRoundingModule() {
        SimpleModule module = new SimpleModule("DoubleRoundingModule");
        
        // Сериализатор для объектного типа Double (может быть null)
        module.addSerializer(Double.class, new JsonSerializer<Double>() {
            @Override
            public void serialize(Double value, JsonGenerator gen, SerializerProvider serializers) 
                    throws IOException {
                if (value == null) {
                    gen.writeNull();
                } else {
                    // Округление до 2 знаков после запятой
                    double rounded = Math.round(value * 100.0) / 100.0;
                    gen.writeNumber(rounded);
                }
            }
        });
        
        // Сериализатор для примитивного типа double (не может быть null)
        module.addSerializer(double.class, new JsonSerializer<Double>() {
            @Override
            public void serialize(Double value, JsonGenerator gen, SerializerProvider serializers) 
                    throws IOException {
                double rounded = Math.round(value * 100.0) / 100.0;
                gen.writeNumber(rounded);
            }
        });
        
        return module;
    }
    
    /**
     * Логирует успешную инициализацию конфигурации.
     */
    private void logInitialization() {
        log.info("[JacksonConfig] ✅ ObjectMapper configured:");
        log.info("[JacksonConfig]    - JavaTimeModule registered");
        log.info("[JacksonConfig]    - ISO-8601 date format enabled");
        log.info("[JacksonConfig]    - WRITE_DATES_AS_TIMESTAMPS = false");
        log.info("[JacksonConfig]    - Double rounding enabled (2 decimal places)");
    }
}
