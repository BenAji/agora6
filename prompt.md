# Lovable AI Development Prompt: Agora - Outlook Add-in

## Project Overview

Develop **Agora**, a comprehensive event coordination platform for Investor Relations teams and investors. This full-stack web application helps IR teams manage events, track RSVPs, and coordinate with investment analysts using a Bloomberg-style dark theme.

## Core Features

### 1. Authentication & User Management
- **Enhanced Signup**: Role selection (IR Admin, Analyst Manager, Investment Analyst), company assignment, GICS sector subscriptions
- **JWT Authentication** with bcryptjs password hashing
- **Role-based Access Control** with granular permissions
- **GICS Integration**: Investment Analysts can subscribe to multiple GICS sectors using sector codes

### 2. Event Management
- **Full CRUD Operations** for events (IR Admin only)
- **Event Types**: Earnings Call, Investor Meeting, Conference, Roadshow, Analyst Day, Product Launch, Other
- **Advanced Filtering**: Date range, company, sector, event type
- **Event Status Tracking**: Upcoming, ongoing, completed

### 3. Advanced Calendar System (Investor View Only)
- **Company-based Grid**: Y-axis = companies, X-axis = weekdays 
- **Dynamic Sizing**: Automatically adjusts for varying numbers of companies
- **Subscription-Based**: Shows only events for subscribed companies/sectors
- **Auto-Scheduling**: Events appear when subscribing to companies
- **RSVP Integration**: RSVP'd events appear on calendar (even if not subscribed)
- **Color-Coded Events**: Distinct colors for different event types
- **Multi-Event Cells**: Support for multiple events per cell
- **Access Control**: Restricted to Investment Analysts and Analyst Managers

### 4. RSVP Management
- **Status Tracking**: Accepted, Declined, Tentative, Pending
- **Bulk Operations**: For managers, managers inherit all features of analyst
- **Calendar Integration**: RSVP'd events automatically appear on calendar
- **Subscription Override**: RSVP to non-subscribed events adds them to calendar

### 5. Subscription System
- **Company Subscriptions**: Direct company-based calendar inclusion
- **GICS Sector Subscriptions**: Sector-based event notifications
- **Status Management**: Active, Inactive, Expired
- **Calendar Auto-Population**: Subscribed companies/sectors show events automatically

### 6. Dashboard & Analytics
- **Role-based Views**: Different dashboards per user role
- **Real-time Statistics**: Events, RSVPs, users
- **Interactive Charts**: Event attendance, company performance
- **CSV Export**: Event data, user data, RSVP reports

## Technical Stack

### Backend
- **Node.js + Express + TypeScript**
- **Supabase** (PostgreSQL) with real-time features
- **JWT + bcryptjs** for authentication
- **RESTful API** with proper error handling

### Frontend
- **React 19 + TypeScript**
- **TailwindCSS** with custom Bloomberg theme
- **React Context** for state management
- **PapaParse** for CSV handling
- **CRACO** for build configuration

### Database Schema
- **users**: User accounts with roles and company associations
- **user_companies**: Company information
- **gics_companies**: GICS classification data
- **gics_sectors**: GICS sector codes and descriptions
- **events**: Event details with metadata
- **rsvps**: RSVP tracking with status
- **subscriptions**: User notification preferences
- **company_subscriptions**: Direct company subscriptions
- **user_gics_subscriptions**: User GICS sector subscriptions
- **calendar_events**: Cached calendar data

## UI/UX Requirements

