export type RoleId = 'server' | 'host' | 'bartender' | 'busser';

export interface StaffMember {
  id: string;
  name: string;
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Shift {
  timeRange: string;
  suffix?: string;
}

export interface RoleWithStaff {
  id: RoleId;
  label: string;
  staff: StaffMember[];
}

export interface WeekSchedule {
  shifts: Record<string, Record<DayOfWeek, Shift | null>>;
  headcounts: Record<RoleId, Record<DayOfWeek, { morning: number; night: number }>>;
}

export interface ScheduleState {
  currentWeekStart: string;
  roles: RoleWithStaff[];
  weekSchedules: Record<string, WeekSchedule>;
}
