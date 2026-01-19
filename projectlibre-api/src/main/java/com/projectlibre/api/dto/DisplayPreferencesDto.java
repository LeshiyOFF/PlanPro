package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для настроек отображения
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class DisplayPreferencesDto {
    private boolean showTips;
    private boolean showWelcomeScreen;
    private boolean animationEnabled;
    private boolean highContrast;
    private int fontSize;
    private String fontFamily;
    private String theme;

    public boolean isShowTips() {
        return showTips;
    }

    public void setShowTips(boolean showTips) {
        this.showTips = showTips;
    }

    public boolean isShowWelcomeScreen() {
        return showWelcomeScreen;
    }

    public void setShowWelcomeScreen(boolean showWelcomeScreen) {
        this.showWelcomeScreen = showWelcomeScreen;
    }

    public boolean isAnimationEnabled() {
        return animationEnabled;
    }

    public void setAnimationEnabled(boolean animationEnabled) {
        this.animationEnabled = animationEnabled;
    }

    public boolean isHighContrast() {
        return highContrast;
    }

    public void setHighContrast(boolean highContrast) {
        this.highContrast = highContrast;
    }

    public int getFontSize() {
        return fontSize;
    }

    public void setFontSize(int fontSize) {
        this.fontSize = fontSize;
    }

    public String getFontFamily() {
        return fontFamily;
    }

    public void setFontFamily(String fontFamily) {
        this.fontFamily = fontFamily;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }
}
