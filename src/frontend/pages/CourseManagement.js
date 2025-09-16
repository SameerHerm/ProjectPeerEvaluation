import React, { useState, useEffect } from 'react';

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
  LinearProgress
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import SendIcon from '@mui/icons-material/Send';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
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
  const [studentForm, setStudentForm] = useState({ student_id: '', name: '', email: '' });
  const [studentFormError, setStudentFormError] = useState('');

  // Handler stubs for add, edit, delete
  const handleAddStudent = async () => {
    setStudentFormError('');
    if (!studentsCourse) return;
    if (!studentForm.student_id || !studentForm.name || !studentForm.email) {
      setStudentFormError('All fields are required.');
      return;
    }
    try {
      await api.post(`/courses/${studentsCourse._id || studentsCourse.id}/students`, studentForm);
      setAlert({ severity: 'success', message: 'Student added successfully' });
      setAddStudentOpen(false);
      setStudentForm({ student_id: '', name: '', email: '' });
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
    setStudentForm({ student_id: student.student_id, name: student.name, email: student.email });
    setEditStudentOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!studentsCourse || !studentToEdit) return;
    try {
      await api.put(`/courses/${studentsCourse._id || studentsCourse.id}/students/${studentToEdit._id || studentToEdit.id}`, studentForm);
      setAlert({ severity: 'success', message: 'Student updated successfully' });
      setEditStudentOpen(false);
      setStudentToEdit(null);
      setStudentForm({ student_id: '', name: '', email: '' });
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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditStudentOpen(false)}>Cancel</Button>
        <Button onClick={handleUpdateStudent} variant="contained" disabled={!studentForm.student_id || !studentForm.name || !studentForm.email}>Save</Button>
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
  const [editCourse, setEditCourse] = useState({ course_code: '', course_name: '', semester: '' });

  const handleEditClick = (course) => {
    setCourseToEdit(course);
    setEditCourse({
      course_code: course.course_code,
      course_name: course.course_name,
      semester: course.semester
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
    course_code: '',
    course_name: '',
    semester: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [alert, setAlert] = useState(null);


  useEffect(() => {
    fetchCoursesWithCounts();
  }, []);


  // Fetch all courses, then update each with the latest student_count
  const fetchCoursesWithCounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/courses');
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
  // Only show active courses
  setCourses(updatedCourses.filter(c => c.is_active !== false));
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to fetch courses' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
  // eslint-disable-next-line
  const response = await api.post('/courses', newCourse);
      setAlert({ severity: 'success', message: 'Course created successfully' });
      setCreateDialogOpen(false);
  fetchCoursesWithCounts();
      setNewCourse({ course_code: '', course_name: '', semester: '' });
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
                <TableCell>Course Code</TableCell>
                <TableCell>Course Name</TableCell>
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
                  <TableCell colSpan={7} align="center">
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No courses found. Create your first course to get started.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id || course._id}>
                    <TableCell>{course.course_code}</TableCell>
                    <TableCell>{course.course_name}</TableCell>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell align="center">
                      <Chip label={course.student_count} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={course.team_count} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label="Active" 
                        color="success" 
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
        <DialogTitle>Manage Students for {studentsCourse?.course_code} - {studentsCourse?.course_name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id || student._id}>
                      <TableCell>{student.student_id}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
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
                label="Course Code"
                value={newCourse.course_code}
                onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                placeholder="CS 4850"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Name"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                placeholder="Software Engineering"
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateCourse} 
            variant="contained"
            disabled={!newCourse.course_code || !newCourse.course_name || !newCourse.semester}
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
                label="Course Code"
                value={editCourse.course_code}
                onChange={(e) => setEditCourse({ ...editCourse, course_code: e.target.value })}
                placeholder="CS 4850"
                autoComplete="off"
                autoFocus
                margin="normal"
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Course Name"
                value={editCourse.course_name}
                onChange={(e) => setEditCourse({ ...editCourse, course_name: e.target.value })}
                placeholder="Software Engineering"
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditCourse} 
            variant="contained"
            disabled={!editCourse.course_code || !editCourse.course_name || !editCourse.semester}
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