### Bloomberg Dark Theme
- **Primary Background**: Dark/Black (#000000 or #1a1a1a)
- **Secondary Background**: Dark Grey (#2d2d2d)
- **Accent Color**: Gold (#FFD700 or #D4AF37)
- **Text**: White (#FFFFFF) and Light Grey (#CCCCCC)
- **Borders**: Dark Grey (#404040)
- **Typography**: Clean, professional fonts for financial data
- **Data Tables**: Bloomberg-style grid layouts

### Key Pages
1. **Login/Signup**: Bloomberg-themed forms with role/company/GICS selection
2. **Dashboard**: Role-based metrics in dark theme
3. **Events**: List view with search/filter
4. **Calendar**: Company-based grid (Investor role only)
5. **Event Details**: Comprehensive info with RSVP
6. **User Management**: Admin interface
7. **Subscriptions**: Company and GICS sector management
8. **Settings**: User profile and preferences

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - Registration with role, company, GICS subscriptions
- `GET /api/auth/me` - Current user info
- `GET /api/auth/companies` - Available companies
- `GET /api/auth/gics-sectors` - GICS sectors for selection

### Events
- `GET /api/events` - Get events with filters
- `POST /api/events` - Create event (IR Admin only)
- `PUT /api/events/:id` - Update event (IR Admin only)
- `DELETE /api/events/:id` - Delete event (IR Admin only)
- `GET /api/events/:id` - Get single event

### Calendar (Investor View Only)
- `GET /api/calendar` - Monthly view (4 weeks, Mon-Fri)
- `GET /api/calendar/week` - Weekly view
- `GET /api/calendar/subscribed` - Subscribed company events
- `GET /api/calendar/rsvp` - RSVP'd events
- `GET /api/calendar/companies` - Companies for Y-axis
- `POST /api/calendar/export` - Export to CSV

### RSVPs
- `POST /api/rsvp` - Create/update RSVP
- `GET /api/rsvp/user/:userID` - User's RSVPs
- `GET /api/rsvp/event/:eventID` - Event RSVPs
- `PUT /api/rsvp/:id` - Update RSVP status

### Subscriptions
- `GET /api/subscriptions` - User subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `POST /api/subscriptions/company` - Subscribe to company
- `DELETE /api/subscriptions/company/:companyId` - Unsubscribe from company
- `POST /api/subscriptions/gics` - Subscribe to GICS sector
- `DELETE /api/subscriptions/gics/:sectorCode` - Unsubscribe from GICS sector
- `GET /api/subscriptions/gics` - User's GICS subscriptions

### Health
- `GET /api/health` - API health check
- `GET /api/test-db` - Database connection test

## Security & Performance

### Security
- Input validation on all endpoints
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting on auth endpoints
- Secure headers
- Environment variable management

### Performance
- Page load times < 3 seconds
- Optimized database queries with indexing
- Lazy loading for large datasets
- Caching strategies
- Bundle size optimization

## Development Guidelines

1. **Code Quality**: TypeScript, ESLint, JSDoc comments
2. **Error Handling**: Comprehensive with user-friendly messages
3. **Testing**: Unit tests, integration tests, component tests
4. **Accessibility**: WCAG guidelines with high contrast
5. **Responsive Design**: Test on multiple screen sizes
6. **Logging**: Structured logging for debugging

## Success Criteria

The application is complete when:
- ✅ Enhanced signup process (role, company, GICS subscriptions)
- ✅ Bloomberg dark theme consistently applied
- ✅ Subscription-based calendar population
- ✅ RSVP integration with calendar
- ✅ Role-based access control
- ✅ All API endpoints tested and working
- ✅ Database schema properly implemented
- ✅ Security measures in place
- ✅ Performance meets requirements

## File Structure

```
agora-outlook-addin/
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Authentication middleware
│   │   ├── lib/             # Supabase client
│   │   └── index.ts         # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React context providers
│   │   ├── lib/           # Supabase client
│   │   └── utils/         # Utility functions
│   ├── supabase-schema.sql # Database schema
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Future Enhancements

- Real-time notifications via Supabase
- Email integration for reminders
- Calendar sync with external calendars
- Document upload for event materials
- Advanced reporting with data visualization
- Mobile app (React Native)
- Outlook Add-in integration
- Calendar sharing between team members
- Event conflict detection
- Calendar print/PDF export

This optimized prompt provides clear, actionable guidance for developing a professional-grade event coordination platform with modern web technologies and Bloomberg terminal aesthetics. 