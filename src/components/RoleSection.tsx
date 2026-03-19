import { useState } from 'react';
import type { RoleId, DayOfWeek } from '../types';
import { StaffRow } from './StaffRow';
import { HeadcountCell } from './HeadcountCell';
import { AddStaffModal } from './AddStaffModal';

interface RoleSectionProps {
  roleId: RoleId;
  label: string;
  staff: { id: string; name: string }[];
  weekDates: { day: DayOfWeek; date: Date; label: string }[];
  getShift: (roleId: RoleId, staffId: string, day: DayOfWeek) => { timeRange: string; suffix?: string } | null;
  setShift: (roleId: RoleId, staffId: string, day: DayOfWeek, shift: { timeRange: string; suffix?: string } | null) => void;
  getHeadcount: (roleId: RoleId, day: DayOfWeek) => { morning: number; night: number };
  setHeadcount: (roleId: RoleId, day: DayOfWeek, morning: number, night: number) => void;
  onAddStaff: (roleId: RoleId, name: string) => void;
  onUpdateStaff: (roleId: RoleId, staffId: string, name: string) => void;
  onDeleteStaff: (roleId: RoleId, staffId: string) => void;
}

export function RoleSection({
  roleId,
  label,
  staff,
  weekDates,
  getShift,
  setShift,
  getHeadcount,
  setHeadcount,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}: RoleSectionProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const days = weekDates.map((w) => w.day);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-schedule-accent uppercase tracking-wider">{label}</h2>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-schedule-accent hover:bg-schedule-accentHover text-white font-medium text-sm transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-schedule-border shadow-lg bg-schedule-card">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-schedule-accentLight/20">
              <th className="p-2 md:p-3 text-left text-sm font-semibold text-schedule-text sticky left-0 z-20 bg-schedule-accentLight/20 min-w-[6rem] md:min-w-[8rem]">
                Name
              </th>
              {weekDates.map(({ day, label: dayLabel }) => (
                <th
                  key={day}
                  className="p-2 md:p-3 text-center text-xs md:text-sm font-semibold text-schedule-textMuted min-w-[4rem] md:min-w-[5rem]"
                >
                  {dayLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <StaffRow
                key={s.id}
                roleId={roleId}
                staffId={s.id}
                name={s.name}
                days={days}
                getShift={getShift}
                setShift={setShift}
                onUpdateName={(name) => onUpdateStaff(roleId, s.id, name)}
                onDelete={() => onDeleteStaff(roleId, s.id)}
              />
            ))}
            {staff.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-6 text-center text-schedule-textMuted text-sm"
                >
                  No staff yet. Click &quot;Add&quot; to add someone.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-schedule-accentLight/30 border-t-2 border-schedule-accent/30">
              <td className="p-2 md:p-3 text-sm font-semibold text-schedule-headcount sticky left-0 z-10 bg-schedule-accentLight/30">
                Headcount (AM-PM)
              </td>
              {days.map((day) => (
                <HeadcountCell
                  key={day}
                  morning={getHeadcount(roleId, day).morning}
                  night={getHeadcount(roleId, day).night}
                  onChange={(m, n) => setHeadcount(roleId, day, m, n)}
                  day={day}
                />
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {showAddModal && (
        <AddStaffModal
          roleLabel={label}
          onAdd={(name) => {
            onAddStaff(roleId, name);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </section>
  );
}
