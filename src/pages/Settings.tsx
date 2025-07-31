import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Users, Building, Globe, ChevronDown, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import NotificationPreferences from '@/components/NotificationPreferences';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InviteUserDialog from '@/components/InviteUserDialog';

interface Company {
  companyID: string;
  companyName: string;
  location?: string; // Added location field
}

interface GicsCompany {
  tickerSymbol: string;
  companyName: string;
  gicsSector: string;
  gicsSubCategory: string;
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

// Add a list of common locations for autocomplete
const COMMON_LOCATIONS = [
  'New York, USA',
  'London, UK',
  'San Francisco, USA',
  'Toronto, Canada',
  'Paris, France',
  'Frankfurt, Germany',
  'Singapore',
  'Hong Kong',
  'Tokyo, Japan',
  'Sydney, Australia',
  'Dubai, UAE',
  'Shanghai, China',
  'Mumbai, India',
  'Johannesburg, South Africa',
];

const Settings: React.FC = () => {
    const { user, profile: userProfile, signOut } = useAuth();
  const { toast } = useToast();

  // Profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [updateProfileLoading, setUpdateProfileLoading] = useState(false);
  
  // Company state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [addCompanyOpen, setAddCompanyOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [addCompanyLoading, setAddCompanyLoading] = useState(false);
  const [addCompanyError, setAddCompanyError] = useState('');
  const [addCompanySuccess, setAddCompanySuccess] = useState('');
  
  // GICS state
  const [gicsCompanies, setGicsCompanies] = useState<GicsCompany[]>([]);
  const [selectedGics, setSelectedGics] = useState<Set<string>>(new Set());
  const [gicsLoading, setGicsLoading] = useState(false);
  const [updateGicsLoading, setUpdateGicsLoading] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    role: ''
  });

  // Add state for location input
  const [companyLocation, setCompanyLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);

  // Add state for GICS section collapse
  const [gicsSectionOpen, setGicsSectionOpen] = useState(false);

  // Add state for all section collapses
  const [profileSectionOpen, setProfileSectionOpen] = useState(false);
  const [companySectionOpen, setCompanySectionOpen] = useState(false);
  const [preferencesSectionOpen, setPreferencesSectionOpen] = useState(false);
  const [notificationSectionOpen, setNotificationSectionOpen] = useState(false);
  const [calendarSectionOpen, setCalendarSectionOpen] = useState(false);
  const [eventViewSectionOpen, setEventViewSectionOpen] = useState(false);
  const [appearanceSectionOpen, setAppearanceSectionOpen] = useState(false);
  const [securitySectionOpen, setSecuritySectionOpen] = useState(false);
  const [userManagementSectionOpen, setUserManagementSectionOpen] = useState(false);
  const [dangerZoneSectionOpen, setDangerZoneSectionOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'bloomberg', // 'bloomberg', 'classic', 'modern'
    terminalMode: true,
    compactView: false,
    dataDensity: 'normal', // 'compact', 'normal', 'spacious'
    colorScheme: 'dark', // 'dark', 'light', 'auto'
    fontSize: 'medium', // 'small', 'medium', 'large'
    showGridLines: true,
    showAnimations: true,
    accentColor: 'gold', // 'gold', 'blue', 'green', 'purple'
    sidebarCollapsed: false,
    showTooltips: true,
    autoRefresh: true,
    refreshInterval: 30, // seconds
  });

  // Calendar preferences state
  const [calendarPreferences, setCalendarPreferences] = useState({
    defaultView: 'week', // 'week', 'month'
    showEventCategory: false, // show/hide event legend
    defaultEventFilter: 'all', // 'all', 'rsvp'
    defaultSort: 'events', // 'events', 'alpha'
  });

  // Event view preferences state
  const [eventViewPreferences, setEventViewPreferences] = useState({
    displayMode: 'list', // 'list', 'compact', 'cards'
    compactMode: false, // use smaller text and spacing
    showStatusBadges: true, // show timing and RSVP badges
    autoRefresh: false, // auto-refresh every 5 minutes
  });

  // Notification preferences are now handled by the NotificationPreferences component

  // When a company is selected, set the location if available
  useEffect(() => {
    const selected = companies.find(c => c.companyID === selectedCompanyId);
    if (selected && selected.location) {
      setCompanyLocation(selected.location);
    } else {
      setCompanyLocation('');
    }
  }, [selectedCompanyId, companies]);

  // Fetch profile data
  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchCompanies();
      fetchGicsCompanies();
    }
  }, [user]);

  // Fetch user subscriptions after profile and GICS companies are loaded
  useEffect(() => {
    if (profile && gicsCompanies.length > 0) {
      fetchUserSubscriptions();
    }
  }, [profile, gicsCompanies]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setProfileForm({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          role: data.role || ''
        });
        setSelectedCompanyId(data.company_id || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .select('companyID, companyName, location')
        .order('companyName');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive",
      });
    } finally {
      setCompaniesLoading(false);
    }
  };

  const fetchGicsCompanies = async () => {
    setGicsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gics_companies')
        .select('tickerSymbol, companyName, gicsSector, gicsSubCategory')
        .order('companyName');

      if (error) throw error;
      

      
      setGicsCompanies(data || []);
    } catch (error) {
      console.error('Error fetching GICS companies:', error);
      toast({
        title: "Error",
        description: "Failed to load GICS data",
        variant: "destructive",
      });
    } finally {
      setGicsLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!profile) return;
    

    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('gicsSector, gicsSubCategory, userID')
        .eq('userID', profile.user_id)
        .eq('status', 'ACTIVE');

      if (error) throw error;
      

      
      // Create a Set of ticker symbols for companies that the user is subscribed to
      const subscribedTickers = new Set<string>();
      
      if (data) {
        // For each subscription, find the corresponding companies and add their ticker symbols
        for (const subscription of data) {
          if (subscription.gicsSubCategory?.startsWith('COMPANY:')) {
            // Individual company subscription
            const tickerSymbol = subscription.gicsSubCategory.replace('COMPANY:', '');
            subscribedTickers.add(tickerSymbol);
          } else {
            // Sector/subsector subscription
            const matchingCompanies = gicsCompanies.filter(company => {
              // Sector-level subscription (covers all companies in the sector)
              if (subscription.gicsSector === company.gicsSector && !subscription.gicsSubCategory) {
                return true;
              }
              // Subsector-level subscription (covers all companies in the subsector)
              if (subscription.gicsSector === company.gicsSector && 
                  subscription.gicsSubCategory === company.gicsSubCategory) {
                return true;
              }
              return false;
            });
            
            matchingCompanies.forEach(company => {
              subscribedTickers.add(company.tickerSymbol);
            });
          }
        }
      }
      

      setSelectedGics(subscribedTickers);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.trim()) return;
    
    setAddCompanyLoading(true);
    setAddCompanyError('');
    setAddCompanySuccess('');
    
    try {
      const { data, error } = await supabase
        .from('user_companies')
        .insert([{ companyName: newCompany.trim(), location: companyLocation }])
        .select()
        .single();

      if (error) throw error;

      setCompanies(prev => [...prev, data]);
      setNewCompany('');
      setCompanyLocation(''); // Clear location after adding
      setLocationSuggestions([]);
      setAddCompanyOpen(false);
      setAddCompanySuccess('Company added successfully!');
      
      toast({
        title: "Success",
        description: "Company added successfully",
      });
    } catch (error: any) {
      console.error('Error adding company:', error);
      setAddCompanyError(error.message || 'Failed to add company');
      toast({
        title: "Error",
        description: "Failed to add company",
        variant: "destructive",
      });
    } finally {
      setAddCompanyLoading(false);
    }
  };

  const handleGicsToggle = (tickerSymbol: string) => {
    const newSelected = new Set(selectedGics);
    if (newSelected.has(tickerSymbol)) {
      newSelected.delete(tickerSymbol);
    } else {
      newSelected.add(tickerSymbol);
    }
    setSelectedGics(newSelected);
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setUpdateProfileLoading(true);
    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          role: profileForm.role,
          company_id: selectedCompanyId || null
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update company location if a company is selected and location has changed
      if (selectedCompanyId) {
        const selectedCompany = companies.find(c => c.companyID === selectedCompanyId);
        if (selectedCompany && selectedCompany.location !== companyLocation) {
          const { error: companyError } = await supabase
            .from('user_companies')
            .update({
              location: companyLocation
            })
            .eq('companyID', selectedCompanyId);

          if (companyError) throw companyError;
        }
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
      fetchProfile();
      fetchCompanies(); // Refresh companies to get updated location
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setUpdateProfileLoading(false);
    }
  };

  const handleUpdateSubscriptions = async () => {
    if (!profile) return;
    
    setUpdateGicsLoading(true);
    try {
      // Get current subscriptions to compare with new selections
      const { data: currentSubscriptions, error: fetchError } = await supabase
        .from('subscriptions')
        .select('subID, gicsSector, gicsSubCategory')
        .eq('userID', profile.user_id)
        .eq('status', 'ACTIVE');

      if (fetchError) throw fetchError;

      // Create a map of current subscriptions for easy lookup
      const currentSubscriptionsMap = new Map();
      currentSubscriptions?.forEach(sub => {
        if (sub.gicsSubCategory?.startsWith('COMPANY:')) {
          // Individual company subscription
          currentSubscriptionsMap.set(sub.gicsSubCategory, sub);
        } else {
          // Sector/subsector subscription
          const key = `${sub.gicsSector}:${sub.gicsSubCategory || ''}`;
          currentSubscriptionsMap.set(key, sub);
        }
      });

      // Create individual company subscriptions by encoding the ticker symbol
      const newSubscriptions = [];
      for (const tickerSymbol of selectedGics) {
        const company = gicsCompanies.find(c => c.tickerSymbol === tickerSymbol);
        if (company) {
          // Use a unique identifier format: "COMPANY:{tickerSymbol}" in gicsSubCategory
          const uniqueKey = `COMPANY:${tickerSymbol}`;
          if (!currentSubscriptionsMap.has(uniqueKey)) {
            newSubscriptions.push({
              userID: profile.user_id,
              status: 'ACTIVE',
              subStart: new Date().toISOString(),
              gicsSector: company.gicsSector,
              gicsSubCategory: uniqueKey // Store the ticker symbol here
            });
          }
        }
      }

      // Insert new subscriptions
      if (newSubscriptions.length > 0) {
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(newSubscriptions);

        if (insertError) throw insertError;
      }

      // Deactivate subscriptions for companies that are no longer selected
      const subscriptionsToDeactivate = [];
      for (const [key, subscription] of currentSubscriptionsMap) {
        if (key.startsWith('COMPANY:')) {
          // Individual company subscription
          const tickerSymbol = key.replace('COMPANY:', '');
          if (!selectedGics.has(tickerSymbol)) {
            subscriptionsToDeactivate.push(subscription.subID);
          }
        } else {
          // Sector/subsector subscription - we don't manage these from GICS companies page
          // These are managed by the sector subscription interface
        }
      }

      if (subscriptionsToDeactivate.length > 0) {
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ status: 'INACTIVE' })
          .in('subID', subscriptionsToDeactivate);

        if (updateError) throw updateError;
      }

      toast({
        title: "Success",
        description: "GICS subscriptions updated successfully",
      });

      // Refresh subscriptions
      await fetchUserSubscriptions();
    } catch (error) {
      console.error('Error updating subscriptions:', error);
      toast({
        title: "Error",
        description: "Failed to update subscriptions",
        variant: "destructive",
      });
    } finally {
      setUpdateGicsLoading(false);
    }
  };

  const handleAppearanceChange = (key: string, value: any) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Apply changes immediately for certain settings
    if (key === 'theme' || key === 'colorScheme' || key === 'fontSize') {
      applyAppearanceSettings({
        ...appearanceSettings,
        [key]: value
      });
    }
  };

  const applyAppearanceSettings = (settings: typeof appearanceSettings) => {
    // Apply theme classes to document
    document.documentElement.className = '';
    document.documentElement.classList.add(`theme-${settings.theme}`);
    document.documentElement.classList.add(`color-scheme-${settings.colorScheme}`);
    document.documentElement.classList.add(`font-size-${settings.fontSize}`);
    document.documentElement.classList.add(`data-density-${settings.dataDensity}`);
    document.documentElement.classList.add(`accent-${settings.accentColor}`);
    
    // Apply conditional classes
    if (settings.terminalMode) {
      document.documentElement.classList.add('terminal-mode');
    }
    
    if (settings.compactView) {
      document.documentElement.classList.add('compact-view');
    }
    
    if (!settings.showAnimations) {
      document.documentElement.classList.add('no-animations');
    }
    
    if (!settings.showGridLines) {
      document.documentElement.classList.add('no-grid-lines');
    }
    
    // Handle auto color scheme
    if (settings.colorScheme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const isDark = mediaQuery.matches;
      document.documentElement.classList.add(`color-scheme-${isDark ? 'dark' : 'light'}`);
      
      // Listen for system theme changes
      mediaQuery.addEventListener('change', (e) => {
        document.documentElement.classList.remove('color-scheme-dark', 'color-scheme-light');
        document.documentElement.classList.add(`color-scheme-${e.matches ? 'dark' : 'light'}`);
      });
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('agora-appearance', JSON.stringify(settings));
    
    toast({
      title: "Appearance Updated",
      description: "Your appearance settings have been applied",
    });
  };

  const saveAppearanceSettings = async () => {
    try {
      // Save to database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            // Store appearance settings as JSON in a custom field
            // This would require adding a preferences column to the profiles table
          })
          .eq('user_id', user.id);

        if (error) throw error;
      }
      
      // Always save to localStorage
      localStorage.setItem('agora-appearance', JSON.stringify(appearanceSettings));
      
      toast({
        title: "Success",
        description: "Appearance settings saved successfully",
      });
      
      // Collapse the appearance card after successful save
      setPreferencesSectionOpen(false);
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: "Error",
        description: "Failed to save appearance settings",
        variant: "destructive",
      });
    }
  };

  // Load appearance settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('agora-appearance');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setAppearanceSettings(parsed);
        applyAppearanceSettings(parsed);
      } catch (error) {
        console.error('Error loading appearance settings:', error);
      }
    }
  }, []);

  // Calendar preferences functions
  const handleCalendarPreferenceChange = (key: string, value: any) => {
    setCalendarPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveCalendarPreferences = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('agora-calendar-preferences', JSON.stringify(calendarPreferences));
      
      toast({
        title: "Success",
        description: "Calendar preferences saved successfully",
      });
      
      // Collapse the preferences card after successful save
      setPreferencesSectionOpen(false);
    } catch (error) {
      console.error('Error saving calendar preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save calendar preferences",
        variant: "destructive",
      });
    }
  };

  // Event view preferences functions
  const handleEventViewPreferenceChange = (key: string, value: any) => {
    setEventViewPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveEventViewPreferences = async () => {
    try {
      // Save to localStorage
      localStorage.setItem('agora-event-view-preferences', JSON.stringify(eventViewPreferences));
      
      toast({
        title: "Success",
        description: "Event view preferences saved successfully",
      });
      
      // Collapse the preferences card after successful save
      setPreferencesSectionOpen(false);
    } catch (error) {
      console.error('Error saving event view preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save event view preferences",
        variant: "destructive",
      });
    }
  };

  // Load calendar preferences on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('agora-calendar-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setCalendarPreferences(parsed);
      } catch (error) {
        console.error('Error loading calendar preferences:', error);
      }
    }
  }, []);

  // Group GICS companies by sector
  const gicsSectors = Array.from(new Set(gicsCompanies.map(company => company.gicsSector))).sort();
  const gicsSubSectors = Array.from(new Set(gicsCompanies.map(company => company.gicsSubCategory))).sort();

  return (
    <Layout currentPage="settings">
      <div className="p-6 space-y-6 bg-background min-h-screen flex justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5 text-gold" />
                Settings
              </h1>
              <p className="text-xs text-text-muted">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Profile Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setProfileSectionOpen(!profileSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-gold" />
                  Profile Settings
                  </div>
                  {profileSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {profileSectionOpen && (
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-xs">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter first name"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={profileLoading}
                        className="text-xs"
                      />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter last name"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={profileLoading}
                        className="text-xs"
                      />
                    </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled className="text-xs" />
                </div>
                  <div className="space-y-1">
                    <Label htmlFor="role" className="text-xs">Role</Label>
                    <Select 
                      value={profileForm.role} 
                      onValueChange={(value) => setProfileForm(prev => ({ ...prev, role: value }))}
                      disabled={profileLoading}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IR_ADMIN">IR Admin</SelectItem>
                        <SelectItem value="ANALYST_MANAGER">Analyst Manager</SelectItem>
                        <SelectItem value="INVESTMENT_ANALYST">Investment Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="company" className="text-xs">Company</Label>
                    <Select 
                      value={selectedCompanyId} 
                      onValueChange={setSelectedCompanyId}
                      disabled={profileLoading}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.companyID} value={company.companyID}>
                            {company.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="location" className="text-xs">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="Enter location"
                      value={companyLocation}
                      onChange={(e) => setCompanyLocation(e.target.value)}
                      disabled={profileLoading}
                      className="text-xs"
                    />
                  </div>
                  
                  {/* Add New Company Section */}
                  <div className="space-y-2 pt-2 border-t border-border-default">
                    <Label className="text-xs font-medium text-gold">Add New Company</Label>
                    <p className="text-xs text-text-muted">If your company is not listed above, you can add it here</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Company name"
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        className="text-xs"
                      />
                      <Input 
                        placeholder="Location (optional)"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        className="text-xs"
                      />
                      <Button 
                        onClick={handleAddCompany} 
                        disabled={!newCompany.trim() || addCompanyLoading}
                        size="sm"
                        className="text-xs"
                      >
                        {addCompanyLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                            Adding...
                          </div>
                        ) : (
                          <>
                            <Plus className="mr-1 h-3 w-3" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                    {addCompanyError && (
                      <p className="text-xs text-red-400">{addCompanyError}</p>
                    )}
                    {addCompanySuccess && (
                      <p className="text-xs text-green-400">{addCompanySuccess}</p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleUpdateProfile} 
                      disabled={profileLoading}
                      size="sm"
                      className="text-xs"
                    >
                      {profileLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </div>
              </CardContent>
              )}
            </Card>

            {/* Company Management */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setCompanySectionOpen(!companySectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4 text-gold" />
                    Company Directory
                  </div>
                  {companySectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {companySectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs">Existing Companies</Label>
                    <p className="text-xs text-text-muted">View all companies in the system</p>
                    <div className="space-y-1">
                      {companies.map((company) => (
                        <div key={company.companyID} className="flex items-center justify-between p-2 bg-surface-secondary rounded">
                          <div>
                            <div className="text-xs font-medium">{company.companyName}</div>
                            {company.location && (
                              <div className="text-xs text-text-muted">{company.location}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* GICS Companies */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setGicsSectionOpen(!gicsSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-gold" />
                    GICS Companies
                  </div>
                  {gicsSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {gicsSectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs">Select GICS Companies</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {gicsCompanies.map((company) => {
                        const isSubscribed = selectedGics.has(company.tickerSymbol);
                        return (
                          <div key={company.tickerSymbol} className={`flex items-center space-x-2 p-2 rounded transition-colors ${
                            isSubscribed ? 'bg-success/10 border border-success/20' : 'bg-surface-secondary'
                          }`}>
                            <Checkbox 
                              id={company.tickerSymbol}
                              checked={isSubscribed}
                              onCheckedChange={() => handleGicsToggle(company.tickerSymbol)}
                            />
                            <Label htmlFor={company.tickerSymbol} className={`text-xs cursor-pointer flex-1 ${
                              isSubscribed ? 'text-success' : 'text-text-primary'
                            }`}>
                              {company.tickerSymbol} - {company.companyName}
                            </Label>
                            {isSubscribed && (
                              <div className="text-xs text-success font-medium">
                                ✓ Subscribed
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleUpdateSubscriptions} 
                      disabled={updateGicsLoading}
                      size="sm"
                      className="text-xs"
                    >
                      {updateGicsLoading ? 'Updating...' : 'Update Subscriptions'}
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setNotificationSectionOpen(!notificationSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-gold" />
                    Notification Preferences
                  </div>
                  {notificationSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {notificationSectionOpen && (
                <CardContent className="p-0">
                  <NotificationPreferences />
                </CardContent>
              )}
            </Card>

            {/* Calendar Preferences */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setCalendarSectionOpen(!calendarSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-gold" />
                    Calendar Preferences
                  </div>
                  {calendarSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {calendarSectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Default View</Label>
                    <Select
                      value={calendarPreferences.defaultView}
                      onValueChange={(value) => handleCalendarPreferenceChange('defaultView', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Week View</SelectItem>
                        <SelectItem value="month">Month View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Show Event Categories</Label>
                      <p className="text-xs text-text-muted">Display event type legend on calendar</p>
                    </div>
                    <Switch
                      checked={calendarPreferences.showEventCategory}
                      onCheckedChange={(checked) => handleCalendarPreferenceChange('showEventCategory', checked)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Default Event Filter</Label>
                    <Select
                      value={calendarPreferences.defaultEventFilter}
                      onValueChange={(value) => handleCalendarPreferenceChange('defaultEventFilter', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="rsvp">My Events Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Default Sort</Label>
                    <Select
                      value={calendarPreferences.defaultSort}
                      onValueChange={(value) => handleCalendarPreferenceChange('defaultSort', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="events">Most Events</SelectItem>
                        <SelectItem value="alpha">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Event View Preferences */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setEventViewSectionOpen(!eventViewSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4 text-gold" />
                    Event View Preferences
                  </div>
                  {eventViewSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {eventViewSectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Display Mode</Label>
                    <Select
                      value={eventViewPreferences.displayMode}
                      onValueChange={(value) => handleEventViewPreferenceChange('displayMode', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">📋 Enhanced List View (Recommended)</SelectItem>
                        <SelectItem value="compact">📊 Compact Table View</SelectItem>
                        <SelectItem value="cards">🎴 Card View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Compact Information</Label>
                      <p className="text-xs text-text-muted">Use smaller text and tighter spacing</p>
                    </div>
                    <Switch
                      checked={eventViewPreferences.compactMode}
                      onCheckedChange={(checked) => handleEventViewPreferenceChange('compactMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Show Status Badges</Label>
                      <p className="text-xs text-text-muted">Display timing and RSVP status badges</p>
                    </div>
                    <Switch
                      checked={eventViewPreferences.showStatusBadges}
                      onCheckedChange={(checked) => handleEventViewPreferenceChange('showStatusBadges', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs">Auto-refresh Events</Label>
                      <p className="text-xs text-text-muted">Automatically refresh every 5 minutes</p>
                    </div>
                    <Switch
                      checked={eventViewPreferences.autoRefresh}
                      onCheckedChange={(checked) => handleEventViewPreferenceChange('autoRefresh', checked)}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setAppearanceSectionOpen(!appearanceSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <Palette className="mr-2 h-4 w-4 text-gold" />
                    Appearance Settings
                  </div>
                  {appearanceSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {appearanceSectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">Theme</Label>
                    <Select
                      value={appearanceSettings.theme}
                      onValueChange={(value) => handleAppearanceChange('theme', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bloomberg">Bloomberg Terminal</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                        <SelectItem value="modern">Modern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color Scheme</Label>
                    <Select
                      value={appearanceSettings.colorScheme}
                      onValueChange={(value) => handleAppearanceChange('colorScheme', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Font Size</Label>
                    <Select
                      value={appearanceSettings.fontSize}
                      onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Data Density</Label>
                    <Select
                      value={appearanceSettings.dataDensity}
                      onValueChange={(value) => handleAppearanceChange('dataDensity', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Accent Color</Label>
                    <Select
                      value={appearanceSettings.accentColor}
                      onValueChange={(value) => handleAppearanceChange('accentColor', value)}
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Security Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setSecuritySectionOpen(!securitySectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-gold" />
                    Security Settings
                  </div>
                  {securitySectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-gold" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {securitySectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="space-y-2">
                    <Label className="text-xs">Two-Factor Authentication</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-text-muted">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-xs">Password</Label>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-text-muted">Change your account password</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">
                        Change Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* User Management */}
            {userProfile?.role === 'IR_ADMIN' && (
              <Card className="bg-surface-primary border-border-default">
                <CardHeader 
                  className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                  onClick={() => setUserManagementSectionOpen(!userManagementSectionOpen)}
                >
                  <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gold" />
                      User Management
                    </div>
                    {userManagementSectionOpen ? (
                      <ChevronDown className="h-4 w-4 text-gold" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gold" />
                    )}
                  </CardTitle>
                </CardHeader>
                {userManagementSectionOpen && (
                  <CardContent className="space-y-3 text-xs">
                    <div className="space-y-2">
                      <Label className="text-xs">Invite New User</Label>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-muted">Send invitation to new team member</p>
                        </div>
                        <Button 
                          onClick={() => setInviteDialogOpen(true)} 
                          size="sm"
                          className="text-xs"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Invite User
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-xs">Manage Users</Label>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-text-muted">View and manage existing users</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs" asChild>
                          <Link to="/users">
                            Manage Users
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setDangerZoneSectionOpen(!dangerZoneSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary text-sm">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-red-500" />
                    Danger Zone
                  </div>
                  {dangerZoneSectionOpen ? (
                    <ChevronDown className="h-4 w-4 text-red-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              {dangerZoneSectionOpen && (
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs text-error">Sign Out</Label>
                      <p className="text-xs text-text-muted">Sign out of your current session</p>
                    </div>
                    <Button variant="outline" onClick={signOut} size="sm" className="text-xs">
                      Sign Out
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs text-error">Delete Account</Label>
                      <p className="text-xs text-text-muted">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="danger" size="sm" className="text-xs">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Invite User Dialog */}
      <InviteUserDialog 
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onUserInvited={() => {
          // Could refresh user data here if needed
          toast({
            title: "Success",
            description: "User management data refreshed",
          });
        }}
      />
    </Layout>
  );
};

export default Settings;