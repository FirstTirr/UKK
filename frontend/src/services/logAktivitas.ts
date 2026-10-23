import { apiFetch } from '@/lib/api';

export interface LogAktivitas {
  id_log_aktivitas: number;
  id_user: number;
  aktivitas: string;
  ip_address: string | null;
  created_at: string;
  username: string | null;
  role: string | null;
}

export const logAktivitasService = {
  getAll: () => apiFetch<LogAktivitas[]>('/log-aktivitas/read'),
};
