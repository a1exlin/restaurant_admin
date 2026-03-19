import { useState, useCallback } from 'react';
import type { RoleId, DayOfWeek, Shift, ScheduleState, RoleWithStaff } from '../types';
import { getStartOfWeek } from '../utils/dateUtils';

const ROLES: { id: RoleId; label: string }[] = [
  { id: 'server', label: 'SERVER' },
  { id: 'host', label: 'HOST' },
  { id: 'bartender', label: 'BAR' },
  { id: 'busser', label: 'BUSSER' },
];

const DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const STORAGE_KEY = 'restaurant-schedule';

function loadInitialState(): ScheduleState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        weekStart: parsed.weekStart || new Date().toISOString().split('T')[0],
        roles: parsed.roles ?? ROLES.map((r: { id: RoleId; label: string }) => ({ ...r, staff: [] })),
        shifts: parsed.shifts ?? {},
        headcounts: parsed.headcounts ?? {},
      };
    }
  } catch (_) {}
  const weekStart = getStartOfWeek(new Date());
  return {
    weekStart: weekStart.toISOString().split('T')[0],
    roles: ROLES.map((r) => ({ ...r, staff: [] })),
    shifts: {} as Record<string, Record<DayOfWeek, Shift | null>>,
    headcounts: {} as Record<RoleId, Record<DayOfWeek, { morning: number; night: number }>>,
  };
}

function getDefaultHeadcount(roleId: RoleId, day: DayOfWeek): { morning: number; night: number } {
  const isWeekend = day === 'fri' || day === 'sat' || day === 'sun';
  if (roleId === 'server') return isWeekend ? { morning: 4, night: 6 } : { morning: 3, night: 4 };
  if (roleId === 'bartender') return isWeekend ? { morning: 1, night: 2 } : { morning: 1, night: 1 };
  if (roleId === 'host') return isWeekend ? { morning: 2, night: 3 } : { morning: 2, night: 2 };
  if (roleId === 'busser') return isWeekend ? { morning: 2, night: 3 } : { morning: 1, night: 2 };
  return { morning: 1, night: 1 };
}

function persistToStorage(state: ScheduleState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.error('Schedule storage full. Try removing old data.');
    } else {
      console.error('Failed to save schedule:', e);
    }
  }
}

export function useScheduleStore() {
  const [state, setState] = useState(loadInitialState);

  const updateState = useCallback((updater: (prev: ScheduleState) => ScheduleState) => {
    setState((prev) => {
      const next = updater(prev);
      persistToStorage(next);
      return next;
    });
  }, []);

  const addStaff = useCallback(
    (roleId: RoleId, name: string) => {
      updateState((prev) => {
        const role = prev.roles.find((r) => r.id === roleId);
        if (!role) return prev;
        const id = `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const staff = { id, name: name.trim() || 'New' };
        return {
          ...prev,
          roles: prev.roles.map((r: RoleWithStaff) =>
            r.id === roleId ? { ...r, staff: [...r.staff, staff] } : r
          ),
        };
      });
    },
    [updateState]
  );

  const updateStaff = useCallback(
    (roleId: RoleId, staffId: string, name: string) => {
      updateState((prev) => ({
        ...prev,
        roles: prev.roles.map((r: RoleWithStaff) =>
          r.id === roleId
            ? { ...r, staff: r.staff.map((s: { id: string; name: string }) => (s.id === staffId ? { ...s, name: name.trim() || s.name } : s)) }
            : r
        ),
      }));
    },
    [updateState]
  );

  const deleteStaff = useCallback(
    (roleId: RoleId, staffId: string) => {
      updateState((prev) => {
        const newShifts = { ...prev.shifts };
        delete newShifts[`${roleId}_${staffId}`];
        return {
          ...prev,
          roles: prev.roles.map((r: RoleWithStaff) =>
            r.id === roleId ? { ...r, staff: r.staff.filter((s: { id: string }) => s.id !== staffId) } : r
          ),
          shifts: newShifts,
        };
      });
    },
    [updateState]
  );

  const setShift = useCallback(
    (roleId: RoleId, staffId: string, day: DayOfWeek, shift: Shift | null) => {
      updateState((prev) => {
        const key = `${roleId}_${staffId}`;
        const dayShifts = { ...(prev.shifts[key] ?? {}), [day]: shift };
        return {
          ...prev,
          shifts: { ...prev.shifts, [key]: dayShifts },
        };
      });
    },
    [updateState]
  );

  const setHeadcount = useCallback(
    (roleId: RoleId, day: DayOfWeek, morning: number, night: number) => {
      updateState((prev) => ({
        ...prev,
        headcounts: {
          ...prev.headcounts,
          [roleId]: {
            ...(prev.headcounts[roleId] ?? {}),
            [day]: { morning, night },
          },
        },
      }));
    },
    [updateState]
  );

  const setWeekStart = useCallback(
    (date: Date) => {
      const weekStart = getStartOfWeek(date).toISOString().split('T')[0];
      updateState((prev) => ({ ...prev, weekStart }));
    },
    [updateState]
  );

  const getShift = useCallback(
    (roleId: RoleId, staffId: string, day: DayOfWeek): Shift | null => {
      const key = `${roleId}_${staffId}`;
      return state.shifts[key]?.[day] ?? null;
    },
    [state.shifts]
  );

  const getHeadcount = useCallback(
    (roleId: RoleId, day: DayOfWeek): { morning: number; night: number } => {
      return (
        state.headcounts[roleId]?.[day] ?? getDefaultHeadcount(roleId, day)
      );
    },
    [state.headcounts]
  );

  return {
    state,
    addStaff,
    updateStaff,
    deleteStaff,
    setShift,
    setHeadcount,
    setWeekStart,
    getShift,
    getHeadcount,
    days: DAYS,
  };
}
