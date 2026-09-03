# TACT AI — Master Product and Development Guide

**Product Name:** TACT AI
**Meaning:** Team Assembly, Coordination, and Tracking
**Use Case Title:** TACT AI: Building the Right Team for Every Project
**Document Version:** 1.1
**Last Updated:** September 2, 2026
**Status:** Development Source of Truth

This document defines the product scope, business rules, architecture, technology stack, release phases, and development standards for TACT AI.

When implementation details conflict with this document, the coding agent must follow this document unless an approved Architecture Decision Record changes the requirement.

---

# 1. Product Overview

TACT AI is an AI-powered management platform for organizations that already have a potential project and need to build an internal project team.

Managers can use TACT AI to:

* Create a project.
* Define the roles and skills required.
* Find suitable employees from an internal database.
* Review employee skills, availability, and current workload.
* Build and approve a project team.
* Assign and track project tickets.
* Monitor project progress and team capacity.
* Give project-related feedback.
* Review project contribution information.
* Ask questions through a central AI chatbot.

TACT AI must work as a standalone application.

Connections to Workday, Jira, Excel, GitHub, Azure DevOps, Microsoft Teams, SharePoint, and other platforms are optional integrations.

---

# 2. Main Product Value

TACT AI gives managers one place to understand and manage:

```text
Projects
+ Required Roles
+ Employee Skills
+ Availability
+ Workload
+ Team Assignments
+ Tickets
+ Feedback
+ Project Progress
+ AI Recommendations
```

The main interface is a central AI assistant that can answer questions using all data the current user is authorized to access.

Example questions:

* Who is available for this project?
* Who has the required Python and Azure skills?
* Which project roles are still unfilled?
* Who is currently overallocated?
* Which tickets are delayed?
* What is blocking the project?
* How is the team progressing?
* Show the feedback provided for this project.
* Create a weekly project status report.
* Recommend someone who can help with a blocked ticket.

---

# 3. Current Challenge

Managers often need to use several tools to understand employee skills, availability, project assignments, ticket progress, and feedback.

This information may be spread across:

* Human-resource systems
* Excel trackers
* Jira or Azure DevOps
* Emails and chat messages
* Project documents
* Manager notes
* Development repositories

Because the information is separated, managers spend time gathering updates instead of making project decisions.

---

# 4. Who Is Impacted

## Primary Users

* Project managers
* Engineering managers
* Delivery managers
* Resource managers
* Team leaders

## Secondary Users

* Developers
* Testers
* Designers
* Business analysts
* Technical leads
* Project stakeholders

## Administrative Users

* Organization administrators
* Integration administrators
* Authorized HR or People representatives
* Auditors

---

# 5. Why It Is Important

Poor staffing visibility can lead to:

* Projects starting without the required skills.
* Employees being assigned to too many projects.
* Available employees being overlooked.
* Delayed or blocked tickets.
* Slow project reporting.
* Inconsistent manager feedback.
* Poor visibility across projects.

TACT AI helps managers make faster and more informed project staffing and delivery decisions.

---

# 6. Product Objectives

TACT AI must:

1. Reduce the time required to build a project team.
2. Help managers identify employees with suitable skills and availability.
3. Prevent avoidable workload and allocation conflicts.
4. Centralize project, people, ticket, and feedback information.
5. Provide clear and explainable AI recommendations.
6. Allow managers to ask questions through one AI assistant.
7. Support optional integrations without depending on them.
8. Keep managers responsible for final decisions.
9. Protect private employee and project information.
10. Maintain an audit trail for important actions.

---

# 7. Product Boundaries

## TACT AI Is

* An internal project staffing platform.
* A project team management platform.
* A native ticket and progress tracker.
* A project feedback platform.
* A capacity and workload monitoring platform.
* An AI-assisted management workspace.
* A central interface over optional company integrations.

## TACT AI Is Not Initially

* A public recruitment platform.
* An applicant-screening system.
* A replacement for Workday.
* A payroll or compensation system.
* A formal employee-rating system.
* A complete replacement for Jira or Azure DevOps.
* An autonomous hiring or promotion system.
* An autonomous production deployment system.
* A system that makes final employment decisions.

---

# 8. Product Principles

## 8.1 Management First

The primary purpose of TACT AI is to help managers build and manage project teams.

## 8.2 Chat-First, Not Chat-Only

The AI assistant is the main entry point, but users must also have normal pages, forms, dashboards, tables, and filters.

## 8.3 Standalone First

The application must provide its own:

* Project management
* Employee directory
* Skills records
* Availability records
* Team assignments
* Ticket tracking
* Feedback
* Reporting

External systems remain optional.

## 8.4 Human-Controlled AI

The AI can analyze, recommend, summarize, and prepare actions.

A human must approve high-impact actions such as:

* Confirming a project assignment
* Removing someone from a project
* Updating private feedback
* Changing an employee allocation
* Sending an external notification
* Updating an external ticket

## 8.5 Explainable Recommendations

Every employee recommendation must show:

* Why the person was recommended.
* Which requirements matched.
* Which requirements did not match.
* The employee’s available capacity.
* Any workload or scheduling conflicts.
* The freshness of the data used.

## 8.6 Privacy by Design

The platform must only expose employee, feedback, and project information to authorized users.

## 8.7 No Hidden Employee Ranking

TACT AI must not create a permanent or unexplained employee performance score.

---

# 9. Main User Journey

```text
Create Project
      ↓
Define Required Roles and Skills
      ↓
Find Available Employees
      ↓
Generate Team Recommendations
      ↓
Review and Approve the Team
      ↓
Create and Assign Tickets
      ↓
Track Workload and Progress
      ↓
Provide Project Feedback
      ↓
Ask TACT AI for Insights
      ↓
Close the Project and Release Allocations
```

---

# 10. User Roles and Permissions

## 10.1 Organization Administrator

Can manage:

* Organization settings
* Users and system roles
* Integrations
* General audit logs
* Data-retention settings

An organization administrator does not automatically receive permission to read all private feedback.

## 10.2 Resource Manager

Can manage:

* Employee directory
* Skills
* Availability
* Capacity
* Project staffing
* Assignment conflicts

## 10.3 Project Manager

Can manage authorized projects, including:

* Project details
* Role requirements
* Team recommendations
* Project members
* Project tickets
* Project reports
* Project feedback

## 10.4 Team Lead or Reviewer

Can access:

* Assigned projects
* Team tickets
* Reviews
* Blockers
* Limited project contribution information

## 10.5 Team Member

Can access:

* Own profile
* Own availability
* Assigned projects
* Assigned tickets
* Shared project information
* Feedback shared directly with them

## 10.6 Executive Viewer

Can access:

* Aggregated project reports
* Project health
* Capacity summaries
* Staffing summaries

Executive viewers should not receive unrestricted access to private employee feedback.

## 10.7 HR or People Partner

Can access employee or feedback information only when specifically authorized.

## 10.8 Auditor

Can access read-only audit and compliance records.

---

# 11. Permission Rules

The following permissions must be implemented separately:

```text
organization.manage
users.manage
roles.manage
integrations.manage
audit.view

projects.create
projects.view
projects.edit
projects.archive
projects.close

people.view
people.edit
people.skills.manage
people.availability.view
people.availability.manage
people.workload.view

team.recommend
team.assign
team.remove
team.override_capacity

tickets.view
tickets.create
tickets.edit
tickets.assign
tickets.transition

feedback.create
feedback.view_shared
feedback.view_private
feedback.edit
feedback.acknowledge

reports.view
reports.generate

assistant.use
assistant.propose_actions
assistant.approve_actions
```

