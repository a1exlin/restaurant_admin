import { useState, useRef, useEffect } from 'react';
import type { DayOfWeek } from '../types';

interface HeadcountCellProps {
  morning: number;
  night: number;
  onChange: (morning: number, night: number) => void;
  day: DayOfWeek; // for key prop in parent
}

export function HeadcountCell({ morning, night, onChange }: HeadcountCellProps) {
  const [editing, setEditing] = useState(false);
  const [m, setM] = useState(String(morning));
  const [n, setN] = useState(String(night));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    setM(String(morning));
    setN(String(night));
  }, [morning, night]);

  const handleBlur = () => {
    const morningNum = Math.max(0, parseInt(m, 10) || 0);
    const nightNum = Math.max(0, parseInt(n, 10) || 0);
    onChange(morningNum, nightNum);
    setEditing(false);
    setM(String(morningNum));
    setN(String(nightNum));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBlur();
    if (e.key === 'Escape') {
      setM(String(morning));
      setN(String(night));
      setEditing(false);
    }
  };

  return (
    <td className="p-1 md:p-2 border-b border-schedule-border bg-schedule-accentLight/10 min-w-[4rem] md:min-w-[5rem]">
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="number"
            min={0}
            value={m}
            onChange={(e) => setM(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-10 bg-schedule-bg text-schedule-text text-sm px-1 py-0.5 rounded border border-schedule-accent/50 focus:outline-none focus:ring-1 focus:ring-schedule-accent"
          />
          <span className="text-schedule-textMuted">-</span>
          <input
            type="number"
            min={0}
            value={n}
            onChange={(e) => setN(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-10 bg-schedule-bg text-schedule-text text-sm px-1 py-0.5 rounded border border-schedule-accent/50 focus:outline-none focus:ring-1 focus:ring-schedule-accent"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full text-left text-sm font-medium py-1 px-2 rounded hover:bg-schedule-accentLight/20 transition-colors text-schedule-headcount"
        >
          {morning}-{night}
        </button>
      )}
    </td>
  );
}
