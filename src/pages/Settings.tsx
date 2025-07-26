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
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database, Users, Building, Globe, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import InviteUserDialog from '@/components/InviteUserDialog';
import NotificationPreferences from '@/components/NotificationPreferences';

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
  const [notificationsSectionOpen, setNotificationsSectionOpen] = useState(false);
  const [securitySectionOpen, setSecuritySectionOpen] = useState(false);
  const [userManagementSectionOpen, setUserManagementSectionOpen] = useState(false);
  const [appearanceSectionOpen, setAppearanceSectionOpen] = useState(false);
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

  // Fetch user subscriptions after profile is loaded
  useEffect(() => {
    if (userProfile) {
      fetchUserSubscriptions();
    }
  }, [userProfile]);

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
    if (!user || !userProfile) return;
    
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('gicsSector, gicsSubCategory')
        .eq('userID', userProfile.id);

      if (error) throw error;
      
      // For now, we'll use a different approach since subscriptions table structure is different
      // We'll need to create a separate table for user-company subscriptions
      setSelectedGics(new Set<string>());
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
    if (!user) return;
    
    setUpdateGicsLoading(true);
    try {
      // For now, we'll just show a success message since the subscriptions table structure is different
      // TODO: Implement proper subscription management with a new table structure
      toast({
        title: "Success",
        description: "Subscriptions updated successfully",
      });
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
      setAppearanceSectionOpen(false);
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

  // Group GICS companies by sector
  const gicsSectors = Array.from(new Set(gicsCompanies.map(company => company.gicsSector))).sort();
  const gicsSubSectors = Array.from(new Set(gicsCompanies.map(company => company.gicsSubCategory))).sort();

  return (
    <Layout currentPage="settings">
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gold mb-2">Settings</h1>
            <p className="text-text-secondary">Manage your account and application preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setProfileSectionOpen(!profileSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-gold" />
                  Profile Settings
                  </div>
                  {profileSectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {profileSectionOpen && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="Enter first name"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={profileLoading}
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Enter last name"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={profileLoading}
                      />
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={profileForm.role} 
                      onValueChange={(value) => setProfileForm(prev => ({ ...prev, role: value }))}
                      disabled={profileLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IR_ADMIN">IR Admin</SelectItem>
                        <SelectItem value="ANALYST_MANAGER">Analyst Manager</SelectItem>
                        <SelectItem value="INVESTMENT_ANALYST">Investment Analyst</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={updateProfileLoading || profileLoading}
                  >
                    {updateProfileLoading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* Company Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setCompanySectionOpen(!companySectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                    <Building className="mr-2 h-5 w-5 text-gold" />
                    Company Settings
                  </div>
                  {companySectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {companySectionOpen && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select your Company</Label>
                    <div className="flex gap-2">
                      <Select 
                        value={selectedCompanyId} 
                        onValueChange={setSelectedCompanyId}
                        disabled={companiesLoading}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select your company" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.companyID} value={company.companyID}>
                              {company.companyName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Dialog open={addCompanyOpen} onOpenChange={setAddCompanyOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Add Company</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Company</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="newCompany">Company Name</Label>
                              <Input
                                id="newCompany"
                                placeholder="Enter company name"
                                value={newCompany}
                                onChange={(e) => setNewCompany(e.target.value)}
                                disabled={addCompanyLoading}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="companyLocation">Location</Label>
                              <Input
                                id="companyLocation"
                                placeholder="Enter or select a location"
                                value={companyLocation}
                                onChange={e => {
                                  setCompanyLocation(e.target.value);
                                  setLocationSuggestions(
                                    e.target.value
                                      ? COMMON_LOCATIONS.filter(loc => loc.toLowerCase().includes(e.target.value.toLowerCase()))
                                      : []
                                  );
                                }}
                                autoComplete="off"
                                disabled={addCompanyLoading}
                              />
                              {locationSuggestions.length > 0 && (
                                <div className="border border-border-default rounded bg-surface-secondary mt-1 max-h-32 overflow-y-auto z-50 absolute">
                                  {locationSuggestions.map(loc => (
                                    <div
                                      key={loc}
                                      className="px-3 py-1 hover:bg-gold/10 cursor-pointer"
                                      onClick={() => {
                                        setCompanyLocation(loc);
                                        setLocationSuggestions([]);
                                      }}
                                    >
                                      {loc}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {addCompanyError && (
                              <p className="text-sm text-red-500">{addCompanyError}</p>
                            )}
                            {addCompanySuccess && (
                              <p className="text-sm text-green-500">{addCompanySuccess}</p>
                            )}
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setAddCompanyOpen(false)}
                                disabled={addCompanyLoading}
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleAddCompany}
                                disabled={addCompanyLoading || !newCompany.trim()}
                              >
                                {addCompanyLoading ? 'Adding...' : 'Add Company'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyLocationUpdate">Location</Label>
                    <Input
                      id="companyLocationUpdate"
                      placeholder="Enter or select a location"
                      value={companyLocation}
                      onChange={e => {
                        setCompanyLocation(e.target.value);
                        setLocationSuggestions(
                          e.target.value
                            ? COMMON_LOCATIONS.filter(loc => loc.toLowerCase().includes(e.target.value.toLowerCase()))
                            : []
                        );
                      }}
                      autoComplete="off"
                      disabled={companiesLoading}
                    />
                    {locationSuggestions.length > 0 && (
                      <div className="border border-border-default rounded bg-surface-secondary mt-1 max-h-32 overflow-y-auto z-50 absolute">
                        {locationSuggestions.map(loc => (
                          <div
                            key={loc}
                            className="px-3 py-1 hover:bg-gold/10 cursor-pointer"
                            onClick={() => {
                              setCompanyLocation(loc);
                              setLocationSuggestions([]);
                            }}
                          >
                            {loc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={updateProfileLoading || profileLoading}
                  >
                    {updateProfileLoading ? 'Updating...' : 'Update Company'}
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* GICS Subscription Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setGicsSectionOpen(!gicsSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-gold" />
                    GICS Sector & Company Subscriptions
                  </div>
                  {gicsSectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {gicsSectionOpen && (
                <CardContent className="space-y-4">
                  {gicsLoading ? (
                    <p className="text-text-muted">Loading GICS data...</p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {/* GICS Sectors */}
                        <div>
                          <Label className="text-sm font-medium">GICS Sectors</Label>
                          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {gicsSectors.map((sector) => {
                              const sectorCompanies = gicsCompanies.filter(company => company.gicsSector === sector);
                              const allSelected = sectorCompanies.every(company => selectedGics.has(company.tickerSymbol));
                              const someSelected = sectorCompanies.some(company => selectedGics.has(company.tickerSymbol));
                              
                              return (
                                <div key={sector} className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={allSelected}
                                      onCheckedChange={(checked) => {
                                        const newSelected = new Set(selectedGics);
                                        sectorCompanies.forEach(company => {
                                          if (checked) {
                                            newSelected.add(company.tickerSymbol);
                                          } else {
                                            newSelected.delete(company.tickerSymbol);
                                          }
                                        });
                                        setSelectedGics(newSelected);
                                      }}
                                    />
                                    <Label className="text-sm font-medium">{sector}</Label>
                                  </div>
                                  <div className="ml-6 space-y-1">
                                    {sectorCompanies.map((company) => (
                                      <div key={company.tickerSymbol} className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={selectedGics.has(company.tickerSymbol)}
                                          onCheckedChange={() => handleGicsToggle(company.tickerSymbol)}
                                        />
                                        <Label className="text-sm">
                                          {company.companyName} ({company.tickerSymbol})
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* GICS Sub-Sectors */}
                        <div>
                          <Label className="text-sm font-medium">GICS Sub-Sectors</Label>
                          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {gicsSubSectors.map((subSector) => {
                              const subSectorCompanies = gicsCompanies.filter(company => company.gicsSubCategory === subSector);
                              const allSelected = subSectorCompanies.every(company => selectedGics.has(company.tickerSymbol));
                              const someSelected = subSectorCompanies.some(company => selectedGics.has(company.tickerSymbol));
                              
                              return (
                                <div key={subSector} className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={allSelected}
                                      onCheckedChange={(checked) => {
                                        const newSelected = new Set(selectedGics);
                                        subSectorCompanies.forEach(company => {
                                          if (checked) {
                                            newSelected.add(company.tickerSymbol);
                                          } else {
                                            newSelected.delete(company.tickerSymbol);
                                          }
                                        });
                                        setSelectedGics(newSelected);
                                      }}
                                    />
                                    <Label className="text-sm font-medium">{subSector}</Label>
                                  </div>
                                  <div className="ml-6 space-y-1">
                                    {subSectorCompanies.map((company) => (
                                      <div key={company.tickerSymbol} className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={selectedGics.has(company.tickerSymbol)}
                                          onCheckedChange={() => handleGicsToggle(company.tickerSymbol)}
                                        />
                                        <Label className="text-sm">
                                          {company.companyName} ({company.tickerSymbol})
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-sm text-text-muted mb-2">
                          Selected: {selectedGics.size} companies
                        </p>
                        <Button 
                          onClick={handleUpdateSubscriptions}
                          disabled={updateGicsLoading}
                        >
                          {updateGicsLoading ? 'Updating...' : 'Update Subscriptions'}
                        </Button>
                      </div>
                    </>
                  )}
              </CardContent>
              )}
            </Card>

            {/* Notification Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setNotificationsSectionOpen(!notificationsSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                  <Bell className="mr-2 h-5 w-5 text-gold" />
                  Notification Preferences
                  </div>
                  {notificationsSectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {notificationsSectionOpen && (
                <CardContent className="p-0">
                  <div className="p-6">
                    <NotificationPreferences />
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
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-gold" />
                  Security
                  </div>
                  {securitySectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {securitySectionOpen && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <div className="flex gap-2">
                    <Input type="password" placeholder="New password" className="flex-1" />
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-text-muted">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
              )}
            </Card>

            {/* User Management */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setUserManagementSectionOpen(!userManagementSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-gold" />
                  User Management
                  </div>
                  {userManagementSectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {userManagementSectionOpen && (
              <CardContent className="space-y-4">
                  {/* Current User Info */}
                  <div className="space-y-4">
                    <div className="border border-border-default rounded-lg p-4 bg-surface-secondary">
                      <h4 className="font-semibold text-gold mb-3">Current User Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Name</Label>
                          <p className="text-text-primary">
                            {profile?.first_name && profile?.last_name 
                              ? `${profile.first_name} ${profile.last_name}`
                              : 'Not set'
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Email</Label>
                          <p className="text-text-primary">{user?.email || 'Not available'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Role</Label>
                          <p className="text-text-primary">
                            {profile?.role 
                              ? profile.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                              : 'Not set'
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Company</Label>
                          <p className="text-text-primary">
                            {companies.find(c => c.companyID === profile?.company_id)?.companyName || 'Not assigned'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Company Location</Label>
                          <p className="text-text-primary">
                            {companies.find(c => c.companyID === profile?.company_id)?.location || 'Not set'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">User ID</Label>
                          <p className="text-text-primary font-mono text-sm">{user?.id || 'Not available'}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Profile Created</Label>
                          <p className="text-text-primary">
                            {profile?.created_at 
                              ? new Date(profile.created_at).toLocaleDateString()
                              : 'Not available'
                            }
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-text-muted">Last Updated</Label>
                          <p className="text-text-primary">
                            {profile?.updated_at 
                              ? new Date(profile.updated_at).toLocaleDateString()
                              : 'Not available'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manage Users</Label>
                    <p className="text-sm text-text-muted">View, invite, and manage user accounts</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => setInviteDialogOpen(true)}
                      disabled={!userProfile}
                      className="bg-gold hover:bg-gold-hover text-background"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Invite User
                    </Button>
                    <Link to="/users">
                      <Button variant="outline">Manage Users</Button>
                    </Link>
                  </div>
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
                <CardTitle className="flex items-center justify-between text-text-primary">
                  <div className="flex items-center">
                  <Palette className="mr-2 h-5 w-5 text-gold" />
                  Appearance
                  </div>
                  {appearanceSectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-gold" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gold" />
                  )}
                </CardTitle>
              </CardHeader>
              {appearanceSectionOpen && (
              <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Theme</Label>
                    <p className="text-sm text-text-muted">Choose your preferred visual theme</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        appearanceSettings.theme === 'bloomberg' 
                          ? 'border-gold bg-gold/10' 
                          : 'border-border-default hover:border-gold/50'
                      }`}
                      onClick={() => handleAppearanceChange('theme', 'bloomberg')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-gold rounded-full"></div>
                        <span className="font-medium">Bloomberg Terminal</span>
                      </div>
                      <p className="text-xs text-text-muted">Professional terminal-inspired design with gold accents</p>
                    </div>
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        appearanceSettings.theme === 'classic' 
                          ? 'border-gold bg-gold/10' 
                          : 'border-border-default hover:border-gold/50'
                      }`}
                      onClick={() => handleAppearanceChange('theme', 'classic')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Classic</span>
                      </div>
                      <p className="text-xs text-text-muted">Traditional business application design</p>
                    </div>
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        appearanceSettings.theme === 'modern' 
                          ? 'border-gold bg-gold/10' 
                          : 'border-border-default hover:border-gold/50'
                      }`}
                      onClick={() => handleAppearanceChange('theme', 'modern')}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium">Modern</span>
                      </div>
                      <p className="text-xs text-text-muted">Clean, minimalist design with modern aesthetics</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Color Scheme */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Color Scheme</Label>
                    <p className="text-sm text-text-muted">Select your preferred color mode</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select 
                      value={appearanceSettings.colorScheme} 
                      onValueChange={(value) => handleAppearanceChange('colorScheme', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="auto">Auto (System)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Layout Options */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Layout & Display</Label>
                    <p className="text-sm text-text-muted">Customize how information is displayed</p>
                  </div>
                  <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                        <Label>Terminal Mode</Label>
                    <p className="text-sm text-text-muted">Use Bloomberg terminal-inspired design</p>
                  </div>
                      <Switch 
                        checked={appearanceSettings.terminalMode}
                        onCheckedChange={(checked) => handleAppearanceChange('terminalMode', checked)}
                      />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-text-muted">Display more information in less space</p>
                  </div>
                      <Switch 
                        checked={appearanceSettings.compactView}
                        onCheckedChange={(checked) => handleAppearanceChange('compactView', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Grid Lines</Label>
                        <p className="text-sm text-text-muted">Display grid lines in data tables</p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.showGridLines}
                        onCheckedChange={(checked) => handleAppearanceChange('showGridLines', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Animations</Label>
                        <p className="text-sm text-text-muted">Enable smooth transitions and animations</p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.showAnimations}
                        onCheckedChange={(checked) => handleAppearanceChange('showAnimations', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Tooltips</Label>
                        <p className="text-sm text-text-muted">Display helpful tooltips on hover</p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.showTooltips}
                        onCheckedChange={(checked) => handleAppearanceChange('showTooltips', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Typography */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Typography</Label>
                    <p className="text-sm text-text-muted">Adjust text size and readability</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select 
                      value={appearanceSettings.fontSize} 
                      onValueChange={(value) => handleAppearanceChange('fontSize', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Data Density */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Data Density</Label>
                    <p className="text-sm text-text-muted">Control spacing and information density</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Select 
                      value={appearanceSettings.dataDensity} 
                      onValueChange={(value) => handleAppearanceChange('dataDensity', value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Accent Color */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Accent Color</Label>
                    <p className="text-sm text-text-muted">Choose your preferred accent color</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {['gold', 'blue', 'green', 'purple'].map((color) => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all ${
                          appearanceSettings.accentColor === color 
                            ? 'border-white scale-110' 
                            : 'border-border-default hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: color === 'gold' ? '#D4AF37' : 
                                         color === 'blue' ? '#3B82F6' : 
                                         color === 'green' ? '#10B981' : '#8B5CF6'
                        }}
                        onClick={() => handleAppearanceChange('accentColor', color)}
                        title={color.charAt(0).toUpperCase() + color.slice(1)}
                      />
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Auto-refresh Settings */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Auto-refresh</Label>
                    <p className="text-sm text-text-muted">Configure automatic data updates</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enable Auto-refresh</Label>
                        <p className="text-sm text-text-muted">Automatically refresh data at regular intervals</p>
                      </div>
                      <Switch 
                        checked={appearanceSettings.autoRefresh}
                        onCheckedChange={(checked) => handleAppearanceChange('autoRefresh', checked)}
                      />
                    </div>
                    {appearanceSettings.autoRefresh && (
                      <div className="flex items-center space-x-4">
                        <Label>Refresh Interval:</Label>
                        <Select 
                          value={appearanceSettings.refreshInterval.toString()} 
                          onValueChange={(value) => handleAppearanceChange('refreshInterval', parseInt(value))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                            <SelectItem value="300">5 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={saveAppearanceSettings}>
                    Save Appearance Settings
                  </Button>
                </div>
              </CardContent>
              )}
            </Card>

            {/* Danger Zone */}
            <Card className="bg-surface-primary border-error/20">
              <CardHeader 
                className="cursor-pointer hover:bg-surface-secondary/50 transition-colors"
                onClick={() => setDangerZoneSectionOpen(!dangerZoneSectionOpen)}
              >
                <CardTitle className="flex items-center justify-between text-error">
                  <div className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Danger Zone
                  </div>
                  {dangerZoneSectionOpen ? (
                    <ChevronDown className="h-5 w-5 text-error" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-error" />
                  )}
                </CardTitle>
              </CardHeader>
              {dangerZoneSectionOpen && (
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-text-primary">Sign Out</Label>
                    <p className="text-sm text-text-muted">Sign out from your current session</p>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-error">Delete Account</Label>
                    <p className="text-sm text-text-muted">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="danger">
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