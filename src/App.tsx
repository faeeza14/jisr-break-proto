import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastProvider } from '@jisr-hr/ds-web';
import { SettingsShell } from './components/shell/SettingsShell';
import { ShiftsPage } from './pages/ShiftsPage';
import { ShiftsLayout } from './pages/ShiftsLayout';
import { PresetDetail } from './pages/PresetDetail';
import { PoliciesPage } from './pages/PoliciesPage';
import { BreakPolicyDetail } from './pages/BreakPolicyDetail';
import { Placeholder } from './pages/Placeholder';
import { SchedulerPage } from './pages/SchedulerPage';
import { NewPolicyPage } from './pages/NewPolicyPage';
import { NewTemplatePage } from './pages/NewTemplatePage';

// Strip the trailing slash that Vite's BASE_URL always carries so React Router accepts it.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

const App = () => (
  <ToastProvider>
  <Router basename={basename}>
    <Routes>
      <Route path="/" element={<Navigate to="/settings/attendance/shifts" replace />} />
      <Route element={<SettingsShell />}>
        <Route path="/settings" element={<Navigate to="/settings/attendance/shifts" replace />} />
        <Route path="/settings/attendance/shifts" element={<ShiftsLayout />}>
          <Route index element={<Navigate to="scheduler" replace />} />
          <Route path="scheduler" element={<SchedulerPage />} />
          <Route path="settings" element={<ShiftsPage />} />
        </Route>
        <Route path="/settings/attendance/shifts/presets/new" element={<PresetDetail />} />
        <Route path="/settings/attendance/shifts/presets/:id" element={<PresetDetail />} />
        <Route path="/settings/attendance/shifts/templates/new" element={<NewTemplatePage />} />
        <Route path="/settings/attendance/policies" element={<PoliciesPage />} />
        <Route path="/settings/attendance/policies/new" element={<NewPolicyPage />} />
        <Route
          path="/settings/attendance/policies/break/:id"
          element={<BreakPolicyDetail />}
        />
        <Route
          path="/settings/attendance/policies/break/new"
          element={<BreakPolicyDetail />}
        />
        <Route
          path="/settings/attendance/policies/clock_window/:id"
          element={
            <Placeholder
              title="Clock-in window policy"
              subtitle="Detail editor placeholder for prototype scope"
            />
          }
        />
        <Route
          path="/settings/attendance/policies/overtime/:id"
          element={
            <Placeholder
              title="Overtime policy"
              subtitle="Detail editor placeholder for prototype scope"
            />
          }
        />
        <Route
          path="/settings/attendance/tracking"
          element={
            <Placeholder
              title="Attendance tracking methods"
              subtitle="Coming soon — out of scope for v1"
            />
          }
        />
      </Route>
    </Routes>
  </Router>
  </ToastProvider>
);

export default App;
