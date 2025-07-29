# 🧩 Agora5 Component Implementation Guide
## Detailed Component Code & Test Cases

---

## 📋 Table of Contents
1. [Core Hooks](#core-hooks)
2. [Authentication Components](#authentication-components)
3. [Calendar System](#calendar-system)
4. [Event Management](#event-management)
5. [Subscription System](#subscription-system)
6. [Analytics Components](#analytics-components)
7. [Test Cases](#test-cases)

---

## 🔧 Core Hooks

### useAuth Hook
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

### useSubscriptions Hook
```typescript
// src/hooks/useSubscriptions.tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Company, Subscription } from '@/integrations/supabase/types'
import { subscribeToSectorOrCompany, unsubscribeFromSectorOrCompany } from '@/utils/subscriptionUtils'

export const useSubscriptions = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompaniesAndSubscriptions()
  }, [])

  const fetchCompaniesAndSubscriptions = async () => {
    try {
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('gics_companies')
        .select('*')
        .order('companyName')

      if (companiesError) throw companiesError

      // Fetch user subscriptions
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('userID', user.id)
        .eq('status', 'ACTIVE')

      if (subscriptionsError) throw subscriptionsError

      setCompanies(companiesData || [])
      setSubscriptions(subscriptionsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (company: Company) => {
    try {
      const { data, error } = await subscribeToSectorOrCompany(
        company.gicsSector,
        company.gicsSubCategory,
        company.tickerSymbol
      )

      if (error) throw error

      // Update local state
      await fetchCompaniesAndSubscriptions()
    } catch (error) {
      console.error('Error subscribing:', error)
      throw error
    }
  }

  const handleUnsubscribe = async (company: Company) => {
    try {
      const { error } = await unsubscribeFromSectorOrCompany(
        company.gicsSector,
        company.gicsSubCategory,
        company.tickerSymbol
      )

      if (error) throw error

      // Update local state
      await fetchCompaniesAndSubscriptions()
    } catch (error) {
      console.error('Error unsubscribing:', error)
      throw error
    }
  }

  return {
    companies,
    subscriptions,
    loading,
    handleSubscribe,
    handleUnsubscribe,
    refetch: fetchCompaniesAndSubscriptions,
  }
}
```

---

## 🔐 Authentication Components

### AuthForm Component
```typescript
// src/components/AuthForm.tsx
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password, fullName)
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: isSignUp ? "Account created successfully!" : "Signed in successfully!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
      <Card className="w-full max-w-md bg-zinc-900/50 border-zinc-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gold text-center">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            {isSignUp ? 'Enter your details to create your account' : 'Enter your credentials to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gold text-black hover:bg-gold/90"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-zinc-400 hover:text-gold"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📅 Calendar System

### Calendar Component
```typescript
// src/pages/Calendar.tsx
import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Event, Company } from '@/integrations/supabase/types'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const { profile } = useAuth()

  useEffect(() => {
    fetchEvents()
    fetchCompanies()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('startDate', format(startOfMonth(currentMonth), 'yyyy-MM-dd'))
        .lte('startDate', format(endOfMonth(currentMonth), 'yyyy-MM-dd'))

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('gics_companies')
        .select('*')

      if (error) throw error
      setCompanies(data || [])
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.startDate), day))
  }

  const getEventTypeColor = (eventType: string) => {
    const colors = {
      'EARNINGS_CALL': 'bg-success/20 text-success border-success/30',
      'INVESTOR_MEETING': 'bg-primary/20 text-primary border-primary/30',
      'CONFERENCE': 'bg-chart-secondary/20 text-chart-secondary border-chart-secondary/30',
      'ROADSHOW': 'bg-chart-tertiary/20 text-chart-tertiary border-chart-tertiary/30',
      'ANALYST_DAY': 'bg-chart-quaternary/20 text-chart-quaternary border-chart-quaternary/30',
      'PRODUCT_LAUNCH': 'bg-gold/20 text-gold border-gold/30',
      'OTHER': 'bg-text-muted/20 text-text-muted border-text-muted/30',
    }
    return colors[eventType as keyof typeof colors] || colors.OTHER
  }

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setEventDetailsOpen(true)
  }

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="text-gold hover:bg-zinc-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gold">
            {format(currentMonth, 'MMMM yyyy')}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="text-gold hover:bg-zinc-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-zinc-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(day => {
          const dayEvents = getEventsForDay(day)
          const isToday = isSameDay(day, new Date())
          const isSelected = selectedDate && isSameDay(day, selectedDate)

          return (
            <div
              key={day.toString()}
              className={`
                min-h-[120px] p-2 border border-zinc-800 bg-zinc-900/50
                ${isToday ? 'bg-gold/10 border-gold/50' : ''}
                ${isSelected ? 'bg-zinc-800 border-zinc-600' : ''}
                hover:bg-zinc-800/50 cursor-pointer transition-colors
              `}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-sm font-medium mb-2">
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.eventID}
                    className={`
                      text-xs p-1 rounded border cursor-pointer
                      ${getEventTypeColor(event.eventType)}
                    `}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEventClick(event)
                    }}
                  >
                    {event.eventName}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-zinc-400">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Event Details Popup */}
      {eventDetailsOpen && selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent}
          onClose={() => setEventDetailsOpen(false)}
          companies={companies}
        />
      )}
    </div>
  )
}
```

---

## 🧪 Test Cases

### Unit Tests for Subscription Utils
```typescript
// src/utils/__tests__/subscriptionUtils.test.ts
import { isSubscribedToCompany, subscribeToSectorOrCompany } from '../subscriptionUtils'

