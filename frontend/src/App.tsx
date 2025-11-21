import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';
import GardenViewer from './components/GardenViewer';
import CheckInForm from './components/CheckInForm';
import ARPreview from './components/ARPreview';
import Navigation from './components/Navigation';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navigation />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/garden" /> : <LoginForm />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/garden" /> : <LoginForm isRegister={true} />}
            />
            <Route
              path="/garden"
              element={user ? <GardenViewer /> : <Navigate to="/login" />}
            />
            <Route
              path="/checkin"
              element={user ? <CheckInForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/ar-preview"
              element={user ? <ARPreview /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/garden" : "/login"} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