The AI assistant must inherit the current user’s permissions.

The AI must never have broader access than the user who started the conversation.

---

# 12. Source-of-Truth Rules

TACT AI must know which platform owns each type of data.

| Data                     | Default Owner | Possible Integration        | Rule                                                    |
| ------------------------ | ------------- | --------------------------- | ------------------------------------------------------- |
| Employee identity        | TACT AI       | Workday                     | Workday-managed fields become read-only when configured |
| Job title and department | TACT AI       | Workday                     | External values may take priority                       |
| Employee skills          | TACT AI       | Workday or Excel            | Ownership must be configurable                          |
| Availability             | TACT AI       | Workday, calendar, or Excel | External data becomes an input to capacity calculations |
| Project assignments      | TACT AI       | None initially              | TACT AI owns project allocations                        |
| Project information      | TACT AI       | None initially              | TACT AI is authoritative                                |
| Tickets                  | TACT AI       | Jira or Azure DevOps        | Each project selects one ticket owner                   |
| Project feedback         | TACT AI       | None initially              | Feedback remains inside TACT AI                         |
| Project documents        | TACT AI       | SharePoint later            | Original source permissions must be preserved           |
| Code activity            | External      | GitHub or Azure DevOps      | Read-only initially                                     |
| AI conversation history  | TACT AI       | Microsoft Foundry runtime   | TACT AI stores the auditable transcript                 |

---

# 13. Ticket Provider Modes

Every project must use one ticket mode:

```text
NATIVE
JIRA
AZURE_DEVOPS
```

## Native Mode

TACT AI owns:

* Ticket content
* Status
* Assignment
* Comments
* History

## Jira Mode

Jira owns the ticket record.

TACT AI reads and updates the Jira record through the configured integration.

## Azure DevOps Mode

Azure DevOps owns the work item.

TACT AI reads and updates the work item through the configured integration.

A project must not treat two ticket systems as equally authoritative.

---

# 14. Core Functional Requirements

## FR-001: Authentication

The system must:

* Support Microsoft Entra ID for production authentication.
* Support local development authentication using seeded users.
* Validate access tokens in the backend.
* Map authenticated users to an organization and system role.
* Prevent users from accessing unauthorized organization or project data.

The MVP may use a simplified role selector for demonstration purposes.

---

## FR-002: Project Management

Managers must be able to:

* Create a project.
* Edit project details.
* Archive a project.
* Close a project.
* Define project dates.
* Define business objectives.
* Define project priority.
* Assign a project manager.
* Define the expected team size.
* View project progress and health.

### Required Project Fields

```text
Project ID
Organization ID
Project Name
Description
Business Objective
Priority
Status
Project Manager
Start Date
Target End Date
Ticket Provider
Created By
Created At
Updated At
Version
```

### Project Lifecycle

```text
Draft
→ Staffing
→ Ready for Approval
→ Active
→ On Hold
→ Closing
→ Completed
→ Archived
```

### Project Rules

* A project cannot become active without a manager.
* A project cannot become active without start and target dates.
* A project cannot become active without at least one role requirement.
* A project cannot become active without at least one confirmed team member.
* Completed projects become read-only except for authorized corrections.
* Closing a project releases future team allocations.
* Archiving a project does not delete project history.

---

## FR-003: Project Role Requirements

Managers must be able to define:

* Role name
* Required headcount
* Required skills
* Preferred skills
* Skill proficiency
* Allocation percentage
* Assignment start date
* Assignment end date
* Time-zone preference
* Schedule preference
* Role priority
* Role description

Example:

| Role               | Headcount | Required Skills         | Allocation |
| ------------------ | --------: | ----------------------- | ---------: |
| Frontend Developer |         2 | React, TypeScript       |       100% |
| Backend Developer  |         2 | Python, FastAPI         |       100% |
| Tester             |         1 | API Testing, Playwright |        50% |
| Designer           |         1 | Figma, User Research    |        50% |

---

## FR-004: Employee Directory

TACT AI must maintain an internal employee database.

### Employee Information

```text
Employee ID
Employee Code
Display Name
Email
Job Title
Department
Primary Role
Time Zone
Working Schedule
Employment Status
Profile Source
Profile Last Updated
```

### Employee Skills

Each skill record must contain:

```text
Skill
Category
Proficiency Level
Years of Experience
Last Used Date
Verification Status
Source
```

### Employee Statuses

```text
Active
Inactive
On Leave
Unavailable
Archived
```

Protected characteristics must not be used for team recommendations.

---

## FR-005: Employee Search

Managers must be able to search and filter employees by:

* Name
* Role
* Department
* Skill
* Skill proficiency
* Availability
* Remaining capacity
* Project experience
* Time zone
* Employment status

Search results must clearly show when information is missing or outdated.

---

## FR-006: Availability and Capacity

Availability must be calculated for a selected period.

### Capacity Formula

```text
Remaining Capacity
=
Base Working Capacity
- Approved Leave
- Confirmed Project Allocations
- Selected Tentative Reservations
```

### Availability Statuses

```text
Available
Partially Available
Fully Allocated
Overallocated
Unavailable
Unknown
```

Unknown availability must never be treated as available.

### Capacity Information

```text
Employee
Period Start
Period End
Base Capacity
Approved Leave
Confirmed Allocation
Tentative Allocation
Remaining Capacity
Data Source
Last Updated
```

### Example

```text
Base Capacity:                 100%
Existing Project Allocation:   50%
Approved Leave Equivalent:     20%
Tentative Reservation:         20%
Remaining Capacity:            10%
```

---

## FR-007: Team Builder

The Team Builder must allow managers to:

* Review project role requirements.
* Search employees manually.
* Generate AI-assisted recommendations.
* Compare employees.
* Review skill matches.
* Review missing skills.
* Check capacity conflicts.
* Reserve employees temporarily.
* Approve project assignments.
* Replace recommended employees.
* Record why a recommendation was rejected or overridden.

---

## FR-008: Assignment Lifecycle

Project assignments must follow this lifecycle:

```text
Recommended
→ Reserved
→ Pending Approval
→ Confirmed
→ Active
→ Ended
```

Alternative outcomes:

```text
Recommended → Rejected
Reserved → Expired
Pending Approval → Declined
Confirmed → Cancelled
```

### Assignment Rules

* A temporary reservation must have an expiration time.
* A confirmed assignment must have start and end dates.
* A confirmed assignment must update the employee’s capacity.
* The system must warn before confirming an overallocated assignment.
* Overallocation requires a specific permission and override reason.
* The manager makes the final staffing decision.
* Team members receive a notification after assignment confirmation.

---

## FR-009: Team Recommendation Engine

The recommendation engine must use deterministic scoring.

The language model may explain the score but must not calculate or invent it.

### Hard Eligibility Rules

Before scoring, an employee must:

* Have an active status.
* Be available during the required project period.
* Have remaining capacity.
* Be permitted to join the project.
* Match the role or at least one required skill.
* Have no unresolved assignment conflict.

### Initial Fit Score

```text
Required Skill Coverage:       40%
Availability and Capacity:     30%
Relevant Project Experience:   15%
Preferred Skill Coverage:      10%
Time-Zone or Schedule Fit:      5%
```

This result must be called a:

> Project Fit Score

