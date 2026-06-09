Feni Blood Line — Backend Engineering Specification
Project Overview

Build a production-ready backend for Feni Blood Line, a blood donor discovery and emergency blood request platform connecting blood donors with people and hospitals in the Feni region.

The platform allows:

Google-authenticated users to register as blood donors
Donors to mark themselves available/unavailable for donation
Recipients to search for donors by blood group and area
Hospitals to submit emergency blood requests visible to users

Backend must be built using:

Node.js
Express.js
TypeScript
MongoDB with Mongoose
Firebase Authentication for Google Sign-In verification

Deployment target:

Vercel Serverless Hosting

Architecture and implementation must remain fully compatible with Vercel serverless constraints.

Core Architectural Requirements
Architecture Pattern

Use a modular layered monolith architecture.

Each domain/module must be isolated and contain its own:

Routes
Controller
Service
Validation
Model
Interfaces/Types
Constants (if applicable)

Business logic must never be placed directly inside controllers.

Controllers should only:

Receive request
Call service layer
Return formatted response

Services should contain:

All business rules
Validation beyond schema validation
Database orchestration
Domain logic

Models should contain:

Only schema/model definitions
Indexes
Middleware/hooks if needed

Validation layer should handle:

Request body validation
Query validation
Param validation
Folder Structure Requirements

Use a professional scalable modular folder structure.

Include:

Central app bootstrap
Global route aggregator
Module-based feature folders
Shared middleware directory
Shared utility/helper directory
Config directory for environment, DB, Firebase
Constants directory for enums/shared constants
Interface/types directory for global shared types

Structure must be easy to:

Extend
Refactor
Maintain by teams
Split into microservices later if needed

Avoid flat MVC folder structures.

Authentication Strategy
Authentication Provider

Use Firebase Authentication exclusively for Google Sign-In.

Backend must NOT implement:

Traditional login
Password auth
JWT generation
Refresh token system
Session storage
Backend-managed auth cookies

Reason:
Firebase client SDK handles token refresh/session persistence.

Backend Auth Flow

Protected endpoints must require Firebase ID Token.

Backend responsibilities:

Verify Firebase token on every protected request
Extract authenticated user info from token
Attach user context to request
User Sync Strategy

After Google login:
Frontend will send Firebase token to backend sync endpoint.

Backend must:

Verify token
Check if user exists by Firebase UID
If not exists:
Create new user automatically
Pre-fill available Google profile data
Mark profile as incomplete
Set donor availability to false by default
User Domain Specification
User Profile Fields

Each user profile must store:

Firebase UID
Full Name
Email
Phone Number
Blood Group
Location/Subdistrict
Google Profile Image URL
Donor Availability Status
Profile Completion Status
Last Donation Date (optional/future use)
Donation Count (optional/future use)
Block Status (optional/admin future use)
Immutable Fields

These fields must be immutable after initial creation:

Firebase UID
Email from Firebase
Google Profile Image URL

Frontend/user cannot modify these.

Profile Completion Flow

After first login:
User must complete profile before becoming searchable donor.

Incomplete profile users:

Cannot enable donor availability
Cannot appear in donor search
Supported Locations

Restrict donor/hospital location to fixed enum values only:

Feni Sadar
Sonagazi
Fulgazi
Chhagalnaiya
Daganbhuiyan
Parshuram

No arbitrary free-text location allowed.

Donor Availability Logic

Users have a toggle indicating readiness to donate.

Rules

User may enable availability only if:

Profile is fully completed
User is not blocked
Optional future: donation cooldown passed

When unavailable:

User must not appear in donor search
Donor Search Specification
Search Filters

Allow search by:

Blood Group (required)
Location (required)
Search Logic

Return only users where:

Blood group matches
Location matches
Availability is true
Profile is completed
User is not blocked
Search Result Constraints

Implement pagination support even if frontend initially does not use it.

Support:

page
limit

Default limit should be reasonable.

Performance Requirements

Donor search must be optimized with proper compound indexing.

Search must remain performant as donor count grows.

Hospital Emergency Blood Request Domain

Hospitals or organizations may create emergency blood requests.

Authentication for hospital requests can initially be public unless you decide otherwise.

Blood Request Fields

Store:

Hospital Name
Required Blood Group
Hospital/Facility Address
Contact Number
Needed Blood Unit Count
Location
Status
Creation Timestamp
Optional Notes
Request Status Values

Support:

OPEN
FULFILLED
CANCELLED

Default status:

OPEN
Blood Request Rules

Only OPEN requests should be highlighted to users.

Allow filtering by:

Blood Group
Location
Status
Validation Requirements

Implement strict validation on all endpoints.

Validate:

Body
Params
Query

Reject malformed requests consistently.

Phone Validation

Bangladeshi phone numbers only.

Blood Group Validation

Restrict to valid blood groups only.

Location Validation

Restrict to supported Feni subdistrict enums only.

API Design Requirements

Use RESTful naming conventions.

Version all APIs.

Recommended prefix:

/api/v1

Maintain consistent route naming and resource-based structure.

Response Standardization

All API responses must follow a consistent envelope.

Include:

Success boolean
Human-readable message
Data payload
Meta object for pagination when applicable
Error Handling Requirements

Implement centralized global error handler.

Handle:

Validation errors
Mongo duplicate errors
Firebase auth errors
Not found errors
Internal server errors

Never expose raw stack traces in production.

Middleware Requirements

Implement shared middleware for:

Firebase Auth Protection
Request Validation
Global Error Handling
Not Found Handler
Async Error Wrapper
Security Requirements

Implement:

Rate limiting on public-heavy endpoints
Basic security headers
Input sanitization
CORS config
Environment variable validation
Vercel Deployment Constraints

Architecture must remain compatible with serverless deployment.

Must Follow

Use cached MongoDB connection strategy.

Ensure DB connection reuse across invocations.

Must Avoid

Do not implement:

WebSockets
In-memory session stores
Long-running background workers
Native cron jobs inside backend
Stateful socket communication
Suggested Future-Proof Features (Prepare Architecture For)

Design codebase so future additions are easy:

Admin dashboard
Donor blocking/unblocking
Notification system
Push notifications
SMS alerts
Donation cooldown enforcement
Request expiry automation
Hospital account verification
Geo-distance based donor filtering
Analytics dashboard
Engineering Quality Requirements

Claude should generate code with:

Clean Architecture principles where practical
Strong TypeScript typing
No business logic duplication
Proper separation of concerns
Reusable utility functions
Reusable constants/enums
Reusable response helpers
Scalable module boundaries
Naming Conventions

Use professional naming conventions consistently.

Examples of expectations:

Singular model names
Feature-based module names
Service/controller suffixes
Clear DTO/validation naming
Predictable route naming
Development Standards

Enforce:

Strict TypeScript
ESLint
Prettier compatibility
Environment config abstraction
No hardcoded secrets
No magic strings for enums/constants
Final Instruction to Implementer

Build the project as if it is a production-grade backend expected to scale beyond MVP.

Prioritize:

Maintainability
Scalability
Clean architecture
Vercel compatibility
Developer experience for future contributors

Do not overengineer into microservices.

Keep architecture modular and extensible.