import type { RoleWithStaff } from './types';
import { useScheduleStore } from './store/useScheduleStore';
import { getWeekDates } from './utils/dateUtils';
import { WeekNavigator } from './components/WeekNavigator';
import { RoleSection } from './components/RoleSection';

function App() {
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
  } = useScheduleStore();

  const weekStart = new Date(state.weekStart + 'T12:00:00');
  const weekDates = getWeekDates(weekStart);

  return (
    <div className="min-h-screen bg-schedule-bg text-schedule-text font-sans">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-8">
        <WeekNavigator
          weekStart={state.weekStart}
          onWeekChange={setWeekStart}
        />

        <p className="text-schedule-textMuted text-sm mb-6">
          Target headcount (AM–PM) per role. Tap any cell to assign shifts. Changes save automatically.
        </p>

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
          />
        ))}
      </div>
    </div>
  );
}

export default App;