It must not be called a success score or employee performance score.

### Recommendation Output

```json
{
  "employeeId": "EMP-1024",
  "roleRequirementId": "ROLE-204",
  "projectFitScore": 87,
  "matchedSkills": [
    "Python",
    "FastAPI",
    "PostgreSQL"
  ],
  "missingSkills": [
    "Azure Service Bus"
  ],
  "remainingCapacityPercent": 60,
  "dataFreshness": "2026-09-01T08:00:00Z",
  "warnings": [],
  "recommendationReason": "Strong required-skill coverage and enough capacity for the project period."
}
```

### Recommendation Restrictions

The following must not affect the default recommendation score:

* Private manager feedback
* Formal employee ratings
* Age
* Gender
* Nationality
* Religion
* Disability
* Marital status
* Health information
* Personal chat activity
* Emotion analysis

---

## FR-010: Native Ticket Management

TACT AI must provide a basic native ticket system.

### Ticket Fields

```text
Ticket ID
Project ID
Title
Description
Ticket Type
Status
Priority
Assignee
Reporter
Reviewer
Story Points
Due Date
Dependencies
Blocker Reason
Created At
Updated At
Version
External Provider
External ID
```

### Ticket Types

```text
Epic
User Story
Task
Bug
Improvement
Support Issue
```

### Ticket Statuses

```text
Backlog
Ready
In Progress
Blocked
In Review
Done
Cancelled
```

### Main Ticket Flow

```text
Backlog
→ Ready
→ In Progress
→ In Review
→ Done
```

Exception flows:

```text
In Progress → Blocked
Blocked → In Progress
Any Active Status → Cancelled
```

### Ticket Features

* Create and edit tickets.
* Assign an owner and reviewer.
* Add comments.
* Add dependencies.
* Record blockers.
* Maintain activity history.
* Filter across projects.
* Display overdue work.
* Link external tickets when integrations are enabled.

---

## FR-011: Feedback Management

Managers must be able to provide project-related feedback.

### Feedback Fields

```text
Employee
Project
Author
Category
Visibility
Feedback Text
Created At
Updated At
Status
```

### Feedback Categories

```text
Recognition
Strength
Improvement Area
Coaching
Project Contribution
Follow-Up
```

### Visibility Options

```text
Manager Only
Manager and Employee
Project Leadership
Authorized HR or People Partner
```

### Feedback Lifecycle

```text
Draft
→ Submitted
→ Shared
→ Acknowledged
→ Closed
```

### Feedback Rules

* Private feedback must not appear in general project search.
* Private feedback must not be included in general document retrieval.
* Submitted feedback must maintain a revision history.
* Employees may acknowledge feedback shared with them.
* Access to private feedback must be audited.
* Feedback must not automatically change an employee’s recommendation score.

---

## FR-012: Project Contribution Information

TACT AI may display factual project contribution information.

Examples:

* Tickets assigned
* Tickets completed
* Story points completed
* Tickets completed on time
* Overdue tickets
* Current blockers
* Blocker duration
* Review activity
* Current workload
* Project participation
* Shared feedback

### Contribution Rules

* Ticket counts must not be treated as a complete measure of productivity.
* Different roles must not be directly ranked using raw ticket counts.
* Every metric must include a date range.
* Every metric must show its data source.
* Missing data must be visible.
* The system must not create a hidden employee performance score.
* TACT AI must not provide promotion, termination, or compensation recommendations.

---

## FR-013: Project Progress

When story points are consistently available:

```text
Project Progress
=
Completed Story Points
÷
Total Committed Story Points
```

When story points are not consistently available:

```text
Project Progress
=
Completed Active Tickets
÷
Total Active Tickets
```

Cancelled tickets must not count in the total.

The interface must show which method is being used.

---

## FR-014: Project Health

Project health must be rule-based.

### Green

* No overdue critical tickets.
* No critical unresolved blockers.
* No critical staffing gaps.
* No serious allocation conflicts.

### Amber

* Tickets are approaching deadlines.
* A non-critical role remains unfilled.
* One or more employees are overallocated.
* A blocker has remained open beyond its threshold.
* Integrated data is stale.

### Red

* A critical milestone is overdue.
* A critical project role remains unfilled.
* A release-blocking ticket is delayed.
* The project has no active manager.
* A major integration failure prevents reliable reporting.

The AI may explain project health but must not invent the status.

---

## FR-015: Manager Dashboard

The Manager Dashboard must show:

* Active projects
* Projects at risk
* Projects awaiting staffing approval
* Available employees
* Overallocated employees
* Open tickets
* Blocked tickets
* Overdue tickets
* Pending reviews
* Pending feedback
* Staffing gaps
* Recent AI recommendations
* Integration warnings

---

## FR-016: Team Member Dashboard

The Team Member Dashboard must show:

* Assigned projects
* Assigned tickets
* Upcoming deadlines
* Current allocation
* Project announcements
* Feedback shared with the employee
* Review requests
* Blockers requiring attention

---

## FR-017: Reporting

TACT AI must support:

* Weekly project status report
* Team composition report
* Capacity report
* Staffing-gap report
* Workload-conflict report
* Ticket status report
* Blocker report
* Project contribution summary
* Feedback summary
* Project closure report

Reports may be generated manually or through the AI assistant.

---

## FR-018: Notifications

The platform must initially support in-app notifications.

Notification events include:

* New project assignment
* Assignment confirmation
* New ticket assignment
* Ticket approaching its deadline
* Ticket blocked
* Review requested
* Feedback shared
* Capacity conflict detected
* Project role remains unfilled
* AI action awaiting approval
* Integration synchronization failure

Email, Microsoft Teams, and Slack notifications are future options.

---

## FR-019: Documents and Knowledge

Managers must be able to upload project documents.

Supported initial file types:

```text
PDF
DOCX
TXT
Markdown
CSV
XLSX
```

### Document Lifecycle

```text
Uploaded
→ Scanning
→ Processing
→ Indexing
→ Ready
```

Failure outcomes:

```text
Failed
Rejected
```

### Document Requirements

* Documents must belong to a project.
* Documents must have access permissions.
* Document revisions must be maintained.
* Files must be scanned before processing.
* Search results must preserve project and permission boundaries.
* AI answers must include source references when based on documents.

Private feedback must not be stored in the general project-document index.

---

## FR-020: Central AI Assistant

The AI assistant must be available in two forms:

1. A full-page assistant.
2. A persistent side panel available from other screens.

The assistant must be able to answer authorized questions about:

* Projects
* Employees
* Skills
* Availability
* Workload
* Team requirements
* Team assignments
* Tickets
* Project health
* Project contribution information
* Feedback
* Reports
* Documents
* Optional integrated systems

### Example Requests

```text
Who is available for the backend developer role?

Why was Maria recommended for this project?

Which project roles are still unfilled?

Show all employees above 90% allocation.

Which tickets are currently blocked?

Create a weekly summary for Project Atlas.

Recommend someone who can assist with this ticket.

Show the feedback shared with me.

Prepare a proposal to assign this ticket to Daniel.
```

---

# 15. AI System Design

## 15.1 MVP Agent Model

The MVP must use one central:

> TACT Orchestrator Agent

Do not create several independent agents during the MVP.

A single orchestrator is easier to:

* Test
* Secure
* Monitor
* Evaluate
* Demonstrate

Microsoft Foundry Agent Service is the selected managed agent platform because it supports agent runtimes, conversations, tools, lifecycle management, publishing, security controls, and custom agent code.

