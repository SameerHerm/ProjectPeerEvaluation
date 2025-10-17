import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import { CheckCircle as CheckIcon, Person as PersonIcon } from '@mui/icons-material';
import api from '../services/api';

function StudentEvaluation() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load evaluation form data
  useEffect(() => {
    const loadEvaluationForm = async () => {
      try {
        const response = await api.get(`/evaluate/${token}`);
        
        if (response.data.completed) {
          setSuccess(true);
          setEvaluationData({ 
            course: { name: 'Course' }, 
            evaluator: { name: 'Student' },
            submitted_at: response.data.submitted_at 
          });
        } else {
          setEvaluationData(response.data);
          
          // Initialize evaluation state for each teammate
          const initialEvaluations = {};
          response.data.teammates.forEach(teammate => {
            initialEvaluations[teammate._id] = {
              student_id: teammate._id,
              ratings: {
                professionalism: '',
                communication: '',
                work_ethic: '',
                content_knowledge_skills: '',
                overall_contribution: '',
                participation: ''
              },
              overall_feedback: ''
            };
          });
          setEvaluations(initialEvaluations);
        }
      } catch (error) {
        console.error('Error loading evaluation form:', error);
        setError(error.response?.data?.error?.message || 'Failed to load evaluation form');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadEvaluationForm();
    } else {
      setError('No evaluation token provided');
      setLoading(false);
    }
  }, [token]);

  // Handle rating change
  const handleRatingChange = (teammateId, criterion, value) => {
    setEvaluations(prev => ({
      ...prev,
      [teammateId]: {
        ...prev[teammateId],
        ratings: {
          ...prev[teammateId].ratings,
          [criterion]: parseInt(value)
        }
      }
    }));
  };

  // Handle feedback change
  const handleFeedbackChange = (teammateId, feedback) => {
    setEvaluations(prev => ({
      ...prev,
      [teammateId]: {
        ...prev[teammateId],
        overall_feedback: feedback
      }
    }));
  };

  // Submit evaluation
  const handleSubmit = async () => {
    // Validate all evaluations
    const evaluationArray = Object.values(evaluations);
    
    for (const evaluation of evaluationArray) {
      // Check all ratings are filled
      for (const [criterion, value] of Object.entries(evaluation.ratings)) {
        if (value === '' || value === null || value === undefined) {
          setError(`Please provide a rating for ${criterion.replace('_', ' ')} for all team members.`);
          return;
        }
      }
      
      // Check feedback is provided
      if (!evaluation.overall_feedback || evaluation.overall_feedback.trim().length < 10) {
        setError('Please provide overall feedback (at least 10 characters) for all team members.');
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      await api.post(`/evaluate/${token}`, {
        evaluations: evaluationArray
      });
      
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setError(error.response?.data?.error?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Success state
  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Evaluation Completed!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Thank you for completing your peer evaluation. Your responses have been submitted successfully.
          </Typography>
          {evaluationData?.submitted_at && (
            <Typography variant="body2" color="text.secondary">
              Submitted: {new Date(evaluationData.submitted_at).toLocaleString()}
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // Error state
  if (error && !evaluationData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {evaluationData?.rubric?.title || 'Peer Evaluation'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {evaluationData?.rubric?.description}
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Information
                </Typography>
                <Typography variant="body2">
                  <strong>Course:</strong> {evaluationData?.course?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Section:</strong> {evaluationData?.course?.number} - {evaluationData?.course?.section}
                </Typography>
                <Typography variant="body2">
                  <strong>Semester:</strong> {evaluationData?.course?.semester}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Information
                </Typography>
                <Typography variant="body2">
                  <strong>Name:</strong> {evaluationData?.evaluator?.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Student ID:</strong> {evaluationData?.evaluator?.student_id}
                </Typography>
                <Typography variant="body2">
                  <strong>Team:</strong> {evaluationData?.evaluator?.team}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Evaluation Forms */}
      {evaluationData?.teammates?.map((teammate, index) => (
        <Paper key={teammate._id} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ mr: 1 }} />
            <Typography variant="h5">
              Evaluate: {teammate.name}
            </Typography>
            <Chip label={teammate.student_id} sx={{ ml: 2 }} />
          </Box>

          {/* Rating Criteria */}
          {evaluationData?.rubric?.criteria?.map((criterion) => (
            <Box key={criterion.id} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {criterion.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {criterion.description}
              </Typography>
              
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={evaluations[teammate._id]?.ratings[criterion.id] || ''}
                  onChange={(e) => handleRatingChange(teammate._id, criterion.id, e.target.value)}
                >
                  {Object.entries(criterion.scaleDescriptions)
                    .sort(([a], [b]) => parseInt(b) - parseInt(a)) // Sort descending
                    .map(([value, description]) => (
                      <FormControlLabel
                        key={value}
                        value={value}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {value}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {description}
                            </Typography>
                          </Box>
                        }
                        sx={{ mr: 3, alignItems: 'flex-start' }}
                      />
                    ))}
                </RadioGroup>
              </FormControl>
            </Box>
          ))}

          {/* Overall Feedback */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {evaluationData?.rubric?.overallFeedback?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {evaluationData?.rubric?.overallFeedback?.description}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={evaluations[teammate._id]?.overall_feedback || ''}
              onChange={(e) => handleFeedbackChange(teammate._id, e.target.value)}
              placeholder="Provide constructive feedback for this team member..."
              helperText={`${evaluations[teammate._id]?.overall_feedback?.length || 0} characters (minimum 10 required)`}
            />
          </Box>

          {index < evaluationData.teammates.length - 1 && <Divider sx={{ mt: 3 }} />}
        </Paper>
      ))}

      {/* Submit Button */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ minWidth: 200 }}
        >
          {submitting ? <CircularProgress size={24} /> : 'Submit Evaluation'}
        </Button>
      </Box>
    </Container>
  );
}

export default StudentEvaluation;