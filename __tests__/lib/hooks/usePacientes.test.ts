import { renderHook, waitFor, act } from '@testing-library/react';
import { usePacientes, usePaciente } from '@/lib/hooks/usePacientes';
import { supabase } from '@/lib/supabase';

// Mock Supabase - this will override the global mock in jest.setup.js
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  checkConnection: jest.fn(),
}));

describe('usePacientes Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    (supabase.from as jest.Mock).mockClear();
  });

  it('should fetch pacientes successfully', async () => {
    const mockPacientes = [
      { id: '1', nombre: 'Juan Pérez', email: 'juan@test.com', activo: true },
      { id: '2', nombre: 'María García', email: 'maria@test.com', activo: true },
    ];

    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: mockPacientes, error: null }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => usePacientes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pacientes).toEqual(mockPacientes);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const mockError = { message: 'Error fetching pacientes' };

    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => usePacientes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pacientes).toEqual([]);
    expect(result.current.error).toBe('Error fetching pacientes');
  });

  it('should create paciente successfully', async () => {
    const newPaciente = {
      nombre: 'Test User',
      dni: '12345678A',
      telefono: '123456789',
      fecha_nacimiento: '1990-01-01',
      email: 'test@test.com',
    };

    const mockInsert = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: { id: '1', ...newPaciente }, error: null }),
      }),
    });

    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
    });

    const { result } = renderHook(() => usePacientes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let created;
    await act(async () => {
      created = await result.current.createPaciente(newPaciente as any);
    });

    expect(created).toBeTruthy();
    expect(created?.nombre).toBe('Test User');
  });
});

describe('usePaciente Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    (supabase.from as jest.Mock).mockClear();
  });

  it('should fetch single paciente successfully', async () => {
    const mockPaciente = {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
      activo: true,
    };

    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockPaciente, error: null }),
      }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
    });

    const { result } = renderHook(() => usePaciente('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.paciente).toEqual(mockPaciente);
    expect(result.current.error).toBeNull();
  });

  it('should update paciente successfully', async () => {
    const mockPaciente = {
      id: '1',
      nombre: 'Juan Pérez',
      email: 'juan@test.com',
    };

    let fetchPacienteCallCount = 0;
    const mockSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockImplementation(() => {
          fetchPacienteCallCount++;
          return Promise.resolve({ data: mockPaciente, error: null });
        }),
      }),
    });

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });

    const { result } = renderHook(() => usePaciente('1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success;
    await act(async () => {
      success = await result.current.updatePaciente({ nombre: 'Juan Updated' });
    });

    expect(success).toBe(true);
    // Verify that fetchPaciente was called after update
    await waitFor(() => {
      expect(fetchPacienteCallCount).toBeGreaterThan(1);
    });
  });
});