---

## 15.2 Agent Responsibilities

The TACT Orchestrator Agent must:

1. Understand the user request.
2. Identify the required project or employee context.
3. check the current user’s permissions.
4. Retrieve structured application data.
5. Search authorized project documents when needed.
6. Use controlled application tools.
7. Explain recommendations.
8. Identify incomplete or outdated data.
9. Ask for approval before write actions.
10. Record important actions.

---

## 15.3 Read-Only Agent Tools

```text
search_projects
get_project
get_project_summary
get_project_health
get_project_requirements
get_project_team

search_employees
get_employee_profile
get_employee_skills
get_employee_availability
get_employee_workload

get_open_tickets
get_blocked_tickets
get_overdue_tickets
get_ticket_details

get_feedback_summary
get_project_contribution_summary
search_project_documents
get_integration_health
```

---

## 15.4 Recommendation Tools

```text
recommend_project_team
recommend_employee_for_role
recommend_ticket_assignee
identify_staffing_gaps
identify_capacity_conflicts
identify_project_risks
generate_status_report
generate_capacity_report
```

---

## 15.5 Write Tools Requiring Confirmation

```text
create_project
update_project
reserve_employee
assign_employee_to_project
remove_employee_from_project
create_ticket
assign_ticket
update_ticket_status
record_feedback
send_notification
create_project_report
update_external_ticket
```

The AI must never write directly to the database.

Every tool call must go through the backend service layer.

---

## 15.6 AI Write-Action Flow

```text
User Request
      ↓
Agent Reads Authorized Data
      ↓
Agent Prepares an Action Proposal
      ↓
Backend Validates the Proposal
      ↓
User Sees the Exact Proposed Change
      ↓
User Approves or Rejects
      ↓
Backend Executes the Approved Change
      ↓
Result Is Recorded in the Audit Log
```

### AI Action Proposal Fields

```text
Action ID
User ID
Session ID
Action Type
Risk Level
Target Records
Current Values
Proposed Values
Preview
Confirmation Token
Expiration Time
Idempotency Key
Status
Approved By
Executed By
Execution Result
Failure Reason
```

The approved payload must not change after confirmation.

---

## 15.7 AI Response Requirements

Where applicable, an AI answer must contain:

```text
Answer
Reasoning Summary
Source Records
Project Scope
Data Freshness
Missing Information
Warnings
Suggested Next Action
```

The assistant must be able to say:

* I do not have permission to view that information.
* There is not enough data to answer this.
* The availability information is outdated.
* No eligible employee was found.
* This action requires manager approval.
* The external integration is unavailable.

---

## 15.8 AI Conversation Ownership

Microsoft Foundry manages the runtime conversation.

PostgreSQL stores the application-visible and auditable conversation record.

The database must store:

```text
Chat Session
Chat Message
Message Author
Message Timestamp
Model Version
Prompt Version
Tool Calls
Citations
Action Proposals
Approval Results
Token Usage
Estimated AI Cost
Foundry Conversation ID
```

---

## 15.9 Future Specialized Agents

Specialized agents may be added after the production version is stable.

Potential future agents:

* Team Planning Agent
* Capacity Agent
* Project Delivery Agent
* Reporting Agent
* Integration Agent
* Support and Incident Agent

All specialized agents must continue to use the same authorization and approval controls.

---

# 16. Optional Integrations

Integrations must be implemented using provider adapters.

The main application must not directly depend on a specific external platform.

## 16.1 Integration Modes

```text
Disabled
Import Only
Export Only
Read Only
Two-Way Synchronization
```

## 16.2 Excel

### MVP Capability

* CSV import
* XLSX import
* CSV export
* XLSX export

Possible imported data:

* Employees
* Skills
* Availability
* Project requirements
* Tickets

### Future Live Excel Integration

* Connect to an approved workbook.
* Read configured tables.
* Write reports to configured sheets.
* Maintain field mappings.

---

## 16.3 Jira

Potential capabilities:

* Import projects or tickets.
* Read ticket status.
* Create tickets.
* Assign tickets.
* Update ticket status.
* Read comments and history.
* Link Jira tickets to TACT AI projects.

A Jira-enabled project must treat Jira as the canonical ticket system.

---

## 16.4 Workday

Potential capabilities:

* Read approved employee profiles.
* Read roles and departments.
* Read reporting structures.
* Read skills when available.
* Read leave or availability inputs when available.

The first Workday integration must be read-only.

Actual fields depend on the organization’s Workday configuration and permissions.

---

## 16.5 GitHub or Azure DevOps

Potential capabilities:

* Link tickets to branches.
* Link tickets to pull requests.
* Read review status.
* Read build status.
* Read deployment status.
* View project development activity.

Development activity should initially be read-only.

---

## 16.6 Microsoft Teams or Slack

Potential capabilities:

* Send project notifications.
* Request approvals.
* Notify ticket owners.
* Send weekly summaries.
* Provide a conversational TACT AI interface.

---

## 16.7 SharePoint

Potential future capabilities:

* Connect project documents.
* Search authorized project content.
* Preserve SharePoint access permissions.
* Link answers to original documents.

---

## 16.8 Integration Requirements

Every integration must define:

```text
Authentication Method
Required Permissions
Integration Mode
Field Mapping
Source Ownership
Initial Synchronization
Incremental Synchronization
Retry Policy
Rate-Limit Handling
Conflict Policy
Deletion Policy
Webhook Validation
Manual Resynchronization
Last Successful Sync
Connection Health
Last Error
```

### Conflict Handling

When the same record changes in TACT AI and an external system:

```text
Detect the revision mismatch
→ Mark the record as conflicted
→ Show both versions
→ Apply the configured rule or request manual resolution
→ Record the decision
```

External data must never silently overwrite newer internal data.

---

# 17. Technical Architecture

```text
React Web Application
          |
          | HTTPS / REST / Server-Sent Events
          v
Python FastAPI API
          |
          +---------------- Application Services
          |                     |
          |                     +--- Projects
          |                     +--- People
          |                     +--- Skills
          |                     +--- Capacity
          |                     +--- Team Builder
          |                     +--- Assignments
          |                     +--- Tickets
          |                     +--- Feedback
          |                     +--- Reporting
          |
          +---------------- PostgreSQL
          |
          +---------------- TACT Orchestrator Agent
          |                     |
          |                     +--- Secured Tools
          |                     +--- Microsoft Foundry
          |                     +--- Azure AI Search
          |
          +---------------- Document Processing
          |                     |
          |                     +--- Azure Blob Storage
          |                     +--- Azure AI Search
          |
          +---------------- Integration Adapters
          |                     |
          |                     +--- Excel
          |                     +--- Jira
          |                     +--- Workday
          |                     +--- GitHub
          |                     +--- Azure DevOps
          |                     +--- Teams
          |
          +---------------- Background Worker
                                |
                                +--- Synchronization
                                +--- Notifications
                                +--- Document Processing
                                +--- Report Generation
```

---

# 18. Required Technology Stack

The following versions are the initial project baseline and must be pinned in the repository.

As of September 2, 2026, React documents version 19.2 as its latest version. Node.js 24 is an LTS release, while Node.js 26 remains a Current release; production applications should use an LTS version. Python 3.14.7 is the current stable Python release, and FastAPI’s release notes list version 0.140.1.

## 18.1 Frontend