describe('Subscription Utils', () => {
  describe('isSubscribedToCompany', () => {
    test('should return true for individual company subscription', () => {
      const subscriptions = [
        { subID: '1', userID: 'user1', status: 'ACTIVE', gicsSubCategory: 'COMPANY:AAPL' }
      ]
      const company = { tickerSymbol: 'AAPL', gicsSector: 'Technology' }
      
      expect(isSubscribedToCompany(subscriptions, company)).toBe(true)
    })

    test('should return true for sector-level subscription', () => {
      const subscriptions = [
        { subID: '1', userID: 'user1', status: 'ACTIVE', gicsSector: 'Technology' }
      ]
      const company = { tickerSymbol: 'AAPL', gicsSector: 'Technology' }
      
      expect(isSubscribedToCompany(subscriptions, company)).toBe(true)
    })

    test('should return false for non-subscribed company', () => {
      const subscriptions = [
        { subID: '1', userID: 'user1', status: 'ACTIVE', gicsSector: 'Technology' }
      ]
      const company = { tickerSymbol: 'MSFT', gicsSector: 'Technology' }
      
      expect(isSubscribedToCompany(subscriptions, company)).toBe(false)
    })

    test('should handle inactive subscriptions', () => {
      const subscriptions = [
        { subID: '1', userID: 'user1', status: 'INACTIVE', gicsSubCategory: 'COMPANY:AAPL' }
      ]
      const company = { tickerSymbol: 'AAPL', gicsSector: 'Technology' }
      
      expect(isSubscribedToCompany(subscriptions, company)).toBe(false)
    })
  })

  describe('subscribeToSectorOrCompany', () => {
    test('should create individual company subscription', async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ data: null, error: null })
      }

      const result = await subscribeToSectorOrCompany(
        'user1',
        'Technology',
        undefined,
        'AAPL'
      )

      expect(result.error).toBeNull()
    })
  })
})
```

### Integration Tests for Calendar
```typescript
// src/pages/__tests__/Calendar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Calendar } from '../Calendar'
import { useAuth } from '@/hooks/useAuth'

// Mock the auth hook
jest.mock('@/hooks/useAuth')
jest.mock('@/integrations/supabase/client')

