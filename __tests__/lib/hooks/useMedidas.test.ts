import { renderHook, waitFor, act } from '@testing-library/react';
import { useMedidas } from '@/lib/hooks/useMedidas';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  checkConnection: jest.fn(),
}));

describe('useMedidas Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch medidas successfully', async () => {
    const mockMedidas = [
      {
        id: '1',
        paciente_id: '1',
        fecha: '2024-01-15',
        hora: '10:00',
        bioimpedancia: { peso: 70, imc: 22.5 },
      },
    ];

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockMedidas, error: null }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => useMedidas('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.medidas).toEqual(mockMedidas);
  });

  it('should create medida successfully', async () => {
    const newMedida = {
      paciente_id: '1',
      fecha: '2024-01-15',
      hora: '10:00',
      bioimpedancia: { peso: 70 },
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: '1', ...newMedida }, error: null }),
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

    const { result } = renderHook(() => useMedidas('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let created;
    await act(async () => {
      created = await result.current.createMedida(newMedida as any);
    });

    expect(created).toBeTruthy();
    expect(created?.fecha).toBe('2024-01-15');
  });
});