| Area               | Technology            |
| ------------------ | --------------------- |
| Runtime            | Node.js 24 LTS        |
| Framework          | React 19.2            |
| Language           | TypeScript            |
| Build Tool         | Vite                  |
| Package Manager    | pnpm                  |
| Routing            | React Router          |
| Server State       | TanStack Query        |
| Local UI State     | Zustand               |
| Forms              | React Hook Form       |
| Validation         | Zod                   |
| Styling            | Tailwind CSS          |
| Component Library  | shadcn/ui             |
| Charts             | Recharts              |
| Unit Testing       | Vitest                |
| Component Testing  | React Testing Library |
| End-to-End Testing | Playwright            |

Vite supports React and TypeScript templates and requires a supported modern Node.js runtime; Node.js 24 LTS satisfies the documented requirement.

### Frontend Rules

* TypeScript strict mode must remain enabled.
* TanStack Query owns server state.
* Zustand must only manage cross-page interface state.
* API records must not be duplicated in Zustand.
* Every page must include loading, empty, error, and success states.
* Business logic must not be placed directly inside page components.

---

## 18.2 Backend

| Area                   | Technology         |
| ---------------------- | ------------------ |
| Runtime                | Python 3.14        |
| API Framework          | FastAPI 0.140.x    |
| Data Validation        | Pydantic v2        |
| ORM                    | SQLAlchemy 2.x     |
| Database Migrations    | Alembic            |
| PostgreSQL Driver      | asyncpg            |
| HTTP Client            | HTTPX              |
| Testing                | pytest             |
| Linting and Formatting | Ruff               |
| Type Checking          | mypy               |
| Dependency Manager     | uv                 |
| API Style              | REST and JSON      |
| API Documentation      | OpenAPI            |
| Chat Streaming         | Server-Sent Events |

Python 3.13 may be used only as a documented fallback when a required dependency does not support Python 3.14.

Any runtime change requires an Architecture Decision Record.

---

## 18.3 Data and Storage

| Purpose              | Technology                                    |
| -------------------- | --------------------------------------------- |
| Main Database        | PostgreSQL 17                                 |
| Managed Database     | Azure Database for PostgreSQL Flexible Server |
| Documents            | Azure Blob Storage                            |
| Search and Retrieval | Azure AI Search                               |
| Background Messaging | Azure Service Bus                             |
| Local Database       | PostgreSQL through Docker Compose             |

Azure Database for PostgreSQL Flexible Server supports PostgreSQL 17 and newer supported versions. PostgreSQL 17 is selected as the initial conservative baseline for this project.

---

## 18.4 AI Stack

| Purpose            | Technology                                           |
| ------------------ | ---------------------------------------------------- |
| Agent Platform     | Microsoft Foundry Agent Service                      |
| Model              | Configurable Foundry model deployment                |
| Embeddings         | Configurable Foundry embedding deployment            |
| Document Retrieval | Azure AI Search                                      |
| Agent Tools        | Secured FastAPI application tools                    |
| Evaluation         | Microsoft Foundry evaluations plus application tests |
| Conversation Audit | PostgreSQL                                           |
| Content Protection | Foundry safety controls and backend validation       |

Model deployment names must be stored in configuration.

Model names must not be hardcoded in application logic.

---

## 18.5 Authentication and Security

| Purpose                      | Technology                             |
| ---------------------------- | -------------------------------------- |
| Authentication               | Microsoft Entra ID                     |
| Frontend Authentication      | MSAL React                             |
| API Authorization            | Entra JWT validation                   |
| Application Permissions      | Role-Based Access Control              |
| Secrets                      | Azure Key Vault                        |
| Azure Service Authentication | Managed Identity                       |
| Audit Records                | PostgreSQL                             |
| Monitoring                   | Azure Monitor and Application Insights |

---

## 18.6 Azure Hosting

| Component              | Azure Service                            |
| ---------------------- | ---------------------------------------- |
| Frontend               | Azure Static Web Apps                    |
| Backend API            | Azure Container Apps                     |
| Background Worker      | Azure Container Apps                     |
| Scheduled Jobs         | Azure Container Apps Jobs                |
| Container Registry     | Azure Container Registry                 |
| Database               | Azure Database for PostgreSQL            |
| Documents              | Azure Blob Storage                       |
| AI Agents              | Microsoft Foundry                        |
| Search                 | Azure AI Search                          |
| Secrets                | Azure Key Vault                          |
| Messaging              | Azure Service Bus                        |
| Monitoring             | Application Insights and Azure Monitor   |
| Infrastructure as Code | Bicep                                    |
| CI/CD                  | GitHub Actions or Azure DevOps Pipelines |

---

# 19. Repository Structure

```text
tact-ai/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   ├── stores/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── api/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── core/
│   │   │   ├── models/
│   │   │   ├── schemas/
│   │   │   ├── repositories/
│   │   │   ├── services/
│   │   │   ├── agents/
│   │   │   ├── integrations/
│   │   │   ├── security/
│   │   │   └── main.py
│   │   ├── migrations/
│   │   └── tests/
│   │
│   └── worker/
│       ├── app/
│       └── tests/
│
├── packages/
│   ├── ui/
│   ├── api-client/
│   └── shared-types/
│
├── infra/
│   └── bicep/
│
├── docs/
│   ├── MASTER.md
│   ├── PRODUCT_REQUIREMENTS.md
│   ├── DOMAIN_RULES.md
│   ├── RBAC_AND_PRIVACY.md
│   ├── DATA_MODEL.md
│   ├── AI_SYSTEM.md
│   ├── INTEGRATIONS.md
│   ├── UX_FLOWS.md
│   ├── OPERATIONS.md
│   ├── TEST_STRATEGY.md
│   └── adr/
│
├── docker-compose.yml
├── .env.example
├── pyproject.toml
├── uv.lock
├── pnpm-lock.yaml
└── README.md
```

---

# 20. Core Data Model

## Organization and Access

```text
Organization
User
Employee
OrganizationMembership
Role
Permission
RolePermission
UserRoleAssignment
ProjectPermission
```

## Skills and Capacity

```text
Skill
EmployeeSkill
CapacityPeriod
LeavePeriod
EmployeeAvailability
```

## Projects and Staffing

```text
Project
ProjectRoleRequirement
ProjectAssignment
AssignmentReservation
AssignmentApproval
AssignmentConflict
```

## Recommendations

```text
RecommendationRun
RecommendationCandidate
RecommendationFactor
RecommendationDecision
RecommendationOverride
ScoringModelVersion
```

## Tickets

```text
Ticket
TicketComment
TicketAttachment
TicketRelation
TicketActivity
TicketRevision
TicketExternalMapping
```

## Feedback

```text
Feedback
FeedbackRevision
FeedbackAcknowledgement
FeedbackAccessLog
```

## AI

```text
ChatSession
ChatMessage
MessageCitation
AIToolExecution
AIActionProposal
AIActionApproval
PromptVersion
ModelConfiguration
```

## Documents

```text
Document
DocumentVersion
DocumentPermission
DocumentProcessingJob
DocumentChunk
```

## Integrations

```text
IntegrationConnection
IntegrationFieldMapping
ExternalRecordMapping
IntegrationSyncRun
IntegrationSyncError
WebhookEvent
SyncCursor
```

## Platform Operations

```text
Notification
AuditLog
ImportJob
ImportRowResult
Report
```

---

# 21. Data Rules

