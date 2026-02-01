/**
 * Маппер Catalog.Resource ↔ resource-types.Resource на границе API.
 * Catalog → UI и UI → Catalog для вызовов ResourceAPIClient.
 */

import type { Resource as CatalogResource, ID } from '@/types/Master_Functionality_Catalog';
import { ResourceType } from '@/types/Master_Functionality_Catalog';
import type { Resource as UiResource } from '@/types/resource-types';
import type { JsonValue } from '@/types/json-types';

export function catalogIdToString(id: ID): string {
  if (typeof id === 'object' && id !== null && 'value' in id) {
    return String((id as { value: number }).value);
  }
  return String(id);
}

/** Преобразует строковый id в Catalog ID для вызова API. */
export function stringToCatalogId(id: string | number): ID {
  const value = typeof id === 'string' ? parseInt(id, 10) || 0 : id;
  return { value, type: 'resource' };
}

const uiTypeToCatalog: Record<UiResource['type'], ResourceType> = {
  Work: ResourceType.WORK,
  Material: ResourceType.MATERIAL,
  Cost: ResourceType.COST,
};

/** Преобразует частичный ресурс UI (resource-types) в частичный Catalog.Resource для API. */
export function uiResourcePartialToCatalog(p: Partial<UiResource>): Partial<CatalogResource> {
  const out: Partial<CatalogResource> = {};
  if (p.id !== undefined) out.id = stringToCatalogId(p.id);
  if (p.name !== undefined) out.name = p.name;
  if (p.type !== undefined) out.type = uiTypeToCatalog[p.type] as CatalogResource['type'];
  if (p.email !== undefined) out.email = p.email;
  if (p.group !== undefined) out.group = p.group;
  const outExt = out as Partial<CatalogResource> & Record<string, JsonValue>;
  if (p.standardRate !== undefined || p.overtimeRate !== undefined || p.costPerUse !== undefined) {
    outExt.cost = {
      standardRate: { amount: p.standardRate ?? 0, code: 'USD' },
      overtimeRate: { amount: p.overtimeRate ?? 0, code: 'USD' },
      costPerUse: { amount: p.costPerUse ?? 0, code: 'USD' },
      accrual: 'prorated',
    };
  }
  if (p.maxUnits !== undefined) {
    outExt.availability = {
      maxUnits: { value: p.maxUnits },
      normalUnits: { value: 100 },
      available: true,
      exceptions: [],
    };
  }
  if (p.available !== undefined) outExt.isActive = p.available;
  return out;
}

/**
 * Преобразует ресурс из формата Catalog (store) в формат UI (resource-types).
 */
export function mapCatalogResourceToUi(catalog: CatalogResource): UiResource {
  const typeMap: Record<ResourceType, UiResource['type']> = {
    [ResourceType.WORK]: 'Work',
    [ResourceType.MATERIAL]: 'Material',
    [ResourceType.COST]: 'Cost'
  };
  return {
    id: catalogIdToString(catalog.id),
    name: catalog.name,
    type: typeMap[catalog.type] ?? 'Work',
    maxUnits: catalog.availability?.maxUnits?.value ?? 100,
    standardRate: catalog.cost?.standardRate?.amount ?? 0,
    overtimeRate: catalog.cost?.overtimeRate?.amount ?? 0,
    costPerUse: catalog.cost?.costPerUse?.amount ?? 0,
    email: catalog.email,
    group: catalog.group,
    calendarId: catalog.calendar ? catalogIdToString(catalog.calendar.id) : undefined,
    available: catalog.isActive ?? true,
    materialLabel: undefined
  };
}

/**
 * Преобразует массив ресурсов Catalog → UI.
 */
export function mapCatalogResourcesToUi(catalogResources: CatalogResource[]): UiResource[] {
  return catalogResources.map(mapCatalogResourceToUi);
}
