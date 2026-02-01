import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, ShieldCheck } from 'lucide-react'
import { PreferencesSection } from './PreferencesSection'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { ISecurityPreferences } from '../interfaces/UserPreferencesInterfaces'

/**
 * Компонент настроек безопасности документа
 * Управляет защитой паролем и макросами
 */
export const SecurityPreferences: React.FC = () => {
  const { preferences, updateSecurityPreferences } = useUserPreferences()
  const securityPrefs = preferences.security as ISecurityPreferences
  const [newLocation, setNewLocation] = useState('')

  const handleAddLocation = () => {
    if (!newLocation.trim()) return
    const currentLocations = securityPrefs.trustCenter.trustedLocations || []
    if (currentLocations.includes(newLocation.trim())) return

    updateSecurityPreferences({
      trustCenter: {
        ...securityPrefs.trustCenter,
        trustedLocations: [...currentLocations, newLocation.trim()],
      },
    })
    setNewLocation('')
  }

  const handleRemoveLocation = (location: string) => {
    updateSecurityPreferences({
      trustCenter: {
        ...securityPrefs.trustCenter,
        trustedLocations: (securityPrefs.trustCenter.trustedLocations || []).filter(l => l !== location),
      },
    })
  }

  return (
    <PreferencesSection
      title="Безопасность"
      description="Параметры защиты документа и управления доверенным содержимым"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="passwordProtection"
              checked={securityPrefs.passwordProtection}
              onCheckedChange={(checked) => updateSecurityPreferences({ passwordProtection: checked })}
            />
            <Label htmlFor="passwordProtection">Защита паролем при открытии</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="readOnlyRecommended"
              checked={securityPrefs.readOnlyRecommended}
              onCheckedChange={(checked) => updateSecurityPreferences({ readOnlyRecommended: checked })}
            />
            <Label htmlFor="readOnlyRecommended">Рекомендовать режим "Только чтение"</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="encryptDocument"
              checked={securityPrefs.encryptDocument}
              onCheckedChange={(checked) => updateSecurityPreferences({ encryptDocument: checked })}
            />
            <Label htmlFor="encryptDocument">Шифрование содержимого документа</Label>
          </div>
        </div>

        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
          <h4 className="font-medium text-sm mb-2">Центр управления безопасностью</h4>
          <div className="flex items-center space-x-2">
            <Switch
              id="allowMacros"
              checked={securityPrefs.allowMacros}
              onCheckedChange={(checked) => updateSecurityPreferences({ allowMacros: checked })}
            />
            <Label htmlFor="allowMacros">Разрешить выполнение макросов</Label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Включение макросов может быть небезопасно для документов из ненадежных источников.
          </p>

          <div className="mt-4 pt-4 border-t border-muted">
            <div className="flex items-center space-x-2">
              <Switch
                id="trustVba"
                checked={securityPrefs.trustCenter.trustVbaProjects}
                onCheckedChange={(checked) => updateSecurityPreferences({
                  trustCenter: { ...securityPrefs.trustCenter, trustVbaProjects: checked },
                })}
              />
              <Label htmlFor="trustVba">Доверять проектам VBA</Label>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-muted space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={16} className="text-primary" />
              <h5 className="text-xs font-semibold uppercase tracking-wider">Надежные расположения</h5>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Путь к папке..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="h-8 text-xs"
              />
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={handleAddLocation}>
                <Plus size={14} />
              </Button>
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {(securityPrefs.trustCenter.trustedLocations || []).map((loc, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 bg-background rounded border text-[10px] group">
                  <span className="truncate flex-1 mr-2">{loc}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-destructive"
                    onClick={() => handleRemoveLocation(loc)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              ))}
              {(!securityPrefs.trustCenter.trustedLocations || securityPrefs.trustCenter.trustedLocations.length === 0) && (
                <p className="text-[10px] text-muted-foreground italic text-center py-2">
                  Список пуст
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PreferencesSection>
  )
}

