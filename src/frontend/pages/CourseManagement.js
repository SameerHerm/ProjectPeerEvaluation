import React, { useState, useEffect, useCallback } from 'react';

import {
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Box,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Collapse
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import api, { getCourseById } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/CourseManagement.module.css';
import '../App.css';

function CourseManagement() {
  // State for add/edit student dialogs
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudentOpen, setEditStudentOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentForm, setStudentForm] = useState({ student_id: '', name: '', email: '', group_assignment: '' });
  const [studentFormError, setStudentFormError] = useState('');

  // State for CSV upload
  const [csvUploadOpen, setCsvUploadOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvUploadError, setCsvUploadError] = useState('');
  const [csvUploadResults, setCsvUploadResults] = useState(null);

  // Handler stubs for add, edit, delete
  const handleAddStudent = async () => {
    setStudentFormError('');
    if (!studentsCourse) return;
    if (!studentForm.student_id || !studentForm.name || !studentForm.email) {
      setStudentFormError('Student ID, name, and email are required.');
      return;
    }
    try {
      await api.post(`/courses/${studentsCourse._id || studentsCourse.id}/students`, studentForm);
      setAlert({ severity: 'success', message: 'Student added successfully' });
      setAddStudentOpen(false);
      setStudentForm({ student_id: '', name: '', email: '', group_assignment: '' });
      // Refresh students list
      const response = await api.get(`/courses/${studentsCourse._id || studentsCourse.id}/students`);
      setStudents(response.data);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
        setStudentFormError(error.response.data.error.message);
      } else {
        setStudentFormError('Failed to add student.');
      }
    }
  };

  const handleEditStudent = (student) => {
    setStudentToEdit(student);
    setStudentForm({ 
      student_id: student.student_id, 
      name: student.name, 
      email: student.email,
      group_assignment: student.group_assignment || ''
    });
    setEditStudentOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!studentsCourse || !studentToEdit) return;
    try {
      await api.put(`/courses/${studentsCourse._id || studentsCourse.id}/students/${studentToEdit._id || studentToEdit.id}`, studentForm);
      setAlert({ severity: 'success', message: 'Student updated successfully' });
      setEditStudentOpen(false);
      setStudentToEdit(null);
      setStudentForm({ student_id: '', name: '', email: '', group_assignment: '' });
      // Refresh students list
      const response = await api.get(`/courses/${studentsCourse._id || studentsCourse.id}/students`);
      setStudents(response.data);
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to update student' });
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!studentsCourse || !student) return;
    try {
      await api.delete(`/courses/${studentsCourse._id || studentsCourse.id}/students/${student._id || student.id}`);
      setAlert({ severity: 'success', message: 'Student deleted successfully' });
      // Refresh students list
      const response = await api.get(`/courses/${studentsCourse._id || studentsCourse.id}/students`);
      setStudents(response.data);
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to delete student' });
    }
  };

  // CSV Upload handlers
  const handleCsvUpload = async () => {
    if (!csvFile || !studentsCourse) return;
    
    setCsvUploading(true);
    setCsvUploadError('');
    setCsvUploadResults(null);
    
    const formData = new FormData();
    formData.append('file', csvFile);
    
    try {
      const response = await api.post(`/courses/${studentsCourse._id || studentsCourse.id}/roster`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCsvUploadResults(response.data);
      setAlert({ severity: 'success', message: response.data.message });
      
      // Refresh students list
      const studentsResponse = await api.get(`/courses/${studentsCourse._id || studentsCourse.id}/students`);
      setStudents(studentsResponse.data);
      
      // Reset form
      setCsvFile(null);
      
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to upload CSV file';
      setCsvUploadError(errorMessage);
      setAlert({ severity: 'error', message: errorMessage });
    } finally {
      setCsvUploading(false);
    }
  };

  const handleCsvFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      setCsvUploadError('');
    } else {
      setCsvUploadError('Please select a valid CSV file');
      setCsvFile(null);
    }
  };
