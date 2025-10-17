import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CourseManagement from './pages/CourseManagement';
import LoginPage from './pages/LoginPage';
import StudentEvaluation from './pages/StudentEvaluation';
import Reports from './pages/Reports';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/course-management" element={<CourseManagement />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/evaluate/:token" element={<StudentEvaluation />} />
            </Routes>
        </Router>
    );
}

export default App;