* Use UUIDs for primary identifiers.
* Store timestamps in UTC.
* Display dates and times using the user’s time zone.
* Use database constraints for required relationships.
* Use version numbers for optimistic concurrency.
* Use soft deletion for auditable business records.
* Do not physically delete projects, feedback, assignments, or audit records through normal application actions.
* Every database query must include the relevant organization and permission scope.
* External records must retain provider and external identifiers.
* AI-generated records must identify the model and prompt version used.

---

# 22. API Design

All application endpoints must begin with:

```text
/api/v1
```

## Core Endpoints

```text
GET    /api/v1/me

GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/{projectId}
PATCH  /api/v1/projects/{projectId}
POST   /api/v1/projects/{projectId}/close
POST   /api/v1/projects/{projectId}/archive

GET    /api/v1/projects/{projectId}/requirements
POST   /api/v1/projects/{projectId}/requirements
PATCH  /api/v1/project-requirements/{requirementId}

GET    /api/v1/people
POST   /api/v1/people
GET    /api/v1/people/{employeeId}
PATCH  /api/v1/people/{employeeId}

GET    /api/v1/people/{employeeId}/skills
PUT    /api/v1/people/{employeeId}/skills

GET    /api/v1/people/{employeeId}/availability
PUT    /api/v1/people/{employeeId}/availability

GET    /api/v1/projects/{projectId}/team
POST   /api/v1/projects/{projectId}/team/recommendations
POST   /api/v1/projects/{projectId}/reservations
POST   /api/v1/projects/{projectId}/assignments
PATCH  /api/v1/assignments/{assignmentId}

GET    /api/v1/tickets
GET    /api/v1/tickets/{ticketId}
POST   /api/v1/projects/{projectId}/tickets
PATCH  /api/v1/tickets/{ticketId}
POST   /api/v1/tickets/{ticketId}/transitions
POST   /api/v1/tickets/{ticketId}/comments

GET    /api/v1/projects/{projectId}/feedback
POST   /api/v1/projects/{projectId}/feedback
POST   /api/v1/feedback/{feedbackId}/acknowledge

GET    /api/v1/dashboard
GET    /api/v1/projects/{projectId}/reports
POST   /api/v1/projects/{projectId}/reports

POST   /api/v1/documents
GET    /api/v1/documents/{documentId}
GET    /api/v1/documents/{documentId}/status

POST   /api/v1/assistant/sessions
GET    /api/v1/assistant/sessions/{sessionId}
POST   /api/v1/assistant/sessions/{sessionId}/messages

GET    /api/v1/ai-actions
GET    /api/v1/ai-actions/{actionId}
POST   /api/v1/ai-actions/{actionId}/approve
POST   /api/v1/ai-actions/{actionId}/reject

GET    /api/v1/notifications
POST   /api/v1/notifications/{notificationId}/read

POST   /api/v1/imports
GET    /api/v1/imports/{importId}

GET    /api/v1/integrations
POST   /api/v1/integrations
PATCH  /api/v1/integrations/{integrationId}
POST   /api/v1/integrations/{integrationId}/sync

POST   /api/v1/webhooks/jira
POST   /api/v1/webhooks/azure-devops

GET    /health/live
GET    /health/ready
```

---

# 23. API Standards

* List endpoints must support pagination.
* List endpoints must support filtering and sorting.
* Date and time values must use ISO 8601.
* Write requests must support an idempotency key where duplicate execution is possible.
* Updates must use a record version or ETag.
* Errors must use a consistent structured format.
* Every request must have a correlation ID.
* File uploads must use size and file-type validation.
* Imports must execute as jobs rather than a single long API request.
* Webhook events must be authenticated and deduplicated.
* Long-running AI and report responses may use Server-Sent Events.

---

# 24. Main Application Routes

```text
/login

/assistant
/dashboard

/projects
/projects/new
/projects/:projectId
/projects/:projectId/requirements
/projects/:projectId/team-builder
/projects/:projectId/team
/projects/:projectId/tickets
/projects/:projectId/feedback
/projects/:projectId/documents
/projects/:projectId/reports
/projects/:projectId/close

/people
/people/:employeeId
/people/:employeeId/skills
/people/:employeeId/availability
/people/:employeeId/projects
/people/:employeeId/feedback

/tickets
/reports
/notifications
/imports
/integrations

/admin/users
/admin/roles
/admin/audit-logs
/admin/settings
```

---

# 25. Required Screens

| Screen                 | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| Sign In                | Authenticate users                                   |
| Assistant Home         | Central AI conversation                              |
| Manager Dashboard      | Project, capacity, and ticket overview               |
| Project List           | Search and manage projects                           |
| Create Project Wizard  | Create project and requirements                      |
| Project Overview       | Health, progress, team, and alerts                   |
| Requirements Editor    | Define required roles and skills                     |
| Team Builder           | Compare and recommend employees                      |
| Assignment Review      | Review conflicts and approve assignments             |
| Project Team           | View confirmed project members                       |
| People Directory       | Search internal employees                            |
| Employee Profile       | View skills, assignments, and authorized information |
| Availability View      | Review capacity over time                            |
| Global Ticket View     | Review authorized tickets across projects            |
| Project Ticket Board   | Manage project tickets                               |
| Ticket Details         | Review ticket content, history, and blockers         |
| Feedback Form          | Create project-related feedback                      |
| Feedback History       | View authorized feedback                             |
| Reports                | View and generate reports                            |
| AI Action Confirmation | Review exact AI-proposed changes                     |
| Notifications          | Review alerts                                        |
| Import Review          | Review mappings and invalid records                  |
| Integrations           | Configure optional providers                         |
| Users and Roles        | Manage access                                        |
| Audit Logs             | Review important activities                          |
| Project Closure        | Close project and release allocations                |

Every screen must define:

```text
Authorized Roles
Primary Actions
Required Fields
Validation
Loading State
Empty State
Error State
Success State
Responsive Behavior
Accessibility Requirements
```

---

# 26. Main Wireframe

```text
+------------------------------------------------------------------+
| TACT AI                 Search          Notifications | Profile   |
+--------------------+---------------------------------------------+
| AI Assistant       | Management Overview                         |
| Dashboard          |                                             |
| Projects           | Active Projects: 5      At Risk: 1          |
| Team Builder       | Available People: 18    Overallocated: 3    |
| People             | Open Tickets: 42        Blocked: 4          |
| Tickets            | Staffing Gaps: 2        Pending Reviews: 6  |
| Feedback           |                                             |
| Reports            | ------------------------------------------- |
| Integrations       |                                             |
| Admin              | TACT AI Assistant                           |
|                    |                                             |
|                    | "Who is available for a Python backend      |
|                    |  role during October?"                      |
|                    |                                             |
|                    | [ Ask about projects, people or tickets ]   |
+--------------------+---------------------------------------------+
```

---

# 27. Team Builder Wireframe

```text
+------------------------------------------------------------------+
| Project Atlas > Team Builder                                     |
+------------------------------------------------------------------+
| Role: Backend Developer       Required Headcount: 2               |
| Dates: Oct 1–Dec 31           Required Allocation: 100%           |
| Required: Python, FastAPI, PostgreSQL                             |
+------------------------------------------------------------------+
| Candidate       Fit   Capacity   Matched Skills       Warning     |
|------------------------------------------------------------------|
| Maria Santos    91%   100%       Python, FastAPI      None        |
| Daniel Cruz     87%    60%       Python, PostgreSQL   Missing API |
| Alex Reyes      74%    30%       Python               Low capacity|
+------------------------------------------------------------------+
| Selected: Maria Santos                                           |
|                                                                  |
| Why recommended:                                                 |
| Strong required-skill coverage, full availability, and relevant  |
| backend project experience.                                      |
|                                                                  |
| [Compare] [Reserve] [Assign] [Choose Another Employee]            |
+------------------------------------------------------------------+
```