describe('Calendar Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      profile: { id: 'user1', user_id: 'auth1' },
      loading: false
    })
  })

  test('should display current month', () => {
    render(<Calendar />)
    
    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    expect(screen.getByText(currentMonth)).toBeInTheDocument()
  })

  test('should navigate between months', async () => {
    render(<Calendar />)
    
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthText = nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      expect(screen.getByText(nextMonthText)).toBeInTheDocument()
    })
  })

  test('should display events on calendar', async () => {
    const mockEvents = [
      {
        eventID: '1',
        eventName: 'Test Event',
        startDate: new Date().toISOString(),
        eventType: 'EARNINGS_CALL',
        hostCompany: 'Test Company'
      }
    ]

    // Mock Supabase response
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockEvents, error: null })
    }

    render(<Calendar />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests for User Workflow
```typescript
// cypress/e2e/user-workflow.cy.ts
describe('User Workflow', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should complete full authentication workflow', () => {
    // Sign up
    cy.get('[data-testid="signup-button"]').click()
    cy.get('[data-testid="full-name-input"]').type('Test User')
    cy.get('[data-testid="email-input"]').type('test@example.com')
    cy.get('[data-testid="password-input"]').type('password123')
    cy.get('[data-testid="submit-button"]').click()
    
    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-profile"]').should('contain', 'Test User')
  })

  it('should subscribe to companies and verify in settings', () => {
    // Login
    cy.login('test@example.com', 'password123')
    
    // Navigate to companies
    cy.visit('/companies')
    
    // Subscribe to a company
    cy.get('[data-testid="company-card"]').first().within(() => {
      cy.get('[data-testid="subscribe-button"]').click()
    })
    
    // Navigate to settings
    cy.visit('/settings')
    
    // Verify subscription appears
    cy.get('[data-testid="gics-subscriptions"]').should('contain', 'AAPL')
  })

  it('should create RSVP and verify in events', () => {
    // Login
    cy.login('test@example.com', 'password123')
    
    // Navigate to events
    cy.visit('/events')
    
    // RSVP to an event
    cy.get('[data-testid="event-card"]').first().within(() => {
      cy.get('[data-testid="rsvp-button"]').click()
    })
    
    // Verify RSVP status
    cy.get('[data-testid="rsvp-status"]').should('contain', 'Confirmed')
  })

  it('should display calendar with events and handle interactions', () => {
    // Login
    cy.login('test@example.com', 'password123')
    
    // Navigate to calendar
    cy.visit('/calendar')
    
    // Click on a day with events
    cy.get('[data-testid="calendar-day"]').contains('15').click()
    
    // Verify event popup appears
    cy.get('[data-testid="event-popup"]').should('be.visible')
    
    // Verify event details
    cy.get('[data-testid="event-name"]').should('contain', 'Test Event')
  })
})
```

---

## 📊 Performance Tests

### Load Testing
```typescript
// src/utils/__tests__/performance.test.ts
import { render } from '@testing-library/react'
import { Calendar } from '@/pages/Calendar'

describe('Performance Tests', () => {
  test('should render calendar with 1000 events under 2 seconds', () => {
    const startTime = performance.now()
    
    render(<Calendar />)
    
    const endTime = performance.now()
    const renderTime = endTime - startTime
    
    expect(renderTime).toBeLessThan(2000)
  })

  test('should handle subscription updates efficiently', async () => {
    const { handleSubscribe } = useSubscriptions()
    
    const startTime = performance.now()
    
    await handleSubscribe(mockCompany)
    
    const endTime = performance.now()
    const updateTime = endTime - startTime
    
    expect(updateTime).toBeLessThan(500)
  })
})
```

---

## 🔍 Accessibility Tests

```typescript
// src/components/__tests__/accessibility.test.tsx
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Calendar } from '@/pages/Calendar'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  test('calendar should meet WCAG 2.1 AA standards', async () => {
    const { container } = render(<Calendar />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  test('auth form should be keyboard navigable', async () => {
    const { container } = render(<AuthForm />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
```

---

## 📋 Test Coverage Checklist

- [ ] Unit tests for all utility functions
- [ ] Integration tests for component interactions
- [ ] E2E tests for user workflows
- [ ] Performance tests for critical paths
- [ ] Accessibility tests for WCAG compliance
- [ ] Error handling tests
- [ ] Loading state tests
- [ ] Form validation tests
- [ ] API integration tests
- [ ] Database operation tests

---

**🎯 This comprehensive testing strategy ensures the Agora5 application is robust, performant, and accessible!** 