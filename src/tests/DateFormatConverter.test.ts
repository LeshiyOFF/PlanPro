import { describe, it, expect } from 'vitest';
import { 
  convertDateFnsToJava, 
  convertJavaToDateFns, 
  isValidDateFormat 
} from '@/utils/DateFormatConverter';

describe('DateFormatConverter', () => {
  describe('convertDateFnsToJava', () => {
    it('converts basic date formats', () => {
      expect(convertDateFnsToJava('DD.MM.YYYY')).toBe('dd.MM.yyyy');
      expect(convertDateFnsToJava('YYYY-MM-DD')).toBe('yyyy-MM-dd');
      expect(convertDateFnsToJava('DD/MM/YY')).toBe('dd/MM/yy');
    });

    it('converts date with time formats', () => {
      expect(convertDateFnsToJava('YYYY-MM-DD HH:mm')).toBe('yyyy-MM-dd HH:mm');
      expect(convertDateFnsToJava('DD.MM.YYYY HH:mm:ss')).toBe('dd.MM.yyyy HH:mm:ss');
      expect(convertDateFnsToJava('YYYY-MM-DD hh:mm a')).toBe('yyyy-MM-dd hh:mm a');
    });

    it('converts formats with month names', () => {
      expect(convertDateFnsToJava('DD MMMM YYYY')).toBe('dd MMMM yyyy');
      expect(convertDateFnsToJava('MMM DD, YYYY')).toBe('MMM dd, yyyy');
    });

    it('preserves literals in quotes', () => {
      expect(convertDateFnsToJava("YYYY-MM-DD'T'HH:mm:ss")).toBe("yyyy-MM-dd'T'HH:mm:ss");
      expect(convertDateFnsToJava("DD 'de' MMMM 'de' YYYY")).toBe("dd 'de' MMMM 'de' yyyy");
    });

    it('handles empty or invalid input', () => {
      expect(convertDateFnsToJava('')).toBe('');
      expect(convertDateFnsToJava(null as any)).toBe(null);
      expect(convertDateFnsToJava(undefined as any)).toBe(undefined);
    });

    it('handles complex formats', () => {
      expect(convertDateFnsToJava('dddd, DD MMMM YYYY HH:mm')).toBe('EEEE, dd MMMM yyyy HH:mm');
      expect(convertDateFnsToJava('ddd, DD MMM YY')).toBe('EEE, dd MMM yy');
    });
  });

  describe('convertJavaToDateFns', () => {
    it('converts basic date formats', () => {
      expect(convertJavaToDateFns('dd.MM.yyyy')).toBe('DD.MM.YYYY');
      expect(convertJavaToDateFns('yyyy-MM-dd')).toBe('YYYY-MM-DD');
      expect(convertJavaToDateFns('dd/MM/yy')).toBe('DD/MM/YY');
    });

    it('converts date with time formats', () => {
      expect(convertJavaToDateFns('yyyy-MM-dd HH:mm')).toBe('YYYY-MM-DD HH:mm');
      expect(convertJavaToDateFns('dd.MM.yyyy HH:mm:ss')).toBe('DD.MM.YYYY HH:mm:ss');
    });

    it('converts formats with day names', () => {
      expect(convertJavaToDateFns('EEEE, dd MMMM yyyy')).toBe('dddd, DD MMMM YYYY');
      expect(convertJavaToDateFns('EEE, dd MMM yy')).toBe('ddd, DD MMM YY');
    });

    it('handles empty or invalid input', () => {
      expect(convertJavaToDateFns('')).toBe('');
      expect(convertJavaToDateFns(null as any)).toBe(null);
      expect(convertJavaToDateFns(undefined as any)).toBe(undefined);
    });
  });

  describe('isValidDateFormat', () => {
    it('validates correct formats', () => {
      expect(isValidDateFormat('DD.MM.YYYY')).toBe(true);
      expect(isValidDateFormat('YYYY-MM-DD')).toBe(true);
      expect(isValidDateFormat('HH:mm:ss')).toBe(true);
    });

    it('rejects invalid formats', () => {
      expect(isValidDateFormat('')).toBe(false);
      expect(isValidDateFormat(null as any)).toBe(false);
      expect(isValidDateFormat(undefined as any)).toBe(false);
      expect(isValidDateFormat('invalid')).toBe(false);
      expect(isValidDateFormat('12345')).toBe(false);
    });
  });

  describe('round-trip conversion', () => {
    it('converts date-fns to Java and back', () => {
      const original = 'DD.MM.YYYY HH:mm';
      const java = convertDateFnsToJava(original);
      const backToDateFns = convertJavaToDateFns(java);
      expect(backToDateFns).toBe(original);
    });

    it('converts Java to date-fns and back', () => {
      const original = 'dd.MM.yyyy HH:mm';
      const dateFns = convertJavaToDateFns(original);
      const backToJava = convertDateFnsToJava(dateFns);
      expect(backToJava).toBe(original);
    });
  });
});