---

# 28. Security and Privacy Requirements

* Use Microsoft Entra ID in production.
* Validate permissions in the backend.
* Do not rely only on hidden interface elements.
* Apply field-level access to sensitive information.
* Isolate every organization’s records.
* Store secrets in Azure Key Vault.
* Use managed identities where supported.
* Encrypt data in transit and at rest.
* Scan uploaded files.
* Validate external webhooks.
* Log access to private feedback.
* Log AI tool calls and approved actions.
* Do not include sensitive employee data in normal application logs.
* Do not use production employee data in local development.
* Use synthetic employee data for the contest demonstration.
* Preserve document access restrictions during AI retrieval.
* Allow authorized data correction, export, retention, and deletion workflows.
* Prevent prompt injection from bypassing tool permissions.
* Never allow an AI model to execute unrestricted database queries.

---

# 29. Non-Functional Requirements

## Performance

```text
Normal API Request:          under 500 ms at p95
Dashboard Load:              under 2 seconds
Structured Search:           under 2 seconds
AI First Response Target:    under 5 seconds
Normal Page Interaction:     under 200 ms perceived response
```

Long-running operations must use background jobs.

## Accessibility

Target:

> WCAG 2.2 AA

Required:

* Keyboard navigation
* Screen-reader labels
* Visible focus states
* Accessible form errors
* Sufficient contrast
* Responsive text sizing
* Accessible tables and dialogs
* No color-only status indicators

## Reliability

* Integration failures must not disable native features.
* Synchronization jobs must support retries.
* Webhook events must be idempotent.
* Database migrations must be reviewed.
* Backups must be automated.
* Restore procedures must be tested.
* External system failures must show clear stale-data warnings.

## Observability

Monitor:

* API errors
* Request latency
* Database performance
* AI response latency
* Model and token usage
* Tool-call failures
* Integration health
* Sync failures
* Document-processing failures
* Authorization failures
* Background job status

## Scalability

The first production design should support:

```text
100–1,000 users
10–100 active projects
10,000+ tickets
Thousands of employee-skill records
Concurrent AI conversations
```

Larger enterprise scale can be addressed after usage is measured.

---

# 30. Release Phases

## Phase 0 — Contest Prototype

**Version:** 0.0
**Purpose:** Demonstrate the idea using synthetic data.

### Included

* Static or lightly functional interface
* Project creation flow
* Sample employee database
* Sample skills and availability
* Team recommendation demonstration
* Ticket board
* Manager dashboard
* Simulated or limited chatbot
* Simple project report

### Excluded

* Real employee data
* Live Workday integration
* Production authentication
* Two-way synchronization
* Private production documents
* Formal performance information

### Exit Criteria

A user can understand the full TACT AI concept through one end-to-end demonstration.

---

## Phase 1 — Functional MVP

**Version:** 0.1
**Purpose:** Deliver the first working standalone product.

### Included

* Simplified authentication and roles
* Project creation
* Project role and skill requirements
* Internal employee directory
* Employee skills
* CSV or XLSX employee import
* Manual availability
* Date-based capacity calculations
* Deterministic team recommendations
* AI-generated recommendation explanations
* Employee reservations
* Manager-approved project assignments
* Native ticket tracking
* Basic feedback
* Project contribution summaries
* Manager dashboard
* Team member dashboard
* Read-only AI assistant over structured TACT AI data
* Basic audit events
* Azure development deployment

### Excluded

* Live Workday integration
* Jira synchronization
* Azure DevOps synchronization
* Document retrieval
* AI write actions
* Multi-agent workflows
* Formal employee ratings
* Multi-organization SaaS

### Exit Criteria

A manager can:

```text
Create a project
→ Define project needs
→ Generate team recommendations
→ Approve a project team
→ Create and assign tickets
→ Track workload and progress
→ Record feedback
→ Ask the AI about the project
```

---

## Phase 2 — Secure Beta and Internal Pilot

**Version:** 0.5
**Purpose:** Support a real internal project team.

### Included

* Microsoft Entra ID
* Full role-based access
* Field-level permissions
* Complete audit logs
* Project documents
* Azure Blob Storage
* Azure AI Search
* Permission-aware retrieval
* AI answers with citations
* AI write-action proposals
* User confirmation workflow
* In-app notifications
* Improved import and export
* Background workers
* Azure Service Bus
* Application Insights
* Backup and restore testing
* Retention controls
* Responsive interface
* Accessibility review
* CI/CD pipeline

### Exit Criteria

A real internal team can use TACT AI securely without requiring an external integration.

---

## Phase 3 — Production Web Application

**Version:** 1.0
**Purpose:** Deliver a stable organization-wide web application.

### Included

* Production security hardening
* Organization administration
* Full role and permission configuration
* One production ticket integration:

  * Jira, or
  * Azure DevOps
* Workday read-only integration
* GitHub or Azure DevOps development activity
* Microsoft Teams notifications
* Integration health monitoring
* Retry handling
* Conflict handling
* Advanced cross-project capacity views
* Configurable recommendation weights
* Data-retention controls
* AI evaluation suite
* Load testing
* Accessibility validation
* Disaster-recovery documentation
* Usage and cost monitoring

Only one ticket integration needs to be completed for version 1.0. The second can be added later.

### Exit Criteria

TACT AI can reliably support multiple teams and projects inside an organization.

---

## Phase 4 — Full Enterprise Platform

**Version:** 2.0
**Purpose:** Expand TACT AI into a complete enterprise staffing and delivery platform.

### Included

* Multi-organization SaaS
* Multiple specialized AI agents
* What-if team simulations
* Advanced resource forecasting
* Skills-gap analysis
* Project risk forecasting
* Cross-project staffing optimization
* SharePoint integration
* Microsoft Teams chatbot
* Custom integration builder
* Custom dashboards
* Custom reports
* Private networking
* Customer-managed encryption
* Regional data controls
* Enterprise audit exports
* Progressive web application
* Mobile application
* Support and incident management module

---

# 31. Optional Nice-to-Have Features

These features must not delay the core product.

## Team and Skills

* Employee career goals
* Learning recommendations
* Mentor recommendations
* Backup-person recommendations
* Skill verification workflows
* Contractor profiles
* Temporary assignments

## Project Management

* Sprint planning
* Gantt charts
* Roadmaps
* Dependency visualization
* Milestones
* Risk register
* Budget tracking
* Cost forecasting

## AI

* Proactive project alerts
* Automatic weekly reports
* Natural-language dashboard creation
* Meeting-summary ingestion
* Project risk forecasting
* Draft feedback suggestions
* Automated project documentation
* Multiple-language support

## Communication

* Email summaries
* Daily manager digest
* Employee reminders
* Teams approvals
* Slack notifications

## Additional Applications

* Support issue management
* Customer issue-to-ticket conversion
* Incident-response workflows
* Browser extension
* Desktop wrapper
* Mobile application

---

# 32. Testing Strategy

Required test categories:

