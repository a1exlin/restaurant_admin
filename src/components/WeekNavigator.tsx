import { getWeekDates, getStartOfWeek } from '../utils/dateUtils';

interface WeekNavigatorProps {
  weekStart: string;
  onWeekChange: (date: Date) => void;
}

export function WeekNavigator({ weekStart, onWeekChange }: WeekNavigatorProps) {
  const start = new Date(weekStart + 'T12:00:00');
  const weekDates = getWeekDates(start);

  const goPrev = () => {
    const d = new Date(start);
    d.setDate(d.getDate() - 7);
    onWeekChange(d);
  };

  const goNext = () => {
    const d = new Date(start);
    d.setDate(d.getDate() + 7);
    onWeekChange(d);
  };

  const goToday = () => {
    onWeekChange(getStartOfWeek(new Date()));
  };

  const weekLabel = `${weekDates[0].date.toLocaleDateString('en-US', { month: 'short' })} ${weekDates[0].date.getDate()} – ${weekDates[6].date.toLocaleDateString('en-US', { month: 'short' })} ${weekDates[6].date.getDate()}, ${weekDates[6].date.getFullYear()}`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <h1 className="text-xl md:text-2xl font-bold text-schedule-text">
        Schedule
      </h1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          className="p-2 rounded-lg bg-schedule-card border border-schedule-border hover:bg-schedule-accentLight/30 text-schedule-text transition-colors shadow-sm"
          aria-label="Previous week"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm md:text-base font-medium text-schedule-textMuted min-w-[12rem] text-center">
          {weekLabel}
        </span>
        <button
          type="button"
          onClick={goNext}
          className="p-2 rounded-lg bg-schedule-card border border-schedule-border hover:bg-schedule-accentLight/30 text-schedule-text transition-colors shadow-sm"
          aria-label="Next week"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={goToday}
          className="ml-2 px-3 py-1.5 rounded-lg bg-schedule-accent hover:bg-schedule-accentHover text-white text-sm font-medium transition-colors shadow-sm"
        >
          Today
        </button>
      </div>
    </div>
  );
}
