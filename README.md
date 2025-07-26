# AGORA - Investment Events Platform

A comprehensive investment events management platform built for investment analysts, IR managers, and financial professionals to track, manage, and participate in investment events.

## 🚀 Features

### 📊 **Dashboard & Analytics**
- Real-time event statistics and metrics
- Investment performance tracking
- User activity monitoring
- Customizable dashboard for different user roles

### 📅 **Event Management**
- **Calendar View**: Interactive calendar with week/month views
- **Event Creation**: IR Admins can create and manage events
- **RSVP System**: Accept, decline, or mark events as tentative
- **Event Categories**: Conference, Product Launch, Earnings Call, etc.
- **Location Tracking**: Virtual and physical event locations

### 🏢 **Company Management**
- **GICS Integration**: Global Industry Classification Standard support
- **Sector/Subsector Subscriptions**: Subscribe to entire sectors or specific companies
- **Company Profiles**: Detailed company information and ticker symbols
- **Search & Filter**: Advanced filtering by sector, subscription status, and more

### 👥 **User Management**
- **Role-Based Access**: IR Admin, Analyst Manager, Investment Analyst
- **User Invitations**: Invite new team members
- **Profile Management**: Update user information and preferences
- **Company Assignment**: Assign users to specific companies

### 🎨 **Customization & Preferences**
- **Theme Options**: Bloomberg Terminal, Classic, Modern themes
- **Color Schemes**: Dark, Light, and Auto modes
- **Event View Preferences**: List, Compact Table, or Card views
- **Calendar Preferences**: Default views and sorting options
- **Notification Settings**: Email, reminders, and RSVP updates

### 🔔 **Notifications**
- **Email Notifications**: Event reminders and updates
- **RSVP Status**: Real-time RSVP status changes
- **Event Reminders**: Configurable reminder intervals
- **Bulk Actions**: Mass RSVP operations for multiple events

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **Lucide React** for icons

### **Backend & Database**
- **Supabase** for backend services
- **PostgreSQL** database
- **Real-time subscriptions**
- **Row Level Security (RLS)**

### **Additional Libraries**
- **date-fns** for date manipulation
- **React Hook Form** for form handling
- **Zod** for schema validation
- **Recharts** for data visualization
- **Sonner** for toast notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agora5
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   - Set up your Supabase project
   - Run the migration files in `supabase/migrations/`
   - Configure Row Level Security policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profile information
- **events**: Investment events data
- **companies**: Company information and GICS classification
- **rsvps**: Event RSVP status
- **subscriptions**: User sector/company subscriptions
- **user_companies**: User-company relationships

### Key Relationships
- Users can subscribe to GICS sectors/subsectors
- Events are linked to hosting companies
- RSVPs connect users to events
- Profiles contain user role and company assignments

## 👤 User Roles

### **IR Admin**
- Full system access
- Create and manage events
- Invite and manage users
- Access to dashboard analytics
- Company and sector management

### **Analyst Manager**
- View and manage events
- Bulk RSVP operations
- Team management capabilities
- Access to company data

### **Investment Analyst**
- View subscribed events
- Individual RSVP management
- Company and sector browsing
- Personal preferences management

## 🎯 Key Features

### **Investment-Focused Design**
- Bloomberg Terminal-inspired theme
- Professional financial interface
- Ticker symbol integration
- GICS sector classification

### **Event Intelligence**
- Smart event filtering
- RSVP status tracking
- Event timing indicators
- Company relationship mapping

### **User Experience**
- Responsive design
- Keyboard shortcuts
- Real-time updates
- Intuitive navigation

## 🔧 Configuration

### **Appearance Settings**
- Theme selection (Bloomberg, Classic, Modern)
- Color scheme (Dark, Light, Auto)
- Font size and data density
- Accent color customization

### **Calendar Preferences**
- Default view (Week/Month)
- Event category display
- Default event filter
- Sorting preferences

### **Event View Options**
- Display mode (List/Table/Cards)
- Compact information mode
- Status badge display
- Auto-refresh settings

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Preview Build**
```bash
npm run preview
```

### **Environment Variables**
Ensure all required environment variables are set in your production environment.

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software developed by AjayiWilliams.

## 🤝 Support

For support and questions, please contact the development team at AjayiWilliams.

---

**Built with ❤️ by AjayiWilliams**
