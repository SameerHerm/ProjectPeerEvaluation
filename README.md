# Peer Evaluation Automation and Feedback System

Date: 09/04/2025  
Status: Planning / In Progress

A web-based platform to streamline peer evaluations in team-based courses. Professors can securely create and manage student rosters, assign students to courses/teams, trigger email invitations, and receive structured, professor-friendly reports with both numeric and textual feedback. Optional AI features may summarize comments and flag potential concerns, depending on timeline and scope.

Project website URL: TBD — see the team guide for instructions.

---

## Objectives

- Simplify and automate peer evaluations for team-based courses
- Provide an intuitive UI for professors and students
- Ensure secure roster management and personalized evaluation links
- Generate clear, actionable reports (numeric + textual)
- Optionally use AI to summarize feedback and detect red flags (time-permitting)

---

## Core Features

- Secure professor login and multi-course management
- Student roster upload and team assignment
- Personalized email invitations for peer evaluations
- Personalized evaluation forms per student/team
- Aggregated, structured reporting for professors
- Downloadable reports (raw data, calculated scores, summaries)
- Optional AI assistance:
  - Text summarization of comments
  - Red flag detection (e.g., significant discrepancies or concerning language)

AI features are optional and will depend on remaining timeline after core milestones are met.

---

## Project Timeline and Milestones

📅 Milestone 1 — By 09/28/2025  
- Finalize system requirements and user stories  
- Finalize tech stack  
- Build basic UI mockups and initial backend structure  
- Schedule and present initial prototype

📅 Milestone 2 — By 10/26/2025  
- Implement secure login and student roster upload  
- Begin email automation and evaluation form generation  
- Enable data collection and report generation  
- Begin testing with sample data  
- Schedule milestone meeting and present working demo

📅 Milestone 3 — By 11/30/2025  
- Finalize UI and polish user experience  
- Complete email automation and form generation  
- Complete documentation  
- Implement optional AI features (summarization, red flag detection)  
- Present final system and submit all deliverables


## Final Deliverables

- Updated research report including finalized tech stack and meeting notes
- Fully functional, multi-user system for:
  - Secure roster management
  - Triggering peer evaluations
  - Receiving structured feedback reports
- Integrated email system sending personalized forms based on team membership
- Downloadable reports:
  - Raw numeric and textual feedback
  - Calculated scores based on preset formulas
  - Optional AI-generated summaries and red-flag alerts
- Complete, documented source code hosted on GitHub
- Documentation:
  - System architecture and design documents
  - User manual for professors
  - IT Capstone Project Plan

---

## Collaboration & Communication

- Channels: Microsoft Teams chat and KSU email  
- Expected response time: within 24 hours  
- Team meetings: Every Monday (weekly) to discuss blockers and priorities  
- Meeting notes: Posted to the team site by the Team Leader  
- Weekly reports: Submitted every Friday to the Team Leader; compiled and shared back for approval, then submitted to D2L  
- File sharing: GitHub and email

---

## Team

| Role                | Name            | Responsibilities                                                       
|---------------------|-----------------|------------------------------------------------------------------------
| Project Owner       | Geetika Vyas    | Project owner and stakeholder                                         
| Team Leader         | Preston Jordan  | Documentation, repository creation, project coordination               
| Team Member         | Linh La         | Back-end development                                                   
| Team Member         | Sameer Khan     | Front-end development, Google Site creation, repository creation       
| Team Member         | Nnedi Okafor    | Front-end development                                                   
| Team Member         | Deangela Saad   | Back-end development                                                  
| Advisor/Instructor  | Jack Zheng      | Facilitate progress; advise on planning and project management         

Primary contact for inquiries: Team Leader (Preston Jordan)

---

## Repository Structure (proposed)

- docs/
  - requirements/
  - architecture/
  - user-manual/
  - research-report/
- designs/
  - ui-mockups/
  - wireframes/
- meeting-notes/
- reports/
  - samples/
- gantt/
  - project-schedule.gantt
- src/ (added as development begins)
  - backend/
  - frontend/
- scripts/
- .github/
  - issue_templates/
  - pull_request_template.md
- LICENSE
- CONTRIBUTING.md

Note: Actual structure may evolve with the project.

---

## Tech Stack

To be finalized by Milestone 1 (09/28/2025).  
Documentation will specify:
- Front-end framework (TBD)
- Back-end framework (TBD)
- Database (TBD)
- Email service provider / SMTP (TBD)
- Authentication (TBD)
- Optional AI/NLP services or libraries (TBD)
- Deployment target (TBD)

---

## High-Level Workflow

1. Professor creates course and uploads roster (with emails) and team assignments.  
2. System generates personalized evaluation links.  
3. Email service sends invitations/reminders to students.  
4. Students evaluate teammates via web forms.  
5. System aggregates responses and computes scores.  
6. Professor downloads or views reports (numeric + textual).  
7. Optional: AI summaries and flagged red flags for review.

---

## Security & Privacy

- Store student data securely; restrict access to authorized users only.  
- Use HTTPS for all traffic; protect credentials and tokens.  
- Avoid sending sensitive data in plain text emails.  
- Comply with institutional policies and applicable regulations (e.g., FERPA).  
- Document data retention and deletion policies.

---

## Risks, Assumptions, and Planning

- No major delays currently foreseen.  
- Capacity planned with two front-end and two back-end developers to cover downtime.  
- Client (professor) availability expected to be consistent.  
- AI features are optional and contingent on time after core functionality is complete.  
- Email deliverability and spam filtering may require configuration and testing.

---

## Contributing

- Use feature branches and open pull requests for review.  
- Link issues to PRs and keep commit messages descriptive.  
- Follow coding standards defined in CONTRIBUTING.md (to be added).  
- Document changes in PR descriptions and update relevant docs.

---


## Acknowledgments

- Advisor/Instructor: Dr. Jack Zheng (guidance on planning and management)

---

Questions or suggestions? Open an issue in this repository or contact the Team Leader.
