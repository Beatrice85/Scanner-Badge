import RouteurApp from './routes/RouteurApp';
import AuthProvider from './features/auth/context/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <RouteurApp />
    </AuthProvider>
  );
}
