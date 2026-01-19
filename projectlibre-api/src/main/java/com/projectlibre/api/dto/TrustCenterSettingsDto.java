package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

/**
 * DTO для настроек центра доверия
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class TrustCenterSettingsDto {
    private boolean enableAllMacros;
    private boolean disableAllMacros;
    private boolean trustVbaProjects;
    private List<String> trustedLocations;

    public boolean isEnableAllMacros() {
        return enableAllMacros;
    }

    public void setEnableAllMacros(boolean enableAllMacros) {
        this.enableAllMacros = enableAllMacros;
    }

    public boolean isDisableAllMacros() {
        return disableAllMacros;
    }

    public void setDisableAllMacros(boolean disableAllMacros) {
        this.disableAllMacros = disableAllMacros;
    }

    public boolean isTrustVbaProjects() {
        return trustVbaProjects;
    }

    public void setTrustVbaProjects(boolean trustVbaProjects) {
        this.trustVbaProjects = trustVbaProjects;
    }

    public List<String> getTrustedLocations() {
        return trustedLocations;
    }

    public void setTrustedLocations(List<String> trustedLocations) {
        this.trustedLocations = trustedLocations;
    }
}
