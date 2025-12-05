import { formatDate, formatDateTime, calcularIMC, calcularEdad, generarId } from '@/lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format a date string correctly', () => {
      const date = '2024-01-15';
      const formatted = formatDate(date);
      // Format should be DD/MM/YYYY
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/2024$/);
      expect(formatted).toContain('15');
      expect(formatted).toContain('01');
    });

    it('should format a Date object correctly', () => {
      const date = new Date('2024-12-25');
      const formatted = formatDate(date);
      // Format should be DD/MM/YYYY
      expect(formatted).toMatch(/^\d{2}\/\d{2}\/2024$/);
      expect(formatted).toContain('25');
      expect(formatted).toContain('12');
    });
  });

  describe('formatDateTime', () => {
    it('should format a date with time correctly', () => {
      const date = '2024-01-15T14:30:00';
      const formatted = formatDateTime(date);
      // Should contain date and time
      expect(formatted).toMatch(/\d{2}\/\d{2}\/2024/);
      expect(formatted).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('calcularIMC', () => {
    it('should calculate IMC correctly', () => {
      const imc = calcularIMC(70, 175);
      // IMC = 70 / (1.75^2) = 70 / 3.0625 = 22.857... ≈ 22.9
      expect(imc).toBeCloseTo(22.9, 1);
    });

    it('should handle edge cases', () => {
      const imc = calcularIMC(50, 150);
      // IMC = 50 / (1.5^2) = 50 / 2.25 = 22.222... ≈ 22.2
      expect(imc).toBeCloseTo(22.2, 1);
    });
  });

  describe('calcularEdad', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const age = calcularEdad(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(25);
    });

    it('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth() + 1, today.getDate());
      const age = calcularEdad(birthDate.toISOString().split('T')[0]);
      expect(age).toBe(24);
    });
  });

  describe('generarId', () => {
    it('should generate a string id', () => {
      const id = generarId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate unique ids', () => {
      const id1 = generarId();
      const id2 = generarId();
      expect(id1).not.toBe(id2);
    });
  });
});

