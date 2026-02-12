import { Task } from '@/store/project/interfaces'

/**
 * Тип ограничения даты задачи.
 * Соответствует стандарту MS Project / Primavera P6.
 */
export type ConstraintType = NonNullable<Task['constraint']>

/**
 * Категория ограничения по строгости.
 * - flexible: гибкие (ASAP, ALAP)
 * - semi: полужёсткие (SNET, SNLT, FNET, FNLT)
 * - strict: жёсткие (MSO, MFO)
 */
export type ConstraintCategory = 'flexible' | 'semi' | 'strict'

/**
 * Метаданные типа ограничения.
 */
export interface ConstraintMeta {
  value: ConstraintType
  labelKey: string
  descriptionKey: string
  hintKey: string
  category: ConstraintCategory
  requiresDate: boolean
}

/**
 * Полный список типов ограничений с метаданными.
 */
export const CONSTRAINT_OPTIONS: readonly ConstraintMeta[] = [
  {
    value: 'AsSoonAsPossible',
    labelKey: 'constraints.asap.label',
    descriptionKey: 'constraints.asap.description',
    hintKey: 'constraints.asap.hint',
    category: 'flexible',
    requiresDate: false,
  },
  {
    value: 'AsLateAsPossible',
    labelKey: 'constraints.alap.label',
    descriptionKey: 'constraints.alap.description',
    hintKey: 'constraints.alap.hint',
    category: 'flexible',
    requiresDate: false,
  },
  {
    value: 'MustStartOn',
    labelKey: 'constraints.mso.label',
    descriptionKey: 'constraints.mso.description',
    hintKey: 'constraints.mso.hint',
    category: 'strict',
    requiresDate: true,
  },
  {
    value: 'MustFinishOn',
    labelKey: 'constraints.mfo.label',
    descriptionKey: 'constraints.mfo.description',
    hintKey: 'constraints.mfo.hint',
    category: 'strict',
    requiresDate: true,
  },
  {
    value: 'StartNoEarlierThan',
    labelKey: 'constraints.snet.label',
    descriptionKey: 'constraints.snet.description',
    hintKey: 'constraints.snet.hint',
    category: 'semi',
    requiresDate: true,
  },
  {
    value: 'StartNoLaterThan',
    labelKey: 'constraints.snlt.label',
    descriptionKey: 'constraints.snlt.description',
    hintKey: 'constraints.snlt.hint',
    category: 'semi',
    requiresDate: true,
  },
  {
    value: 'FinishNoEarlierThan',
    labelKey: 'constraints.fnet.label',
    descriptionKey: 'constraints.fnet.description',
    hintKey: 'constraints.fnet.hint',
    category: 'semi',
    requiresDate: true,
  },
  {
    value: 'FinishNoLaterThan',
    labelKey: 'constraints.fnlt.label',
    descriptionKey: 'constraints.fnlt.description',
    hintKey: 'constraints.fnlt.hint',
    category: 'semi',
    requiresDate: true,
  },
] as const

/**
 * Проверяет, требует ли тип ограничения указания даты.
 */
export function constraintRequiresDate(constraint: ConstraintType | undefined): boolean {
  if (!constraint) return false
  const meta = CONSTRAINT_OPTIONS.find(opt => opt.value === constraint)
  return meta?.requiresDate ?? false
}

/**
 * Возвращает категорию ограничения.
 */
export function getConstraintCategory(constraint: ConstraintType | undefined): ConstraintCategory {
  if (!constraint) return 'flexible'
  const meta = CONSTRAINT_OPTIONS.find(opt => opt.value === constraint)
  return meta?.category ?? 'flexible'
}

/**
 * Проверяет, является ли ограничение жёстким (MSO, MFO).
 */
export function isStrictConstraint(constraint: ConstraintType | undefined): boolean {
  return getConstraintCategory(constraint) === 'strict'
}

/**
 * Возвращает ключ подсказки для ограничения.
 */
export function getConstraintHintKey(constraint: ConstraintType | undefined): string {
  if (!constraint) return 'constraints.asap.hint'
  const meta = CONSTRAINT_OPTIONS.find(opt => opt.value === constraint)
  return meta?.hintKey ?? 'constraints.asap.hint'
}
