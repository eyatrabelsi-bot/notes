import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login    from './pages/Login';
import Register from './pages/Register';
import Notes    from './pages/Notes';
import Search   from './pages/Search';
import Calendar from './pages/Calendar';
import Todo     from './pages/Todo';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notes"    element={<PrivateRoute><Notes /></PrivateRoute>} />
          <Route path="/search"   element={<PrivateRoute><Search /></PrivateRoute>} />
          <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} />
          <Route path="/todo"     element={<PrivateRoute><Todo /></PrivateRoute>} />
          <Route path="*"         element={<Navigate to="/notes" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}