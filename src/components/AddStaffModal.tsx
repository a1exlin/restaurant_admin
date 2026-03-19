import { useState, useRef, useEffect } from 'react';

interface AddStaffModalProps {
  roleLabel: string;
  onAdd: (name: string) => void;
  onClose: () => void;
}

export function AddStaffModal({ roleLabel, onAdd, onClose }: AddStaffModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name.trim() || 'New Staff');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-schedule-card rounded-xl shadow-2xl border border-schedule-border w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-schedule-text mb-4">
          Add to {roleLabel}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Staff name"
            className="w-full bg-schedule-bg text-schedule-text px-4 py-3 rounded-lg border border-schedule-border focus:outline-none focus:ring-2 focus:ring-schedule-accent focus:border-transparent mb-4 placeholder:text-schedule-textMuted"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-schedule-textMuted hover:text-schedule-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-schedule-accent hover:bg-schedule-accentHover text-white font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
