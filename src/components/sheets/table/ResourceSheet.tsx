import { useMemo, forwardRef } from 'react';
import { ProfessionalSheet, type ProfessionalSheetHandle } from './ProfessionalSheet';
import { Resource } from '@/types/resource-types';
import { useContextMenu } from '@/presentation/contextmenu/providers/ContextMenuProvider';
import { ContextMenuType } from '@/domain/contextmenu/ContextMenuType';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '@/store/projectStore';
import { createResourceColumns } from './ResourceSheetColumns';
import { createDataChangeHandler, createContextMenuHandler } from './ResourceSheetHandlers';
import type { JsonObject } from '@/types/json-types';

/** Тип строки для ProfessionalSheet: Resource с индексной сигнатурой для generic T */
type ResourceRow = Resource & Record<string, JsonObject>;

interface ResourceSheetProps {
  resources: Resource[];
  onResourceUpdate: (resourceId: string, updates: Partial<Resource>) => void;
  onDeleteResources?: (resourceIds: string[]) => void;
  className?: string;
}

/**
 * ResourceSheet - Специализированная таблица ресурсов.
 */
export const ResourceSheet = forwardRef<ProfessionalSheetHandle, ResourceSheetProps>(
  ({ resources, onResourceUpdate, onDeleteResources, className = '' }, ref) => {
    const { t } = useTranslation();
    const { showMenu } = useContextMenu();
    const { calendars } = useProjectStore();

    const columns = useMemo(() => createResourceColumns(t, calendars), [t, calendars]);
    const handleDataChange = useMemo(
      () => createDataChangeHandler(resources, onResourceUpdate),
      [resources, onResourceUpdate]
    );

    const handleContextMenu = useMemo(
      () => createContextMenuHandler(showMenu, ContextMenuType.RESOURCE, onDeleteResources),
      [showMenu, onDeleteResources]
    );

    const data = resources as ResourceRow[];

    return (
      <div className={`flex flex-col h-full overflow-hidden ${className}`}>
        <ProfessionalSheet<ResourceRow>
          ref={ref}
          data={data}
          columns={columns}
          rowIdField="id"
          onDataChange={handleDataChange}
          onContextMenu={handleContextMenu}
          onDeleteRows={onDeleteResources}
        />
      </div>
    );
  }
);

ResourceSheet.displayName = 'ResourceSheet';