// ...existing code...

  // Add Student Dialog (moved to top-level)
  const addStudentDialog = (
    <Dialog open={addStudentOpen} onClose={() => { setAddStudentOpen(false); setStudentFormError(''); }} maxWidth="xs" fullWidth>
      <DialogTitle>Add Student</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Student ID"
          value={studentForm.student_id}
          onChange={e => setStudentForm({ ...studentForm, student_id: e.target.value })}
          error={!!studentFormError && !studentForm.student_id}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={studentForm.name}
          onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
          error={!!studentFormError && !studentForm.name}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          value={studentForm.email}
          onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
          error={!!studentFormError && !studentForm.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Group Assignment (Optional)"
          value={studentForm.group_assignment}
          onChange={e => setStudentForm({ ...studentForm, group_assignment: e.target.value })}
          helperText="Enter group name or identifier for this student"
        />
        {studentFormError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>{studentFormError}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { setAddStudentOpen(false); setStudentFormError(''); }}>Cancel</Button>
        <Button onClick={handleAddStudent} variant="contained">Add</Button>
      </DialogActions>
    </Dialog>
  );

  // Edit Student Dialog (moved to top-level)
  const editStudentDialog = (
    <Dialog open={editStudentOpen} onClose={() => setEditStudentOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Student</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Student ID"
          value={studentForm.student_id}
          onChange={e => setStudentForm({ ...studentForm, student_id: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Name"
          value={studentForm.name}
          onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          value={studentForm.email}
          onChange={e => setStudentForm({ ...studentForm, email: e.target.value })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Group Assignment (Optional)"
          value={studentForm.group_assignment}
          onChange={e => setStudentForm({ ...studentForm, group_assignment: e.target.value })}
          helperText="Enter group name or identifier for this student"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditStudentOpen(false)}>Cancel</Button>
        <Button onClick={handleUpdateStudent} variant="contained" disabled={!studentForm.student_id || !studentForm.name || !studentForm.email}>Save</Button>
      </DialogActions>
    </Dialog>
  );

  // CSV Upload Dialog
  const csvUploadDialog = (
    <Dialog open={csvUploadOpen} onClose={() => { setCsvUploadOpen(false); setCsvUploadError(''); setCsvUploadResults(null); }} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Student Roster (CSV)</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload a CSV file with the following columns:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <li><strong>student_id</strong> - Student ID (required)</li>
            <li><strong>name</strong> - Student Name (required)</li>
            <li><strong>email</strong> - Student Email (required)</li>
            <li><strong>group_assignment</strong> - Group Assignment (optional)</li>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Note: You can also use 'group' instead of 'group_assignment' for the group column.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file-input"
            type="file"
            onChange={handleCsvFileChange}
          />
          <label htmlFor="csv-file-input">
            <Button variant="outlined" component="span" startIcon={<UploadIcon />}>
              Choose CSV File
            </Button>
          </label>
          {csvFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected: {csvFile.name}
            </Typography>
          )}
        </Box>

        {csvUploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {csvUploadError}
          </Alert>
        )}

        {csvUploadResults && (
          <Alert severity={csvUploadResults.errors && csvUploadResults.errors.length > 0 ? "warning" : "success"} sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {csvUploadResults.message}
            </Typography>
            {csvUploadResults.students && csvUploadResults.students.length > 0 && (
              <Typography variant="body2">
                Students added: {csvUploadResults.students.length}
              </Typography>
            )}
            {csvUploadResults.errors && csvUploadResults.errors.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="error">Errors:</Typography>
                {csvUploadResults.errors.map((error, index) => (
                  <Typography key={index} variant="body2" color="error" sx={{ fontSize: '0.8rem' }}>
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}
          </Alert>
        )}

        {csvUploading && <LinearProgress sx={{ mb: 2 }} />}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => { setCsvUploadOpen(false); setCsvUploadError(''); setCsvUploadResults(null); }}>
          Close
        </Button>
        <Button 
          onClick={handleCsvUpload} 
          variant="contained" 
          disabled={!csvFile || csvUploading}
          startIcon={<UploadIcon />}
        >
          {csvUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );

// ...existing code...
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [studentsCourse, setStudentsCourse] = useState(null);

  const handleViewStudents = async (course) => {
    setStudentsDialogOpen(true);
    setStudentsCourse(course);
    setStudentsLoading(true);
    try {
      const response = await api.get(`/courses/${course._id || course.id}/students`);
      setStudents(response.data);
    } catch (error) {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [editCourse, setEditCourse] = useState({ 
    course_name: '', 
    course_number: '', 
    course_section: '', 
    semester: '',
    course_status: 'Active'
  });

  const handleEditClick = (course) => {
    setCourseToEdit(course);
    setEditCourse({
      course_name: course.course_name,
      course_number: course.course_number,
      course_section: course.course_section,
      semester: course.semester,
      course_status: course.course_status || 'Active'
    });
    setEditDialogOpen(true);
  };

  const handleEditCourse = async () => {
    if (!courseToEdit) return;
    try {
      await api.put(`/courses/${courseToEdit._id || courseToEdit.id}`, editCourse);
      setAlert({ severity: 'success', message: 'Course updated successfully' });
      setEditDialogOpen(false);
      setCourseToEdit(null);
      fetchCoursesWithCounts();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to update course' });
    }
  };
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const handleDeleteCourse = async () => {
    if (!courseToDelete || !(courseToDelete.id || courseToDelete._id)) return;
    const courseId = courseToDelete.id || courseToDelete._id;
    try {
      await api.delete(`/courses/${courseId}`);
      setAlert({ severity: 'success', message: 'Course deleted successfully' });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      fetchCoursesWithCounts();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to delete course' });
    }
  };
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    course_number: '',
    course_section: '',
    semester: '',
    course_status: 'Active'
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState(null);

  // Search filter state
  const [searchFilters, setSearchFilters] = useState({
    course_name: '',
    course_number: '',
    course_section: '',
    semester: '',
    course_status: 'Active'
  });
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  // Fetch all courses, then update each with the latest student_count
  const fetchCoursesWithCounts = useCallback(async (filters = null) => {
    setLoading(true);
    try {
      // Use provided filters or current search filters
      const activeFilters = filters || searchFilters;
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value && value.trim()) {
          queryParams.append(key, value.trim());
        }
      });
      
      const response = await api.get(`/courses?${queryParams.toString()}`);
      let coursesList = response.data;
      
      // Fetch the latest course object for each course in parallel
      const updatedCourses = await Promise.all(
        coursesList.map(async (course) => {
          try {
            const fresh = await getCourseById(course._id || course.id);
            // Use all fields from the fresh course object
            return { ...fresh };
          } catch (e) {
            // fallback to original if error
            return course;
          }
        })
      );
      
      setCourses(updatedCourses);
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to fetch courses' });
    } finally {
      setLoading(false);
    }
  }, [searchFilters]);

  useEffect(() => {
    fetchCoursesWithCounts();
  }, [fetchCoursesWithCounts]); // Re-fetch when fetchCoursesWithCounts changes

  // Search handlers
  const handleSearch = () => {
    fetchCoursesWithCounts(searchFilters);
  };

  const handleClearSearch = () => {
    const clearedFilters = {
      course_name: '',
      course_number: '',
      course_section: '',
      semester: '',
      course_status: 'Active'
    };
    setSearchFilters(clearedFilters);
    fetchCoursesWithCounts(clearedFilters);
  };

  const handleCreateCourse = async () => {
    try {
  // eslint-disable-next-line
  const response = await api.post('/courses', newCourse);
      setAlert({ severity: 'success', message: 'Course created successfully' });
      setCreateDialogOpen(false);
  fetchCoursesWithCounts();
      setNewCourse({ 
        course_name: '', 
        course_number: '', 
        course_section: '', 
        semester: '' 
      });
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to create course' });
    }
  };

  const handleUploadRoster = async () => {
    if (!uploadFile || !selectedCourse || !(selectedCourse.id || selectedCourse._id)) {
      setAlert({ severity: 'error', message: 'No course selected.' });
      return;
    }

    const courseId = selectedCourse.id || selectedCourse._id;
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setUploadProgress(25);
      const response = await api.post(
        `/courses/${courseId}/roster`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        }
      );
      setAlert({ 
        severity: 'success', 
        message: `${response.data.students.length} students added successfully` 
      });
      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadProgress(0);
  fetchCoursesWithCounts();
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to upload roster' });
      setUploadProgress(0);
    }
  };

  const handleSendInvitations = async (courseId) => {
    try {
      const response = await api.post(`/courses/${courseId}/evaluations/send`);
      setAlert({ 
        severity: 'success', 
        message: response.data.message 
      });
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to send invitations' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.courseManagementContainer}>
      {addStudentDialog}
      {editStudentDialog}
      {csvUploadDialog}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" className={styles.logoutButton} color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <div className={styles.headerRow}>
        <Typography variant="h4" component="h1" className={styles.title}>
          Course Management
        </Typography>
        <Button
          variant="contained"
          className={styles.createButton}
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Course
        </Button>
      </div>
      
      {/* Search Filters */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Search Courses
            </Typography>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowSearchFilters(!showSearchFilters)}
            >
              {showSearchFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Box>
          
          <Collapse in={showSearchFilters}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Course Name"
                  value={searchFilters.course_name}
                  onChange={(e) => setSearchFilters({ ...searchFilters, course_name: e.target.value })}
                  placeholder="Software Engineering"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Course Number"
                  value={searchFilters.course_number}
                  onChange={(e) => setSearchFilters({ ...searchFilters, course_number: e.target.value })}
                  placeholder="CS 4850"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Course Section"
                  value={searchFilters.course_section}
                  onChange={(e) => setSearchFilters({ ...searchFilters, course_section: e.target.value })}
                  placeholder="01"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  label="Semester"
                  value={searchFilters.semester}
                  onChange={(e) => setSearchFilters({ ...searchFilters, semester: e.target.value })}
                  placeholder="Fall 2025"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth>
                  <InputLabel>Course Status</InputLabel>
                  <Select
                    value={searchFilters.course_status}
                    label="Course Status"
                    onChange={(e) => setSearchFilters({ ...searchFilters, course_status: e.target.value })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                    <MenuItem value="">All</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Search
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleClearSearch}
              >
                Clear
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {alert && (
        <Alert severity={alert.severity} className={styles.alert} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}
      <div className={styles.tableContainer} style={{ width: '100%' }}>
        <TableContainer component={Paper} style={{ width: '100%' }}>
          <Table style={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell>Course Name</TableCell>
                <TableCell>Course Number</TableCell>
                <TableCell>Course Section</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell align="center">Students</TableCell>
                <TableCell align="center">Teams</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No courses found. Create your first course to get started.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id || course._id}>
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell>{course.course_number}</TableCell>
                    <TableCell>{course.course_section}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell align="center">
                      <Chip label={course.student_count || 0} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={course.team_count || 0} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={course.course_status || 'Active'} 
                        color={course.course_status === 'Active' ? 'success' : 'default'}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {/* ...other action buttons... */}
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => {
                            setSelectedCourse(course);
                            setUploadDialogOpen(true);
                          }}
                          title="Upload Roster"
                        >
                          <UploadIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewStudents(course)}
                          title="Manage Students"
                        >
                          <PersonIcon />
                        </IconButton>
      {/* Manage Students Dialog */}
  <Dialog open={studentsDialogOpen} onClose={() => { setStudentsDialogOpen(false); fetchCoursesWithCounts(); }} maxWidth="md" fullWidth>
        <DialogTitle>Manage Students for {studentsCourse?.course_number} {studentsCourse?.course_section} - {studentsCourse?.course_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
            <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={() => setCsvUploadOpen(true)}>
              Upload CSV
            </Button>
            <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setAddStudentOpen(true)}>
              Add Student
            </Button>
          </Box>
          {studentsLoading ? (
            <LinearProgress />
          ) : students.length === 0 ? (
            <Typography>No students found for this course.</Typography>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Group Assignment</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id || student._id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>
                        {student.group_assignment ? (
                          <Chip label={student.group_assignment} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Not assigned</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => handleEditStudent(student)} title="Edit Student">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteStudent(student)} title="Delete Student">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setStudentsDialogOpen(false); fetchCoursesWithCounts(); }}>Close</Button>
        </DialogActions>
      </Dialog>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/courses/${course.id}/teams`)}
                          title="Manage Teams"
                        >
                          <GroupIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSendInvitations(course.id)}
                          title="Send Evaluations"
                        >
                          <SendIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/courses/${course.id}/reports`)}
                          title="View Reports"
                        >
                          <AssessmentIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setCourseToDelete(course);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete Course"
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditClick(course)}
                          title="Edit Course"
                        >
                          <EditIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <Grid container columns={12} columnSpacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Name"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                placeholder="Software Engineering"
                autoFocus
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Number"
                value={newCourse.course_number}
                onChange={(e) => setNewCourse({ ...newCourse, course_number: e.target.value })}
                placeholder="CS 4850"
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Section"
                value={newCourse.course_section}
                onChange={(e) => setNewCourse({ ...newCourse, course_section: e.target.value })}
                placeholder="01"
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Semester"
                value={newCourse.semester}
                onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                placeholder="Fall 2025"
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCourse} 
            variant="contained"
            disabled={!newCourse.course_name || !newCourse.course_number || !newCourse.course_section || !newCourse.semester}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

  {/* Upload Roster Dialog */}

      {/* Edit Course Dialog */}
  <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogContent>
          <Grid container columns={12} columnSpacing={2} sx={{ mt: 1 }}>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Name"
                value={editCourse.course_name}
                onChange={(e) => setEditCourse({ ...editCourse, course_name: e.target.value })}
                placeholder="Software Engineering"
                autoComplete="off"
                autoFocus
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Number"
                value={editCourse.course_number}
                onChange={(e) => setEditCourse({ ...editCourse, course_number: e.target.value })}
                placeholder="CS 4850"
                autoComplete="off"
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Section"
                value={editCourse.course_section}
                onChange={(e) => setEditCourse({ ...editCourse, course_section: e.target.value })}
                placeholder="01"
                autoComplete="off"
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Semester"
                value={editCourse.semester}
                onChange={(e) => setEditCourse({ ...editCourse, semester: e.target.value })}
                placeholder="Fall 2025"
                autoComplete="off"
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Course Status</InputLabel>
                <Select
                  value={editCourse.course_status}
                  label="Course Status"
                  onChange={(e) => setEditCourse({ ...editCourse, course_status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditCourse} 
            variant="contained"
            disabled={!editCourse.course_name || !editCourse.course_number || !editCourse.course_section || !editCourse.semester}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Course Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Course</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this course?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteCourse} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Student Roster</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Upload a CSV file with columns: student_id, name, email
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<UploadIcon />}
            >
              Select CSV File
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </Button>
            {uploadFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected: {uploadFile.name}
              </Typography>
            )}
            {uploadProgress > 0 && (
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ mt: 2 }} />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUploadDialogOpen(false);
            setUploadFile(null);
            setUploadProgress(0);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleUploadRoster} 
            variant="contained"
            disabled={!uploadFile || uploadProgress > 0}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default CourseManagement;