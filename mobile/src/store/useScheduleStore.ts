import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RoleId, DayOfWeek, Shift, ScheduleState, RoleWithStaff, WeekSchedule } from '../types';
import { getStartOfWeek } from '../utils/dateUtils';
import { SEED_SCHEDULE } from '../data/seedSchedule';
import {
  fairSectionLettersForDay,
  shiftWithSectionLetter,
  WEEK_DAYS,
} from '../utils/serverSectionRandom';

const ROLES: { id: RoleId; label: string }[] = [
  { id: 'server', label: 'SERVER' },
  { id: 'host', label: 'HOST' },
  { id: 'bartender', label: 'BAR' },
  { id: 'busser', label: 'BUSSER' },
];

const STORAGE_KEY = '@restaurant-schedule';

function migrateLegacy(parsed: Record<string, unknown>): ScheduleState {
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

function getDefaultHeadcount(roleId: RoleId, day: DayOfWeek): { morning: number; night: number } {
  const isWeekend = day === 'fri' || day === 'sat' || day === 'sun';
  if (roleId === 'server') return isWeekend ? { morning: 4, night: 6 } : { morning: 3, night: 4 };
  if (roleId === 'bartender') return isWeekend ? { morning: 1, night: 2 } : { morning: 1, night: 1 };
  if (roleId === 'host') return isWeekend ? { morning: 2, night: 3 } : { morning: 2, night: 2 };
  if (roleId === 'busser') return isWeekend ? { morning: 2, night: 3 } : { morning: 1, night: 2 };
  return { morning: 1, night: 1 };
}

function getOrCreateWeek(state: ScheduleState, weekKey: string): WeekSchedule {
  const existing = state.weekSchedules[weekKey];
  if (existing) return existing;
  return { shifts: {}, headcounts: {} } as WeekSchedule;
}

async function loadFromStorage(): Promise<ScheduleState> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.weekSchedules) return parsed as ScheduleState;
      return migrateLegacy(parsed);
    }
  } catch (_) {}
  return SEED_SCHEDULE;
}

export function useScheduleStore() {
  const [state, setState] = useState<ScheduleState>(SEED_SCHEDULE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    loadFromStorage().then((loaded) => {
      setState(loaded);
      setIsHydrated(true);
    });
  }, []);

  const updateState = useCallback((updater: (prev: ScheduleState) => ScheduleState) => {
    setState((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addStaff = useCallback(
    (roleId: RoleId, name: string) => {
      updateState((prev) => {
        const role = prev.roles.find((r) => r.id === roleId);
        if (!role) return prev;
        const id = `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return {
          ...prev,
          roles: prev.roles.map((r) =>
            r.id === roleId ? { ...r, staff: [...r.staff, { id, name: name.trim() || 'New' }] } : r
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
        roles: prev.roles.map((r) =>
          r.id === roleId ? { ...r, staff: r.staff.map((s) => (s.id === staffId ? { ...s, name: name.trim() || s.name } : s)) } : r
        ),
      }));
    },
    [updateState]
  );

  const deleteStaff = useCallback(
    (roleId: RoleId, staffId: string) => {
      updateState((prev) => {
        const weekKey = prev.currentWeekStart;
        const week = getOrCreateWeek(prev, weekKey);
        const newShifts = { ...week.shifts };
        delete newShifts[`${roleId}_${staffId}`];
        return {
          ...prev,
          roles: prev.roles.map((r) => (r.id === roleId ? { ...r, staff: r.staff.filter((s) => s.id !== staffId) } : r)),
          weekSchedules: { ...prev.weekSchedules, [weekKey]: { ...week, shifts: newShifts } },
        };
      });
    },
    [updateState]
  );

  const setShift = useCallback(
    (roleId: RoleId, staffId: string, day: DayOfWeek, shift: Shift | null) => {
      updateState((prev) => {
        const weekKey = prev.currentWeekStart;
        const week = getOrCreateWeek(prev, weekKey);
        const key = `${roleId}_${staffId}`;
        const dayShifts = { ...(week.shifts[key] ?? {}), [day]: shift };
        return {
          ...prev,
          weekSchedules: {
            ...prev.weekSchedules,
            [weekKey]: { ...week, shifts: { ...week.shifts, [key]: dayShifts } },
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
        const week = getOrCreateWeek(prev, weekKey);
        return {
          ...prev,
          weekSchedules: {
            ...prev.weekSchedules,
            [weekKey]: {
              ...week,
              headcounts: {
                ...week.headcounts,
                [roleId]: { ...(week.headcounts[roleId] ?? {}), [day]: { morning, night } },
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
      return week.shifts[`${roleId}_${staffId}`]?.[day] ?? null;
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
      const nextDate = new Date(current + 'T12:00:00');
      nextDate.setDate(nextDate.getDate() + 7);
      const nextKey = getStartOfWeek(nextDate).toISOString().split('T')[0];
      const week = getOrCreateWeek(prev, current);
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

  const loadSampleSchedule = useCallback(() => updateState(() => SEED_SCHEDULE), [updateState]);

  const randomizeServerSectionShifts = useCallback(() => {
    updateState((prev) => {
      const weekKey = prev.currentWeekStart;
      const week = getOrCreateWeek(prev, weekKey);
      const serverRole = prev.roles.find((r) => r.id === 'server');
      if (!serverRole?.staff.length) return prev;

      const staffList = serverRole.staff;
      const n = staffList.length;
      const newShifts = { ...week.shifts };

      for (const day of WEEK_DAYS) {
        const letters = fairSectionLettersForDay(n);
        staffList.forEach((staff, i) => {
          const key = `server_${staff.id}`;
          const current = newShifts[key]?.[day] ?? week.shifts[key]?.[day] ?? null;
          const letter = letters[i];
          const next = shiftWithSectionLetter(current, letter);
          newShifts[key] = { ...(newShifts[key] ?? {}), [day]: next };
        });
      }

      return {
        ...prev,
        weekSchedules: {
          ...prev.weekSchedules,
          [weekKey]: { ...week, shifts: newShifts },
        },
      };
    });
  }, [updateState]);

  return {
    state,
    isHydrated,
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
    randomizeServerSectionShifts,
  };
}
