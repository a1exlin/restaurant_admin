import { useState, useCallback } from 'react';
import type { RoleId, DayOfWeek, Shift, ScheduleState, RoleWithStaff, WeekSchedule } from '../types';
import { getStartOfWeek } from '../utils/dateUtils';
import { SEED_SCHEDULE } from '../data/seedSchedule';

const ROLES: { id: RoleId; label: string }[] = [
  { id: 'server', label: 'SERVER' },
  { id: 'host', label: 'HOST' },
  { id: 'bartender', label: 'BAR' },
  { id: 'busser', label: 'BUSSER' },
];

const DAYS: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const STORAGE_KEY = 'restaurant-schedule';

function migrateLegacyState(parsed: Record<string, unknown>): ScheduleState {
  const weekStart = (parsed.weekStart as string) || getStartOfWeek(new Date()).toISOString().split('T')[0];
  return {
    currentWeekStart: weekStart,
    roles: (parsed.roles as RoleWithStaff[]) ?? ROLES.map((r) => ({ ...r, staff: [] })),
    weekSchedules: {
      [weekStart]: {
        shifts: (parsed.shifts as Record<string, Record<DayOfWeek, Shift | null>>) ?? {},
        headcounts: (parsed.headcounts as WeekSchedule['headcounts']) ?? {},
      },
    },
  };
}

function loadInitialState(): ScheduleState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.weekSchedules) {
        return parsed as ScheduleState;
      }
      return migrateLegacyState(parsed);
    }
  } catch (_) {}
  return SEED_SCHEDULE;
}

function getDefaultHeadcount(roleId: RoleId, day: DayOfWeek): { morning: number; night: number } {
  const isWeekend = day === 'fri' || day === 'sat' || day === 'sun';
  if (roleId === 'server') return isWeekend ? { morning: 4, night: 6 } : { morning: 3, night: 4 };
  if (roleId === 'bartender') return isWeekend ? { morning: 1, night: 2 } : { morning: 1, night: 1 };
  if (roleId === 'host') return isWeekend ? { morning: 2, night: 3 } : { morning: 2, night: 2 };
  if (roleId === 'busser') return isWeekend ? { morning: 2, night: 3 } : { morning: 1, night: 2 };
  return { morning: 1, night: 1 };
}

function getOrCreateWeekSchedule(state: ScheduleState, weekKey: string): WeekSchedule {
  const existing = state.weekSchedules[weekKey];
  if (existing) return existing;
  return { shifts: {}, headcounts: {} } as WeekSchedule;
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
            ? { ...r, staff: r.staff.map((s) => (s.id === staffId ? { ...s, name: name.trim() || s.name } : s)) }
            : r
        ),
      }));
    },
    [updateState]
  );

  const deleteStaff = useCallback(
    (roleId: RoleId, staffId: string) => {
      updateState((prev) => {
        const weekKey = prev.currentWeekStart;
        const week = getOrCreateWeekSchedule(prev, weekKey);
        const newShifts = { ...week.shifts };
        delete newShifts[`${roleId}_${staffId}`];
        return {
          ...prev,
          roles: prev.roles.map((r) =>
            r.id === roleId ? { ...r, staff: r.staff.filter((s) => s.id !== staffId) } : r
          ),
          weekSchedules: {
            ...prev.weekSchedules,
            [weekKey]: { ...week, shifts: newShifts },
          },
        };
      });
    },
    [updateState]
  );

  const setShift = useCallback(
    (roleId: RoleId, staffId: string, day: DayOfWeek, shift: Shift | null) => {
      updateState((prev) => {
        const weekKey = prev.currentWeekStart;
        const week = getOrCreateWeekSchedule(prev, weekKey);
        const key = `${roleId}_${staffId}`;
        const dayShifts = { ...(week.shifts[key] ?? {}), [day]: shift };
        return {
          ...prev,
          weekSchedules: {
            ...prev.weekSchedules,
            [weekKey]: {
              ...week,
              shifts: { ...week.shifts, [key]: dayShifts },
            },
          },
        };
      });
    },
    [updateState]
  );

  const setHeadcount = useCallback(
    (roleId: RoleId, day: DayOfWeek, morning: number, night: number) => {
      updateState((prev) => {
        const weekKey = prev.currentWeekStart;
        const week = getOrCreateWeekSchedule(prev, weekKey);
        return {
          ...prev,
          weekSchedules: {
            ...prev.weekSchedules,
            [weekKey]: {
              ...week,
              headcounts: {
                ...week.headcounts,
                [roleId]: {
                  ...(week.headcounts[roleId] ?? {}),
                  [day]: { morning, night },
                },
              },
            },
          },
        };
      });
    },
    [updateState]
  );

  const setWeekStart = useCallback(
    (date: Date) => {
      const weekKey = getStartOfWeek(date).toISOString().split('T')[0];
      updateState((prev) => ({ ...prev, currentWeekStart: weekKey }));
    },
    [updateState]
  );

  const getShift = useCallback(
    (roleId: RoleId, staffId: string, day: DayOfWeek): Shift | null => {
      const week = state.weekSchedules[state.currentWeekStart];
      if (!week) return null;
      const key = `${roleId}_${staffId}`;
      return week.shifts[key]?.[day] ?? null;
    },
    [state.weekSchedules, state.currentWeekStart]
  );

  const getHeadcount = useCallback(
    (roleId: RoleId, day: DayOfWeek): { morning: number; night: number } => {
      const week = state.weekSchedules[state.currentWeekStart];
      if (!week?.headcounts[roleId]?.[day]) return getDefaultHeadcount(roleId, day);
      return week.headcounts[roleId][day];
    },
    [state.weekSchedules, state.currentWeekStart]
  );

  const copyWeekToNext = useCallback(() => {
    updateState((prev) => {
      const current = prev.currentWeekStart;
      const currentDate = new Date(current + 'T12:00:00');
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
      const nextKey = getStartOfWeek(nextDate).toISOString().split('T')[0];
      const week = getOrCreateWeekSchedule(prev, current);
      return {
        ...prev,
        weekSchedules: {
          ...prev.weekSchedules,
          [nextKey]: {
            shifts: JSON.parse(JSON.stringify(week.shifts)),
            headcounts: JSON.parse(JSON.stringify(week.headcounts)),
          },
        },
        currentWeekStart: nextKey,
      };
    });
  }, [updateState]);

  const loadSampleSchedule = useCallback(() => {
    updateState(() => SEED_SCHEDULE);
  }, [updateState]);

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
    copyWeekToNext,
    loadSampleSchedule,
    days: DAYS,
  };
}
