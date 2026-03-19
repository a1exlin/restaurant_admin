import { useState, useRef, useEffect } from 'react';
import type { DayOfWeek, Shift } from '../types';
import { formatShiftDisplay, parseShiftInput } from '../utils/dateUtils';

interface ShiftCellProps {
  value: Shift | null;
  onChange: (shift: Shift | null) => void;
  day?: DayOfWeek; // optional, for key in parent
  placeholder?: string;
}

export function ShiftCell({ value, onChange, placeholder = '' }: ShiftCellProps) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(formatShiftDisplay(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleBlur = () => {
    const parsed = parseShiftInput(input);
    onChange(parsed);
    setEditing(false);
    setInput(formatShiftDisplay(parsed));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setInput(formatShiftDisplay(value));
      setEditing(false);
    }
  };

  const display = formatShiftDisplay(value) || placeholder;

  return (
    <td className="p-1 md:p-2 border-b border-schedule-border min-w-[4rem] md:min-w-[5rem]">
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full bg-schedule-bg text-schedule-text text-sm px-2 py-1 rounded border border-schedule-accent/50 focus:outline-none focus:ring-1 focus:ring-schedule-accent"
          placeholder="5-11, 11-5, RO..."
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setInput(display);
            setEditing(true);
          }}
          className="w-full text-left text-sm py-1 px-2 rounded hover:bg-schedule-accentLight/20 transition-colors min-h-[2rem] text-schedule-text"
        >
          {display || <span className="text-schedule-textMuted">—</span>}
        </button>
      )}
    </td>
  );
}