```text
Unit Tests
API Integration Tests
Database Tests
Authorization Tests
Field-Level Permission Tests
Organization-Isolation Tests
Recommendation Logic Tests
Capacity Calculation Tests
AI Tool Contract Tests
AI Evaluation Tests
Document Retrieval Tests
Prompt-Injection Tests
Integration Contract Tests
Webhook Replay Tests
Import Validation Tests
End-to-End Tests
Accessibility Tests
Performance Tests
Backup and Restore Tests
```

## Mandatory Test Scenarios

* A project manager cannot view unauthorized project feedback.
* A team member cannot view another employee’s private feedback.
* The AI cannot retrieve unauthorized records.
* The AI cannot retrieve unauthorized documents.
* The AI cannot execute an expired action proposal.
* The approved action payload cannot change after confirmation.
* A repeated webhook event cannot create duplicate records.
* An employee cannot be confirmed above capacity without an authorized override.
* Unknown availability cannot produce a high-confidence recommendation.
* Protected personal information cannot affect the fit score.
* A failed integration cannot disable native project features.
* Closing a project releases future employee capacity.
* Concurrent updates cannot silently overwrite each other.

---

# 33. Development Quality Checks

## Frontend

```text
pnpm lint
pnpm test
pnpm build
pnpm playwright test
```

## Backend

```text
ruff check .
ruff format --check .
mypy app
pytest
```

## Pull Request Requirements

Every pull request must include:

* Feature or bug description
* Related requirement ID
* Screenshots for interface changes
* Tests added or updated
* Database migration notes
* Permission or privacy impact
* AI impact when applicable
* Integration impact when applicable
* Confirmation that existing functionality was tested

---

# 34. Initial Development Order

## Sprint 1: Foundation

* Create repository structure.
* Scaffold React and FastAPI applications.
* Configure PostgreSQL.
* Configure Docker Compose.
* Add database migrations.
* Create basic navigation.
* Add synthetic seed data.
* Establish linting and test pipelines.

## Sprint 2: Projects and People

* Project CRUD.
* Employee directory.
* Skills management.
* Availability records.
* Project role requirements.
* Search and filtering.

## Sprint 3: Capacity and Team Builder

* Date-based capacity calculation.
* Employee reservations.
* Recommendation scoring.
* Recommendation explanation.
* Candidate comparison.
* Assignment approval.

## Sprint 4: Tickets and Feedback

* Native ticket board.
* Ticket details.
* Ticket assignments.
* Ticket transitions.
* Blocker tracking.
* Feedback creation.
* Feedback visibility.
* Project contribution summaries.

## Sprint 5: AI Assistant

* Chat sessions.
* Read-only application tools.
* Project questions.
* Employee and capacity questions.
* Ticket and blocker questions.
* Status report generation.
* AI audit records.

## Sprint 6: Dashboards and Release

* Manager dashboard.
* Team member dashboard.
* Reports.
* Notifications.
* Accessibility review.
* End-to-end tests.
* Azure development deployment.
* Monitoring.
* Final documentation.

---

# 35. MVP Definition of Done

The MVP is complete when a manager can:

* Sign in or select a demonstration role.
* Create a project.
* Define required roles and skills.
* Add or import employee profiles.
* Record employee skills.
* Record employee availability.
* Search employees.
* Generate a team recommendation.
* Understand why each employee was recommended.
* Review missing skills and workload conflicts.
* Reserve and confirm employees.
* Create and assign tickets.
* Track ticket progress.
* Record project feedback.
* View basic contribution information.
* View project progress and health.
* Ask the AI assistant about projects, employees, capacity, and tickets.
* Receive answers based on stored TACT AI data.
* Use the application without configuring an external integration.

---

# 36. Initial Pilot Assumptions

These are planning estimates and must be validated.

```text
Initial Users:                         100
Managers:                               10
Employees and Team Members:             90
Active Projects:                      5–10
Monthly Project and Staffing Alerts:    250
Estimated Manager Time Saved:            40 hours per month
```

Potential alerts include:

* Delayed tickets
* Blocked tickets
* Workload conflicts
* Missing project roles
* Unavailable employees
* Pending reviews
* Stale information
* Integration failures

The value estimates must be presented as hypotheses until pilot data is available.

---

# 37. Product Success Metrics

| Metric                                  | Purpose                            |
| --------------------------------------- | ---------------------------------- |
| Average time to staff a project         | Measures staffing efficiency       |
| Recommendation acceptance rate          | Measures recommendation usefulness |
| Recommendation override rate            | Identifies weak recommendations    |
| Allocation conflicts detected           | Measures workload visibility       |
| Allocation conflicts prevented          | Measures practical impact          |
| Time required to create a weekly report | Measures management time saved     |
| AI answer success rate                  | Measures assistant usefulness      |
| Answers with valid sources              | Measures grounding quality         |
| Unauthorized-access tests passed        | Measures data protection           |
| Ticket synchronization freshness        | Measures integration reliability   |
| Weekly active managers                  | Measures adoption                  |
| Project staffing completion rate        | Measures the main product outcome  |

---

# 38. Main Risks and Controls

| Risk                                 | Control                                                          |
| ------------------------------------ | ---------------------------------------------------------------- |
| Incorrect employee recommendation    | Deterministic scoring, explanations, and manager approval        |
| Employee overallocation              | Date-based capacity calculation and assignment warnings          |
| Exposure of private feedback         | Field-level permissions and access logging                       |
| AI hallucination                     | Structured tools, retrieval citations, and missing-data warnings |
| AI performs an incorrect action      | Exact action preview and human confirmation                      |
| External integration overwrites data | Source-of-truth rules and conflict handling                      |
| Outdated employee information        | Data-freshness indicators                                        |
| Unfair performance comparison        | No hidden score and no raw cross-role ranking                    |
| Integration outage                   | Native features remain available                                 |
| Duplicate synchronization            | Idempotency and external record mappings                         |
| Coding agent invents behavior        | This document remains the source of truth                        |

---

# 39. Coding Agent Rules

The coding agent must:

1. Treat this document as the main product source of truth.
2. Implement only the active release phase unless instructed otherwise.
3. Keep external integrations optional.
4. Keep business logic independent of provider adapters.
5. Enforce permissions in the backend.
6. Never allow the AI layer to access the database directly.
7. Require human confirmation for AI write actions.
8. Use deterministic logic for project fit scores.
9. Never use protected characteristics in recommendations.
10. Never use private feedback in recommendation scoring by default.
11. Never generate promotion, termination, compensation, or hiring decisions.
12. Preserve revision and audit history.
13. Use feature flags for incomplete optional functionality.
14. Include tests for critical workflows.
15. Update documentation when behavior changes.
16. Create an Architecture Decision Record for major technical changes.
17. Do not replace the selected technology stack without approval.
18. Do not use production employee data during development.
19. Do not silently resolve integration conflicts.
20. Do not implement future-phase features in a way that delays the current phase.

---

# 40. Final Product Statement

TACT AI is a central management platform that helps organizations turn a potential project into a properly staffed and measurable project team.

It combines:

```text
Project Creation
+ Role and Skill Requirements
+ Employee Discovery
+ Availability and Capacity
+ Team Recommendations
+ Assignment Management
+ Ticket Tracking
+ Feedback
+ Project Contribution Visibility
+ Central AI Assistance
+ Optional Integrations
```

TACT AI does not need to replace every tool an organization already uses.

Its value is giving managers one intelligent place to understand their projects, people, capacity, tickets, feedback, and next actions.
