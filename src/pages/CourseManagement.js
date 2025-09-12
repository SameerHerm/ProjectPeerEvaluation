import React, { useState, useEffect } from 'react';
import {
  Container,
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
import {
  Add as AddIcon,
  // eslint-disable-next-line
  Edit as EditIcon,
  // eslint-disable-next-line
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Send as SendIcon,
  Group as GroupIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function CourseManagement() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
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
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
  setCourses(response.data.courses);
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
      fetchCourses();
      setNewCourse({ course_code: '', course_name: '', semester: '' });
    } catch (error) {
      setAlert({ severity: 'error', message: 'Failed to create course' });
    }
  };

  const handleUploadRoster = async () => {
    if (!uploadFile || !selectedCourse) return;

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      setUploadProgress(25);
      const response = await api.post(
        `/courses/${selectedCourse.id}/roster`,
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
      fetchCourses();
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Course Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Course
            </Button>
          </Paper>
        </Grid>

        {/* Alert */}
        {alert && (
          <Grid item xs={12}>
            <Alert severity={alert.severity} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          </Grid>
        )}

        {/* Courses Table */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
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
                    <TableRow key={course.id}>
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
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      {/* Create Course Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Code"
                value={newCourse.course_code}
                onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                placeholder="CS 4850"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Course Name"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                placeholder="Software Engineering"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
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
    </Container>
  );
}

export default CourseManagement;
