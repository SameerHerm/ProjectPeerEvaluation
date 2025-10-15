require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

// Your professor ID from the logs
const YOUR_PROFESSOR_ID = '68c3af200bedadf10e07ba86';

// Sample data for generating random courses
const courseNames = [
  'Software Engineering',
  'Data Structures and Algorithms', 
  'Database Management Systems',
  'Web Development',
  'Machine Learning',
  'Computer Networks',
  'Operating Systems',
  'Artificial Intelligence',
  'Cybersecurity',
  'Mobile App Development'
];

const courseCodes = ['CS', 'CIS', 'IT', 'SE', 'EE', 'CE'];
const sections = ['01', '02', '03', 'A', 'B', 'C'];
const semesters = ['Fall 2024', 'Spring 2025', 'Summer 2025', 'Fall 2025'];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomCourse(professorId) {
  const courseName = getRandomElement(courseNames);
  const courseCode = getRandomElement(courseCodes);
  const courseNumber = Math.floor(Math.random() * 9000) + 1000;
  const section = getRandomElement(sections);
  const semester = getRandomElement(semesters);
  
  return {
    course_name: courseName,
    course_number: `${courseCode} ${courseNumber}`,
    course_section: section,
    semester: semester,
    professor_id: new mongoose.Types.ObjectId(professorId),
    course_status: 'Active',
    student_count: Math.floor(Math.random() * 40) + 15,
    team_count: Math.floor(Math.random() * 10) + 4,
    evaluation_status: {
      total: 0,
      completed: 0,
      pending: 0
    }
  };
}

async function addRandomCoursesForYou() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log(`📋 Adding courses for professor ID: ${YOUR_PROFESSOR_ID}`);

    console.log('📚 Generating 10 random courses...');
    const courses = [];
    
    for (let i = 0; i < 10; i++) {
      courses.push(generateRandomCourse(YOUR_PROFESSOR_ID));
    }

    console.log('💾 Inserting courses into database...');
    const insertedCourses = await Course.insertMany(courses);
    
    console.log(`✅ Successfully added ${insertedCourses.length} courses:`);
    insertedCourses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.course_name} (${course.course_number} - ${course.course_section}) - ${course.semester}`);
    });

  } catch (error) {
    console.error('❌ Error adding courses:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('👋 Script completed');
  }
}

addRandomCoursesForYou();