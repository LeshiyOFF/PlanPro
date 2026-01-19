package com.projectlibre.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * DTO для настроек безопасности
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class SecurityPreferencesDto {
    private boolean passwordProtection;
    private boolean readOnlyRecommended;
    private boolean encryptDocument;
    private boolean allowMacros;
    private TrustCenterSettingsDto trustCenter;

    public boolean isPasswordProtection() {
        return passwordProtection;
    }

    public void setPasswordProtection(boolean passwordProtection) {
        this.passwordProtection = passwordProtection;
    }

    public boolean isReadOnlyRecommended() {
        return readOnlyRecommended;
    }

    public void setReadOnlyRecommended(boolean readOnlyRecommended) {
        this.readOnlyRecommended = readOnlyRecommended;
    }

    public boolean isEncryptDocument() {
        return encryptDocument;
    }

    public void setEncryptDocument(boolean encryptDocument) {
        this.encryptDocument = encryptDocument;
    }

    public boolean isAllowMacros() {
        return allowMacros;
    }

    public void setAllowMacros(boolean allowMacros) {
        this.allowMacros = allowMacros;
    }

    public TrustCenterSettingsDto getTrustCenter() {
        return trustCenter;
    }

    public void setTrustCenter(TrustCenterSettingsDto trustCenter) {
        this.trustCenter = trustCenter;
    }
}
