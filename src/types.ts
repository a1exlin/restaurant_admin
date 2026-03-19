export type RoleId = 'server' | 'host' | 'bartender' | 'busser';

export interface Role {
  id: RoleId;
  label: string;
  staff: StaffMember[];
}

export interface StaffMember {
  id: string;
  name: string;
}

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Shift {
  timeRange: string; // e.g. "5-11", "11-5", "11-11", "RO"
  suffix?: string;  // e.g. "P", "R", "G", "F", "B"
}

export interface ScheduleData {
  weekStart: string; // ISO date
  shifts: Record<string, Record<string, Shift | null>>; // roleId_staffId -> day -> shift
  headcounts: Record<string, Record<DayOfWeek, { morning: number; night: number }>>; // roleId -> day -> headcount
}

export interface RoleWithStaff {
  id: RoleId;
  label: string;
  staff: StaffMember[];
}

export interface ScheduleState {
  weekStart: string;
  roles: RoleWithStaff[];
  shifts: Record<string, Record<DayOfWeek, Shift | null>>;
  headcounts: Record<RoleId, Record<DayOfWeek, { morning: number; night: number }>>;
}
