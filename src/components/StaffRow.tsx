import { useState } from 'react';
import type { RoleId, DayOfWeek } from '../types';
import { ShiftCell } from './ShiftCell';

interface StaffRowProps {
  roleId: RoleId;
  staffId: string;
  name: string;
  days: DayOfWeek[];
  getShift: (roleId: RoleId, staffId: string, day: DayOfWeek) => { timeRange: string; suffix?: string } | null;
  setShift: (roleId: RoleId, staffId: string, day: DayOfWeek, shift: { timeRange: string; suffix?: string } | null) => void;
  onUpdateName: (name: string) => void;
  onDelete: () => void;
}

export function StaffRow({
  roleId,
  staffId,
  name,
  days,
  getShift,
  setShift,
  onUpdateName,
  onDelete,
}: StaffRowProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(name);

  const handleNameBlur = () => {
    onUpdateName(nameInput.trim() || name);
    setEditingName(false);
  };

  return (
    <tr className="hover:bg-schedule-accentLight/10 transition-colors">
      <td className="p-1 md:p-2 border-b border-schedule-border sticky left-0 z-10 bg-schedule-card min-w-[6rem] md:min-w-[8rem]">
        <div className="flex items-center gap-1">
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              autoFocus
              className="flex-1 bg-schedule-bg text-schedule-text text-sm px-2 py-1 rounded border border-schedule-accent/50 focus:outline-none focus:ring-1 focus:ring-schedule-accent"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="flex-1 text-left text-sm font-medium py-1 px-2 rounded hover:bg-schedule-accentLight/20 text-schedule-text truncate"
            >
              {name}
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-100 text-schedule-textMuted hover:text-red-600 transition-colors"
            title="Delete"
            aria-label="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
      {days.map((day) => (
        <ShiftCell
          key={day}
          value={getShift(roleId, staffId, day)}
          onChange={(shift) => setShift(roleId, staffId, day, shift)}
          day={day}
        />
      ))}
    </tr>
  );
}
