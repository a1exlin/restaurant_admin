import type { RoleWithStaff } from '../types';
import { useScheduleStore } from '../store/useScheduleStore';
import { getWeekDates } from '../utils/dateUtils';
import { WeekNavigator } from '../components/WeekNavigator';
import { RoleSection } from '../components/RoleSection';
import { useAuth } from '../auth/AuthContext';
import { BRAND_LOGO_ALT, BRAND_SITE_URL, ECHO_FIVES_LOGO_SRC } from '../brand';

export default function SchedulePage() {
  const { logout } = useAuth();
  const {
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
    randomizeServerSectionShifts,
  } = useScheduleStore();

  const weekStart = new Date(state.currentWeekStart + 'T12:00:00');
  const weekDates = getWeekDates(weekStart);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${weekStart.getFullYear()}`;

  return (
    <div className="min-h-screen bg-schedule-bg text-schedule-text font-sans">
      <div className="schedule-container max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="hidden print:block text-xl font-bold mb-4 text-black">
          Schedule — Week of {weekLabel}
        </div>
        <WeekNavigator
          weekStart={state.currentWeekStart}
          onWeekChange={setWeekStart}
          onLogout={logout}
        />

        <div className="no-print flex flex-wrap items-center gap-3 mb-6">
          <p className="text-schedule-textMuted text-sm">
            Target headcount (AM–PM) per role. Tap any cell to assign shifts. Each week saves separately.
          </p>
          <button
            type="button"
            onClick={copyWeekToNext}
            className="px-3 py-1.5 rounded-lg border border-schedule-border hover:bg-schedule-accentLight/30 text-schedule-text text-sm font-medium transition-colors"
          >
            Copy to next week
          </button>
          <button
            type="button"
            onClick={loadSampleSchedule}
            className="px-3 py-1.5 rounded-lg border border-schedule-border hover:bg-schedule-accentLight/30 text-schedule-text text-sm font-medium transition-colors"
          >
            Load sample
          </button>
        </div>

        {(state.roles as RoleWithStaff[]).map((role) => (
          <RoleSection
            key={role.id}
            roleId={role.id}
            label={role.label}
            staff={role.staff}
            weekDates={weekDates}
            getShift={getShift}
            setShift={setShift}
            getHeadcount={getHeadcount}
            setHeadcount={setHeadcount}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onDeleteStaff={deleteStaff}
            onRandomizeSections={role.id === 'server' ? randomizeServerSectionShifts : undefined}
          />
        ))}

        <footer className="no-print mt-12 pt-6 border-t border-schedule-border text-center text-schedule-textMuted text-sm flex flex-col items-center gap-2">
          <span className="flex items-center gap-2 flex-wrap justify-center">
            Powered by{' '}
            <a href={BRAND_SITE_URL} target="_blank" rel="noopener noreferrer" className="inline-block">
              <img src={ECHO_FIVES_LOGO_SRC} alt={BRAND_LOGO_ALT} className="h-6 inline-block" />
            </a>{' '}
            © 2026
          </span>
        </footer>
      </div>
    </div>
  );
}
