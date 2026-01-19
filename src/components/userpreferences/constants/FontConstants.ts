/**
 * Определение доступных шрифтов в приложении
 */
export interface IFontOption {
  value: string;
  label: string;
  stack: string;
}

export const APP_FONTS: IFontOption[] = [
  {
    value: 'Inter',
    label: 'fonts.inter',
    stack: "'Inter', system-ui, -apple-system, sans-serif"
  },
  {
    value: 'Roboto',
    label: 'fonts.roboto',
    stack: "'Roboto', 'Helvetica Neue', Arial, sans-serif"
  },
  {
    value: 'System',
    label: 'fonts.system',
    stack: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif"
  },
  {
    value: 'Arial',
    label: 'fonts.arial',
    stack: "Arial, sans-serif"
  },
  {
    value: 'Verdana',
    label: 'fonts.verdana',
    stack: "Verdana, sans-serif"
  },
  {
    value: 'Tahoma',
    label: 'fonts.tahoma',
    stack: "Tahoma, sans-serif"
  },
  {
    value: 'Georgia',
    label: 'fonts.georgia',
    stack: "Georgia, serif"
  }
];
