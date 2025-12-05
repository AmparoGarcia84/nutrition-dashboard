import { renderHook, waitFor, act } from '@testing-library/react';
import { useDietas } from '@/lib/hooks/useDietas';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  checkConnection: jest.fn(),
}));

describe('useDietas Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch dietas successfully', async () => {
    const mockDietas = [
      {
        id: '1',
        paciente_id: '1',
        nombre: 'Dieta Semanal',
        fecha_inicio: '2024-01-15',
        fecha_fin: '2024-01-22',
        calorias: 2000,
        comidas: [],
      },
    ];

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockDietas, error: null }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useDietas('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dietas).toEqual(mockDietas);
  });

  it('should create dieta successfully', async () => {
    const newDieta = {
      paciente_id: '1',
      nombre: 'Nueva Dieta',
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-01-22',
      calorias: 2000,
      comidas: [],
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: '1', ...newDieta }, error: null }),
      }),
    });

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });

    const { result } = renderHook(() => useDietas('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let created;
    await act(async () => {
      created = await result.current.createDieta(newDieta as any);
    });

    expect(created).toBeTruthy();
    expect(created?.nombre).toBe('Nueva Dieta');
  });
});

