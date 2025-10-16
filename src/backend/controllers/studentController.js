const mongoose = require('mongoose');
const Student = require('../models/Student');
const csv = require('csv-parser');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

// Manual add student to course
exports.addStudent = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { student_id, name, email, group_assignment } = req.body;
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      const err = new Error('Invalid course ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    if (!student_id || !name || !email) {
      const err = new Error('Missing required fields: student_id, name, email.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    // Check for duplicate student_id in this course
    const existing = await Student.findOne({ course_id, student_id });
    if (existing) {
      const err = new Error('Student with this ID already exists in this course.');
      err.code = 'DUPLICATE';
      err.status = 409;
      return next(err);
    }
    // Generate evaluation token
    const evaluation_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    let teamId = null;
    
    // If group_assignment is provided, find or create the team
    if (group_assignment && group_assignment.trim() !== '') {
      const Team = require('../models/Team');
      const courseObjectId = new mongoose.Types.ObjectId(course_id);
      
      // Try to find existing team with this name in this course
      let team = await Team.findOne({ 
        team_name: group_assignment.trim(), 
        course_id: courseObjectId 
      });
      
      // If team doesn't exist, create it
      if (!team) {
        team = new Team({
          team_name: group_assignment.trim(),
          course_id: courseObjectId,
          students: [],
          student_count: 0,
          team_status: 'Active'
        });
        await team.save();
        console.log(`Created new team: ${group_assignment.trim()} for manual student addition`);
        
        // Update course team_count
        const Course = require('../models/Course');
        const teamCount = await Team.countDocuments({ course_id: courseObjectId });
        await Course.findByIdAndUpdate(courseObjectId, { team_count: teamCount });
      }
      
      teamId = team._id;
    }
    
    const student = new Student({ 
      student_id, 
      name, 
      email, 
      course_id, 
      group_assignment: group_assignment || null,
      team_id: teamId,
      evaluation_token 
    });
    await student.save();
    
    // If student was assigned to a team, update the team
    if (teamId) {
      const Team = require('../models/Team');
      
      // Add student to team's students array
      await Team.findByIdAndUpdate(teamId, {
        $addToSet: { students: student._id }
      });
      
      // Update team's student_count
      const teamStudentCount = await Student.countDocuments({ team_id: teamId });
      await Team.findByIdAndUpdate(teamId, { student_count: teamStudentCount });
      
      console.log(`Added student ${student_id} to team ${group_assignment}, new team count: ${teamStudentCount}`);
    }
    
    // Update student_count in the Course document
    const Course = require('../models/Course');
    const courseObjectId = new mongoose.Types.ObjectId(course_id);
    const studentCount = await Student.countDocuments({ course_id: courseObjectId });
    await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
    res.status(201).json({ message: 'Student added.', student });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.listStudents = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      const err = new Error('Invalid course ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const students = await Student.find({ course_id });
    res.status(200).json(students);
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const { course_id, student_id } = req.params;
    const updates = req.body;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      const err = new Error('Invalid student ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    
    // Get current student data before update
    const currentStudent = await Student.findOne({ _id: student_id, course_id });
    if (!currentStudent) {
      const err = new Error('Student not found.');
      err.code = 'NOT_FOUND';
      err.status = 404;
      return next(err);
    }
    
    const oldTeamId = currentStudent.team_id;
    let newTeamId = null;
    
    // Handle team assignment changes
    if (updates.group_assignment !== undefined) {
      if (updates.group_assignment && updates.group_assignment.trim() !== '') {
        const Team = require('../models/Team');
        const courseObjectId = new mongoose.Types.ObjectId(course_id);
        
        // Find or create the new team
        let team = await Team.findOne({ 
          team_name: updates.group_assignment.trim(), 
          course_id: courseObjectId 
        });
        
        if (!team) {
          team = new Team({
            team_name: updates.group_assignment.trim(),
            course_id: courseObjectId,
            students: [],
            student_count: 0,
            team_status: 'Active'
          });
          await team.save();
          console.log(`Created new team: ${updates.group_assignment.trim()} for student update`);
          
          // Update course team_count
          const Course = require('../models/Course');
          const teamCount = await Team.countDocuments({ course_id: courseObjectId });
          await Course.findByIdAndUpdate(courseObjectId, { team_count: teamCount });
        }
        
        newTeamId = team._id;
        updates.team_id = newTeamId;
      } else {
        // Clearing team assignment
        updates.team_id = null;
        updates.group_assignment = null;
      }
    }
    
    // Update the student
    const student = await Student.findOneAndUpdate({ _id: student_id, course_id }, updates, { new: true });
    
    // Handle team membership changes
    const Team = require('../models/Team');
    
    // Remove from old team if changed
    if (oldTeamId && (!newTeamId || oldTeamId.toString() !== newTeamId.toString())) {
      await Team.findByIdAndUpdate(oldTeamId, {
        $pull: { students: student_id }
      });
      
      const oldTeamStudentCount = await Student.countDocuments({ team_id: oldTeamId });
      await Team.findByIdAndUpdate(oldTeamId, { student_count: oldTeamStudentCount });
      console.log(`Removed student from old team ${oldTeamId}, new count: ${oldTeamStudentCount}`);
    }
    
    // Add to new team if assigned
    if (newTeamId && (!oldTeamId || oldTeamId.toString() !== newTeamId.toString())) {
      await Team.findByIdAndUpdate(newTeamId, {
        $addToSet: { students: student._id }
      });
      
      const newTeamStudentCount = await Student.countDocuments({ team_id: newTeamId });
      await Team.findByIdAndUpdate(newTeamId, { student_count: newTeamStudentCount });
      console.log(`Added student to new team ${newTeamId}, new count: ${newTeamStudentCount}`);
    }
    
    res.status(200).json({ message: 'Student updated.' });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const { course_id, student_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      const err = new Error('Invalid student ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }
    const student = await Student.findOneAndDelete({ _id: student_id, course_id });
    if (!student) {
      const err = new Error('Student not found.');
      err.code = 'NOT_FOUND';
      err.status = 404;
      return next(err);
    }

    // If student was part of a team, update that team
    if (student.team_id) {
      const Team = require('../models/Team');
      
      // Remove student from team's students array
      await Team.findByIdAndUpdate(student.team_id, {
        $pull: { students: student._id }
      });
      
      // Update team's student_count
      const teamStudentCount = await Student.countDocuments({ team_id: student.team_id });
      await Team.findByIdAndUpdate(student.team_id, { student_count: teamStudentCount });
      
      console.log(`Updated team ${student.team_id} student count to ${teamStudentCount}`);
    }

    // Update student_count in the Course document
    const Course = require('../models/Course');
    const courseObjectId = new mongoose.Types.ObjectId(course_id);
    const studentCount = await Student.countDocuments({ course_id: courseObjectId });
    console.log('Updating student_count for course:', course_id, 'to', studentCount);
    await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
    console.log('Course update result:', await Course.findById(courseObjectId));
    
    res.status(200).json({ message: 'Student deleted.' });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.bulkDeleteStudents = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { student_ids } = req.body;
    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      const err = new Error('student_ids array required.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }

    // Get students to be deleted to check their teams
    const studentsToDelete = await Student.find({ _id: { $in: student_ids }, course_id });
    const teamsToUpdate = new Set();
    
    // Collect unique team IDs that will be affected
    studentsToDelete.forEach(student => {
      if (student.team_id) {
        teamsToUpdate.add(student.team_id.toString());
      }
    });

    // Delete the students
    const result = await Student.deleteMany({ _id: { $in: student_ids }, course_id });

    // Update affected teams
    if (teamsToUpdate.size > 0) {
      const Team = require('../models/Team');
      
      for (const teamId of teamsToUpdate) {
        // Remove deleted students from team's students array
        await Team.findByIdAndUpdate(teamId, {
          $pull: { students: { $in: student_ids } }
        });
        
        // Update team's student_count
        const teamStudentCount = await Student.countDocuments({ team_id: teamId });
        await Team.findByIdAndUpdate(teamId, { student_count: teamStudentCount });
        
        console.log(`Updated team ${teamId} student count to ${teamStudentCount}`);
      }
    }

    // Update student_count in the Course document
    const Course = require('../models/Course');
    const courseObjectId = new mongoose.Types.ObjectId(course_id);
    const studentCount = await Student.countDocuments({ course_id: courseObjectId });
    console.log('Updating student_count for course:', course_id, 'to', studentCount);
    await Course.findByIdAndUpdate(courseObjectId, { student_count: studentCount });
    console.log('Course update result:', await Course.findById(courseObjectId));
    
    res.status(200).json({ message: 'Students deleted.', deleted_count: result.deletedCount });
  } catch (err) {
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};

exports.uploadRoster = async (req, res, next) => {
  console.log('params:', req.params);
  console.log('file:', req.file);
  // Check for file
  if (!req.file) {
    const err = new Error('No file uploaded.');
    err.code = 'VALIDATION_ERROR';
    err.status = 400;
    return next(err);
  }
  const { course_id } = req.params;
  const errors = [];
  const studentsToCreate = [];
  try {
    // Parse CSV and collect students
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        console.log('Parsed row:', row);
        console.log('team_name value:', row.team_name);
        console.log('group_assignment value:', row.group_assignment);
        console.log('group value:', row.group);
        // Validate required columns (name, student_id, email are required; team_name is optional)
        if (!row.student_id || !row.name || !row.email) {
          errors.push(`Missing required fields in row: ${JSON.stringify(row)}`);
          return;
        }
        // Prepare student object
        const evaluation_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const teamAssignment = row.team_name || row.group_assignment || row.group || null;
        console.log('Final team assignment for student:', row.student_id, '=', teamAssignment);
        studentsToCreate.push({
          student_id: row.student_id,
          name: row.name,
          email: row.email,
          group_assignment: teamAssignment, // Primary: team_name, fallback for backward compatibility
          course_id,
          evaluation_token
        });
      })
      .on('end', async () => {
        console.log('CSV parsing completed. Total students parsed:', studentsToCreate.length);
        try {
          // Deduplicate: filter out students that already exist in this course
          const courseObjectId = new mongoose.Types.ObjectId(course_id);
          const existingStudents = await Student.find({
            course_id: courseObjectId,
            student_id: { $in: studentsToCreate.map(s => s.student_id) }
          }).select('student_id');
          const existingIds = new Set(existingStudents.map(s => s.student_id));
          const filteredToCreate = studentsToCreate.filter(s => !existingIds.has(s.student_id));
          
          console.log('Existing students:', existingIds.size);
          console.log('New students to create:', filteredToCreate.length);
          
          // Check if we should update existing students with team assignments
          const studentsToUpdate = studentsToCreate.filter(s => existingIds.has(s.student_id));
          console.log('Existing students to potentially update with teams:', studentsToUpdate.length);
          
          if (filteredToCreate.length === 0 && studentsToUpdate.length === 0) {
            fs.unlinkSync(req.file.path);
            errors.push('All students in the file already exist in this course.');
            return res.status(200).json({
              message: 'No new students added.',
              students: [],
              errors
            });
          }

          // Combine new students and existing students for team processing
          const allStudentsForTeamProcessing = [...filteredToCreate, ...studentsToUpdate];

          // Step 1: Create Team records for unique team names
          console.log('Starting team creation process...');
          const Team = require('../models/Team');
          const uniqueTeamNames = [...new Set(allStudentsForTeamProcessing
            .map(s => s.group_assignment)
            .filter(teamName => teamName && teamName.trim() !== '')
          )];

          console.log('Unique team names found:', uniqueTeamNames);
          console.log('All students for team processing:', allStudentsForTeamProcessing.map(s => ({ id: s.student_id, team: s.group_assignment })));

          const createdTeams = {};
          for (const teamName of uniqueTeamNames) {
            try {
              console.log(`Processing team: ${teamName}`);
              // Check if team already exists for this course
              let existingTeam = await Team.findOne({ 
                team_name: teamName, 
                course_id: courseObjectId 
              });
              
              if (!existingTeam) {
                // Create new team
                const newTeam = new Team({
                  team_name: teamName,
                  course_id: courseObjectId,
                  students: [],
                  student_count: 0,
                  team_status: 'Active'
                });
                existingTeam = await newTeam.save();
                console.log(`✅ Created new team: ${teamName} with ID: ${existingTeam._id}`);
              } else {
                console.log(`Team already exists: ${teamName} with ID: ${existingTeam._id}`);
              }
              createdTeams[teamName] = existingTeam._id;
            } catch (teamError) {
              console.error(`❌ Error creating team ${teamName}:`, teamError);
              errors.push(`Failed to create team: ${teamName}`);
            }
          }

          // Step 2: Insert new students only
          let created = [];
          if (filteredToCreate.length > 0) {
            console.log('Starting student insertion...');
            created = await Student.insertMany(filteredToCreate, { ordered: false });
            console.log(`✅ Inserted ${created.length} new students`);
          }
          
          // Step 3: Get all students that need team linking (both new and existing)
          console.log('Starting team linking process...');
          const allStudentsForLinking = [];
          
          // Add newly created students
          allStudentsForLinking.push(...created);
          
          // Add existing students that need team updates
          if (studentsToUpdate.length > 0) {
            const existingStudentsFromDB = await Student.find({
              course_id: courseObjectId,
              student_id: { $in: studentsToUpdate.map(s => s.student_id) }
            });
            // Merge with team assignment data
            existingStudentsFromDB.forEach(dbStudent => {
              const csvData = studentsToUpdate.find(s => s.student_id === dbStudent.student_id);
              if (csvData) {
                dbStudent.group_assignment = csvData.group_assignment;
                allStudentsForLinking.push(dbStudent);
              }
            });
          }
          
          // Step 4: Link all students to teams
          for (const student of allStudentsForLinking) {
            try {
              if (student.group_assignment && createdTeams[student.group_assignment]) {
                const teamId = createdTeams[student.group_assignment];
                console.log(`Linking student ${student.student_id} to team ${student.group_assignment} (ID: ${teamId})`);
                
                // Update student with team_id and group_assignment
                await Student.findByIdAndUpdate(student._id, { 
                  team_id: teamId,
                  group_assignment: student.group_assignment 
                });
                
                // Add student to team's students array
                await Team.findByIdAndUpdate(teamId, {
                  $addToSet: { students: student._id }
                });
                console.log(`✅ Linked student ${student.student_id} to team ${student.group_assignment}`);
              } else {
                console.log(`Student ${student.student_id} has no team assignment or team not found`);
              }
            } catch (linkError) {
              console.error(`❌ Error linking student ${student.student_id}:`, linkError);
              errors.push(`Failed to link student ${student.student_id} to team`);
            }
          }

          // Step 4: Update student_count for all affected teams
          console.log('Updating team student counts...');
          for (const teamId of Object.values(createdTeams)) {
            const teamStudentCount = await Student.countDocuments({ team_id: teamId });
            await Team.findByIdAndUpdate(teamId, { student_count: teamStudentCount });
            console.log(`Updated team ${teamId} student count to ${teamStudentCount}`);
          }

          // Step 5: Update course student_count and team_count
          console.log('Updating course student count...');
          const Course = require('../models/Course');
          const studentCount = await Student.countDocuments({ course_id: courseObjectId });
          const teamCount = await Team.countDocuments({ course_id: courseObjectId });
          await Course.findByIdAndUpdate(courseObjectId, { 
            student_count: studentCount,
            team_count: teamCount 
          });
          console.log(`Updated course student count to ${studentCount}`);
          console.log(`Updated course team count to ${teamCount}`);

          fs.unlinkSync(req.file.path); // Clean up temp file
          
          // Add error for duplicates if any were filtered
          if (filteredToCreate.length < studentsToCreate.length) {
            errors.push('Some students were not added because they already exist in this course.');
          }

          const teamsCreatedCount = Object.keys(createdTeams).length;
          console.log(`✅ CSV upload completed successfully!`);
          console.log(`New students created: ${created.length}`);
          console.log(`Existing students updated: ${studentsToUpdate.length}`);
          console.log(`Teams created/updated: ${teamsCreatedCount}`);
          console.log(`Team names: ${Object.keys(createdTeams).join(', ')}`);
          
          res.status(200).json({
            message: `Roster processed successfully. ${created.length} new students added, ${studentsToUpdate.length} existing students updated.`,
            students: created.map(s => s.student_id),
            students_updated: studentsToUpdate.map(s => s.student_id),
            teams_created: teamsCreatedCount,
            team_names: Object.keys(createdTeams),
            errors
          });
        } catch (insertErr) {
          console.error('InsertMany error:', insertErr);
          fs.unlinkSync(req.file.path);
          errors.push('Some students could not be added (possible duplicates or DB error).');
          res.status(200).json({
            message: 'Roster uploaded with some errors.',
            students: [],
            teams_created: 0,
            errors
          });
        }
      });
  } catch (err) {
    err.code = 'SERVER_ERROR';
    err.status = 500;
    next(err);
  }
};

// Delete ALL students from a course
exports.deleteAllStudents = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(course_id)) {
      const err = new Error('Invalid course ID.');
      err.code = 'VALIDATION_ERROR';
      err.status = 400;
      return next(err);
    }

    const courseObjectId = new mongoose.Types.ObjectId(course_id);

    // Get count of students before deletion
    const studentCount = await Student.countDocuments({ course_id: courseObjectId });
    
    if (studentCount === 0) {
      return res.status(200).json({ 
        message: 'No students to delete.',
        deleted_count: 0 
      });
    }

    // Delete all students in the course
    const deleteResult = await Student.deleteMany({ course_id: courseObjectId });

    // Delete all teams in the course (since they'll be empty)
    const Team = require('../models/Team');
    const teamsDeleteResult = await Team.deleteMany({ course_id: courseObjectId });

    // Update course student_count and team_count to 0
    const Course = require('../models/Course');
    await Course.findByIdAndUpdate(courseObjectId, { 
      student_count: 0,
      team_count: 0 
    });

    console.log(`Deleted ${deleteResult.deletedCount} students and ${teamsDeleteResult.deletedCount} teams from course ${course_id}`);

    res.status(200).json({ 
      message: `Successfully deleted all students from course.`,
      deleted_students: deleteResult.deletedCount,
      deleted_teams: teamsDeleteResult.deletedCount
    });

  } catch (err) {
    console.error('Error deleting all students:', err);
    err.code = err.code || 'SERVER_ERROR';
    err.status = err.status || 500;
    next(err);
  }
};