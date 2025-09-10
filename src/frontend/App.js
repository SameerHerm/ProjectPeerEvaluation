import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseManagement from './pages/CourseManagement';
import TeamAssignment from './pages/TeamAssignment';
import Reports from './pages/Reports';
import StudentEvaluation from './pages/StudentEvaluation';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/evaluate/:token" element={<StudentEvaluation />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><CourseManagement /></ProtectedRoute>} />
            <Route path="/courses/:courseId/teams" element={<ProtectedRoute><TeamAssignment /></ProtectedRoute>} />
            <Route path="/courses/:courseId/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
