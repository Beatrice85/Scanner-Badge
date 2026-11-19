import RouteurApp from './routes/RouteurApp';
import AuthProvider from './features/auth/context/AuthProvider';
import NotificationsToast from './shared/components/NotificationsToast';

export default function App() {
  return (
    <AuthProvider>
      <RouteurApp />
      <NotificationsToast />
    </AuthProvider>
  );
}
