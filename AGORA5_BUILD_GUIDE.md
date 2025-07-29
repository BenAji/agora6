# 🚀 Agora5 - Professional Calendar & Event Management System
## Complete Build Guide with Development Sequence & Test Cases

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Development Sequence](#development-sequence)
4. [Database Setup](#database-setup)
5. [Authentication System](#authentication-system)
6. [Core Features](#core-features)
7. [UI Components](#ui-components)
8. [Testing Strategy](#testing-strategy)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Agora5** is a comprehensive React TypeScript application designed for investment analysts to manage corporate events, track company performance, and analyze market trends. The system features advanced calendar functionality with heat map visualization, real-time event tracking, and professional analytics insights.

### Key Features
- 📅 Interactive calendar with heat map visualization
- 🏢 GICS sector-based company management
- 📊 Real-time event analytics and insights
- 🔔 Smart notification system
- 👥 RSVP management
- 📈 Price performance tracking
- 🌤️ Weather integration for events
- 🎨 Professional dark theme UI

---

## 🛠️ Technical Stack

### Core Technologies
- **React 18** with TypeScript
- **Vite** for build tooling and development
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Supabase** for backend (database + auth)
- **Lucide React** for icons
- **date-fns** for date manipulation

### Development Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.294.0",
    "date-fns": "^2.30.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

---

## 🔄 Development Sequence

### Phase 1: Project Setup & Configuration
1. **Initialize Project**
   ```bash
   npm create vite@latest agora5 -- --template react-ts
   cd agora5
   npm install
   ```

2. **Install Dependencies**
   ```bash
   npm install @supabase/supabase-js lucide-react date-fns
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-toast
   npm install class-variance-authority clsx tailwind-merge
   npm install react-hook-form @hookform/resolvers zod
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Configure Tailwind CSS**
   ```javascript
   // tailwind.config.ts
   import type { Config } from "tailwindcss";

   export default {
     darkMode: ["class"],
     content: [
       './pages/**/*.{ts,tsx}',
       './components/**/*.{ts,tsx}',
       './app/**/*.{ts,tsx}',
       './src/**/*.{ts,tsx}',
     ],
     theme: {
       extend: {
         colors: {
           gold: "#FFD700",
           "surface-primary": "#0A0A0A",
           "surface-secondary": "#1A1A1A",
           "text-primary": "#FFFFFF",
           "text-secondary": "#A0A0A0",
           "text-muted": "#666666",
           "border-default": "#333333",
           "chart-primary": "#FFD700",
           "chart-secondary": "#FF6B6B",
           "chart-tertiary": "#4ECDC4",
           "chart-quaternary": "#45B7D1",
           success: "#10B981",
           error: "#EF4444",
           warning: "#F59E0B",
         },
         keyframes: {
           "accordion-down": {
             from: { height: "0" },
             to: { height: "var(--radix-accordion-content-height)" },
           },
           "accordion-up": {
             from: { height: "var(--radix-accordion-content-height)" },
             to: { height: "0" },
           },
         },
         animation: {
           "accordion-down": "accordion-down 0.2s ease-out",
           "accordion-up": "accordion-up 0.2s ease-out",
         },
       },
     },
     plugins: [require("tailwindcss-animate")],
   } satisfies Config
   ```

### Phase 2: Supabase Setup
1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Note down URL and anon key

2. **Environment Variables**
   ```env
   # .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Database Schema Setup**
   ```sql
   -- Execute in Supabase SQL Editor
   
   -- 1. Create profiles table
   CREATE TABLE profiles (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     email TEXT,
     full_name TEXT,
     role TEXT DEFAULT 'ANALYST',
     company TEXT,
     location TEXT,
     bio TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 2. Create gics_companies table
   CREATE TABLE gics_companies (
     companyID TEXT PRIMARY KEY,
     companyName TEXT NOT NULL,
     tickerSymbol TEXT,
     gicsSector TEXT,
     gicsSubCategory TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 3. Create events table
   CREATE TABLE events (
     eventID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     eventName TEXT NOT NULL,
     eventType TEXT NOT NULL,
     hostCompany TEXT NOT NULL,
     startDate TIMESTAMP WITH TIME ZONE NOT NULL,
     endDate TIMESTAMP WITH TIME ZONE,
     location TEXT,
     description TEXT,
     companyID TEXT REFERENCES gics_companies(companyID),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 4. Create subscriptions table
   CREATE TABLE subscriptions (
     subID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     userID UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     status TEXT DEFAULT 'ACTIVE',
     gicsSector TEXT,
     gicsSubCategory TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- 5. Create rsvps table
   CREATE TABLE rsvps (
     rsvpID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     eventID UUID REFERENCES events(eventID) ON DELETE CASCADE,
     userID UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     status TEXT DEFAULT 'PENDING',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(eventID, userID)
   );

   -- 6. Create user_companies table
   CREATE TABLE user_companies (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     userID UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     companyName TEXT NOT NULL,
     location TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

4. **Row Level Security (RLS) Policies**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_companies ENABLE ROW LEVEL SECURITY;

   -- Profiles policies
   CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Subscriptions policies
   CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = userID);
   CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = userID);
   CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = userID);

   -- RSVPs policies
   CREATE POLICY "Users can view own RSVPs" ON rsvps FOR SELECT USING (auth.uid() = userID);
   CREATE POLICY "Users can insert own RSVPs" ON rsvps FOR INSERT WITH CHECK (auth.uid() = userID);
   CREATE POLICY "Users can update own RSVPs" ON rsvps FOR UPDATE USING (auth.uid() = userID);

   -- User companies policies
   CREATE POLICY "Users can view own companies" ON user_companies FOR SELECT USING (auth.uid() = userID);
   CREATE POLICY "Users can insert own companies" ON user_companies FOR INSERT WITH CHECK (auth.uid() = userID);
   CREATE POLICY "Users can update own companies" ON user_companies FOR UPDATE USING (auth.uid() = userID);
   CREATE POLICY "Users can delete own companies" ON user_companies FOR DELETE USING (auth.uid() = userID);
   ```

### Phase 3: Core Infrastructure
1. **Supabase Client Setup**
   ```typescript
   // src/integrations/supabase/client.ts
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

2. **TypeScript Types**
   ```typescript
   // src/integrations/supabase/types.ts
   export interface Profile {
     id: string
     user_id: string
     email: string
     full_name: string
     role: string
     company: string
     location: string
     bio: string
     avatar_url: string
     created_at: string
     updated_at: string
   }

   export interface Event {
     eventID: string
     eventName: string
     eventType: string
     hostCompany: string
     startDate: string
     endDate?: string
     location: string
     description?: string
     companyID: string
   }

   export interface Company {
     companyID: string
     companyName: string
     tickerSymbol: string
     gicsSector: string
     gicsSubCategory: string
   }

   export interface Subscription {
     subID: string
     userID: string
     status: string
     gicsSector?: string
     gicsSubCategory?: string
   }

   export interface RSVP {
     rsvpID: string
     eventID: string
     userID: string
     status: string
     created_at: string
     updated_at: string
   }

   export interface UserCompany {
     id: string
     userID: string
     companyName: string
     location: string
     created_at: string
   }
   ```

### Phase 4: Authentication System
1. **Auth Hook Implementation**
   ```typescript
   // src/hooks/useAuth.tsx
   import { useState, useEffect } from 'react'
   import { supabase } from '@/integrations/supabase/client'
   import { User } from '@supabase/supabase-js'
   import { Profile } from '@/integrations/supabase/types'

   export const useAuth = () => {
     const [user, setUser] = useState<User | null>(null)
     const [profile, setProfile] = useState<Profile | null>(null)
     const [loading, setLoading] = useState(true)

     useEffect(() => {
       // Get initial session
       supabase.auth.getSession().then(({ data: { session } }) => {
         setUser(session?.user ?? null)
         if (session?.user) {
           fetchProfile(session.user.id)
         } else {
           setLoading(false)
         }
       })

       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         async (event, session) => {
           setUser(session?.user ?? null)
           if (session?.user) {
             await fetchProfile(session.user.id)
           } else {
             setProfile(null)
           }
           setLoading(false)
         }
       )

       return () => subscription.unsubscribe()
     }, [])

     const fetchProfile = async (userId: string) => {
       try {
         const { data, error } = await supabase
           .from('profiles')
           .select('*')
           .eq('user_id', userId)
           .single()

         if (error) throw error
         setProfile(data)
       } catch (error) {
         console.error('Error fetching profile:', error)
       }
     }

     const signUp = async (email: string, password: string, fullName: string) => {
       try {
         const { data, error } = await supabase.auth.signUp({
           email,
           password,
           options: {
             data: {
               full_name: fullName,
             },
           },
         })

         if (error) throw error

         if (data.user) {
           // Create profile
           const { error: profileError } = await supabase
             .from('profiles')
             .insert([
               {
                 user_id: data.user.id,
                 email: data.user.email,
                 full_name: fullName,
               },
             ])

           if (profileError) throw profileError
         }

         return { data, error: null }
       } catch (error) {
         return { data: null, error }
       }
     }

     const signIn = async (email: string, password: string) => {
       try {
         const { data, error } = await supabase.auth.signInWithPassword({
           email,
           password,
         })

         return { data, error }
       } catch (error) {
         return { data: null, error }
       }
     }

     const signOut = async () => {
       try {
         const { error } = await supabase.auth.signOut()
         return { error }
       } catch (error) {
         return { error }
       }
     }

     return {
       user,
       profile,
       loading,
       signUp,
       signIn,
       signOut,
     }
   }
   ```

### Phase 5: Core Features Implementation
1. **Subscription Management**
2. **Calendar System**
3. **Event Management**
4. **RSVP System**
5. **Analytics Dashboard**

### Phase 6: UI Components
1. **Layout Components**
2. **Form Components**
3. **Calendar Components**
4. **Event Components**
5. **Analytics Components**

### Phase 7: Integration & Testing
1. **Component Integration**
2. **End-to-End Testing**
3. **Performance Optimization**
4. **Error Handling**

### Phase 8: Deployment
1. **Production Build**
2. **Environment Configuration**
3. **Deployment Setup**

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Example test for subscription utils
import { isSubscribedToCompany, subscribeToSectorOrCompany } from '../utils/subscriptionUtils'

describe('Subscription Utils', () => {
  test('should correctly identify company subscription', () => {
    const subscriptions = [
      { subID: '1', userID: 'user1', status: 'ACTIVE', gicsSubCategory: 'COMPANY:AAPL' }
    ]
    const company = { tickerSymbol: 'AAPL', gicsSector: 'Technology' }
    
    expect(isSubscribedToCompany(subscriptions, company)).toBe(true)
  })

  test('should handle sector-level subscriptions', () => {
    const subscriptions = [
      { subID: '1', userID: 'user1', status: 'ACTIVE', gicsSector: 'Technology' }
    ]
    const company = { tickerSymbol: 'AAPL', gicsSector: 'Technology' }
    
    expect(isSubscribedToCompany(subscriptions, company)).toBe(true)
  })
})
```

### Integration Tests
```typescript
// Example test for calendar integration
describe('Calendar Integration', () => {
  test('should display events for selected date', async () => {
    // Mock event data
    const mockEvents = [
      {
        eventID: '1',
        eventName: 'Test Event',
        startDate: '2024-01-15T10:00:00Z',
        hostCompany: 'Test Company'
      }
    ]

    // Render calendar component
    // Simulate date selection
    // Verify event display
  })
})
```

### End-to-End Tests
```typescript
// Example E2E test for user workflow
describe('User Workflow', () => {
  test('should complete full event subscription workflow', async () => {
    // 1. User signs in
    // 2. User navigates to companies page
    // 3. User subscribes to a company
    // 4. User checks settings page
    // 5. Verify subscription appears in settings
  })
})
```

---

## 🚀 Deployment Instructions

### For Replit
1. Create new Replit project
2. Copy all files to the project
3. Set environment variables in Secrets
4. Run `npm install` and `npm run dev`

### For Cursor
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Run `npm run dev`

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🔧 Troubleshooting

### Common Issues
1. **Supabase Connection Errors**
   - Verify environment variables
   - Check network connectivity
   - Validate Supabase project settings

2. **Authentication Issues**
   - Ensure RLS policies are correctly configured
   - Verify user permissions
   - Check auth state management

3. **Calendar Display Issues**
   - Verify date formatting
   - Check event data structure
   - Validate calendar component props

4. **Subscription Management Issues**
   - Check encoding strategy implementation
   - Verify database schema
   - Validate subscription logic

---

## 📋 Final Checklist

- [ ] Supabase project created with all tables
- [ ] Authentication system implemented
- [ ] Calendar with heat map working
- [ ] Right-side event popup functional
- [ ] Analyst insights displaying correctly
- [ ] RSVP system operational
- [ ] Subscription management working
- [ ] Weather forecast integration
- [ ] Mini calendar navigation
- [ ] All UI components styled correctly
- [ ] Responsive design tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Toast notifications working
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance optimized
- [ ] Production build successful
- [ ] Deployment completed

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)

---

**🎉 Congratulations! You've successfully built the Agora5 application!** 