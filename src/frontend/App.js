import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import CourseManagement from './pages/CourseManagement';
import LoginPage from './pages/LoginPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/course-management" element={<CourseManagement />} />
            </Routes>
        </Router>
    );
}

export default App;