import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Monitor, Building2, Globe, Clock, Calendar, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreference {
  id?: string;
  user_id: string;
  notification_type: 'email' | 'sms' | 'desktop' | 'mobile';
  enabled: boolean;
  frequency_days: number; // How many days before event to notify
  gics_sectors?: string[];
  companies?: string[];
  created_at?: string;
  updated_at?: string;
}

interface Company {
  companyID: string;
  companyName: string;
}

interface GicsCompany {
  gicsSector: string;
  gicsSubCategory: string;
}

const NOTIFICATION_FREQUENCIES = [
  { value: 1, label: '1 day before', description: 'Notify 1 day before events' },
  { value: 2, label: '2 days before', description: 'Notify 2 days before events' },
  { value: 3, label: '3 days before', description: 'Notify 3 days before events' },
  { value: 5, label: '5 days before', description: 'Notify 5 days before events' },
  { value: 7, label: '1 week before', description: 'Notify 1 week before events' },
];

const NOTIFICATION_TYPES = [
  { type: 'email', label: 'Email', icon: Mail, description: 'Receive notifications via email' },
  { type: 'sms', label: 'SMS/Mobile', icon: Smartphone, description: 'Receive text messages on your phone' },
  { type: 'desktop', label: 'Desktop', icon: Monitor, description: 'Show desktop notifications when browsing' },
  { type: 'mobile', label: 'Mobile App', icon: Bell, description: 'Push notifications in mobile app' },
];

export const NotificationPreferences: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [gicsData, setGicsData] = useState<GicsCompany[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedGicsSectors, setSelectedGicsSectors] = useState<string[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const { profile } = useAuth();
  const { toast } = useToast();

  // Default preferences state
  const [notificationSettings, setNotificationSettings] = useState({
    email: { enabled: true, frequency: 2 },
    sms: { enabled: false, frequency: 1 },
    desktop: { enabled: true, frequency: 1 },
    mobile: { enabled: false, frequency: 2 },
  });

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [companiesResponse, gicsResponse, preferencesResponse, logsResponse] = await Promise.all([
        // Fetch companies
        supabase
          .from('user_companies')
          .select('companyID, companyName')
          .order('companyName'),
        
        // Fetch GICS data
        supabase
          .from('gics_companies')
          .select('gicsSector, gicsSubCategory')
          .order('gicsSector'),

        // Fetch user's notification preferences from database
        supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', profile.id),

        // Fetch recent notification logs
        supabase
          .from('notification_log')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      if (companiesResponse.error) throw companiesResponse.error;
      if (gicsResponse.error) throw gicsResponse.error;
      if (preferencesResponse.error) throw preferencesResponse.error;
      if (logsResponse.error) throw logsResponse.error;

      setCompanies(companiesResponse.data || []);
      setGicsData(gicsResponse.data || []);
      setNotificationLogs(logsResponse.data || []);

      // Load preferences from database
      if (preferencesResponse.data) {
        updateSettingsFromPreferences(preferencesResponse.data);
        
        // Extract companies and GICS sectors from preferences
        const prefs = preferencesResponse.data;
        if (prefs.length > 0) {
          const firstPref = prefs[0]; // All preferences should have same companies/GICS
          if (firstPref.companies && Array.isArray(firstPref.companies)) {
            setSelectedCompanies(firstPref.companies);
          }
          if (firstPref.gics_sectors && Array.isArray(firstPref.gics_sectors)) {
            setSelectedGicsSectors(firstPref.gics_sectors);
          }
        }
      }

      // Fetch user's current subscriptions to pre-populate company/GICS selections
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('gicsSector, gicsSubCategory')
        .eq('userID', profile.id)
        .eq('status', 'ACTIVE');

      if (subscriptions) {
        const sectors = [...new Set(subscriptions.map(s => s.gicsSector).filter(Boolean))];
        setSelectedGicsSectors(sectors);
      }

         } catch (error) {
       console.error('Error fetching notification data:', error);
       toast({
         title: "Error",
         description: "Failed to load notification data",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
  };

  const updateSettingsFromPreferences = (prefs: any[]) => {
    const settings = { ...notificationSettings };
    prefs.forEach(pref => {
      if (settings[pref.notification_type as keyof typeof settings]) {
        settings[pref.notification_type as keyof typeof settings] = {
          enabled: pref.enabled,
          frequency: pref.frequency_days
        };
      }
    });
    setNotificationSettings(settings);
  };

  const handleNotificationToggle = (type: string, enabled: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled }
    }));
  };

  const handleFrequencyChange = (type: string, frequency: number) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], frequency }
    }));
  };

  const handleCompanyToggle = (companyId: string, checked: boolean) => {
    setSelectedCompanies(prev => 
      checked 
        ? [...prev, companyId]
        : prev.filter(id => id !== companyId)
    );
  };

  const handleGicsToggle = (sector: string, checked: boolean) => {
    setSelectedGicsSectors(prev => 
      checked 
        ? [...prev, sector]
        : prev.filter(s => s !== sector)
    );
  };

  const savePreferences = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      // Create notification preferences array
      const preferencesToSave = Object.entries(notificationSettings).map(([type, settings]) => ({
        user_id: profile.id,
        notification_type: type as 'email' | 'sms' | 'desktop' | 'mobile',
        enabled: settings.enabled,
        frequency_days: settings.frequency,
        gics_sectors: selectedGicsSectors.length > 0 ? selectedGicsSectors : null,
        companies: selectedCompanies.length > 0 ? selectedCompanies : null,
      }));

  

      // Delete existing preferences for this user
      const { error: deleteError } = await supabase
        .from('notification_preferences')
        .delete()
        .eq('user_id', profile.id);

      if (deleteError) {
        console.error('Error deleting existing preferences:', deleteError);
        throw deleteError;
      }

      // Insert new preferences
      const { error: insertError } = await supabase
        .from('notification_preferences')
        .insert(preferencesToSave);

      if (insertError) {
        console.error('Error inserting new preferences:', insertError);
        throw insertError;
      }

      toast({
        title: "✅ Preferences Saved",
        description: `Updated ${preferencesToSave.length} notification types`,
      });

    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "❌ Error",
        description: "Failed to save notification preferences. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sendRealNotification = async () => {
    try {
      

      // Fetch upcoming events for this user from the events table
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          gics_companies!inner(
            tickerSymbol,
            companyName,
            gicsSector,
            gicsSubCategory
          )
        `)
        .gte('startDate', new Date().toISOString())
        .lte('startDate', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()) // Next 7 days
        .order('startDate', { ascending: true })
        .limit(3);

      if (eventsError) {
        console.error('❌ Error fetching events:', eventsError);
        toast({
          title: "❌ Error",
          description: "Failed to fetch events for notification",
          variant: "destructive",
        });
        return;
      }

      if (!events || events.length === 0) {
        toast({
          title: "ℹ️ No Events",
          description: "No upcoming events found for notification",
        });
        return;
      }

      

      // Get user's email from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user?.email) {
        toast({
          title: "❌ Error",
          description: "Could not get user email address",
          variant: "destructive",
        });
        return;
      }

      // Prepare notification data
      const notificationData = {
        userId: profile.id,
        notificationType: 'email',
        events: events.map(event => ({
          eventID: event.eventID,
          eventName: event.eventName,
          eventType: event.eventType,
          hostCompany: event.gics_companies?.companyName || 'Unknown Company',
          startDate: event.startDate,
          location: event.location || 'TBD',
          description: event.description || 'No description available'
        })),
        userProfile: {
          first_name: profile.first_name || 'User',
          last_name: profile.last_name || '',
          user_id: user.email // Use actual email address instead of UUID
        },
        frequencyDays: 1
      };

      

      // Call the send-notification edge function
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edge function error:', response.status, errorText);
        toast({
          title: "❌ Notification Failed",
          description: `Failed to send notification: ${response.status}`,
          variant: "destructive",
        });
        return;
      }

      const result = await response.json();
      

      toast({
        title: "✅ Notification Sent",
        description: `Sent notification for ${events.length} upcoming event${events.length > 1 ? 's' : ''}`,
      });

      // Refresh notification logs
      fetchData();

    } catch (error) {
      console.error('❌ Error sending real notification:', error);
      toast({
        title: "❌ Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  // Get unique GICS sectors
  const uniqueGicsSectors = [...new Set(gicsData.map(item => item.gicsSector))].filter(Boolean);

  if (loading) {
    return (
      <Card className="bg-surface-primary border-border-default">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-gold">Loading notification preferences...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Methods */}
      <Card className="bg-surface-primary border-border-default">
        <CardHeader>
          <CardTitle className="flex items-center text-text-primary">
            <Bell className="mr-2 h-5 w-5 text-gold" />
            Notification Methods
          </CardTitle>
          <p className="text-sm text-text-muted">
            Choose how you want to receive notifications about upcoming events
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {NOTIFICATION_TYPES.map((type) => {
            const Icon = type.icon;
            const settings = notificationSettings[type.type];
            
            return (
              <div key={type.type} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gold" />
                    <div>
                      <Label className="text-text-primary font-medium">{type.label}</Label>
                      <p className="text-sm text-text-muted">{type.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.enabled}
                    onCheckedChange={(checked) => handleNotificationToggle(type.type, checked)}
                  />
                </div>
                
                {settings.enabled && (
                  <div className="ml-8 space-y-2">
                    <Label className="text-sm text-text-secondary">Notification Timing</Label>
                    <Select
                      value={settings.frequency.toString()}
                      onValueChange={(value) => handleFrequencyChange(type.type, parseInt(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTIFICATION_FREQUENCIES.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value.toString()}>
                            <div className="flex flex-col">
                              <span>{freq.label}</span>
                              <span className="text-xs text-text-muted">{freq.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {type.type !== 'desktop' && <Separator />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Company Preferences */}
      <Card className="bg-surface-primary border-border-default">
        <CardHeader>
          <CardTitle className="flex items-center text-text-primary">
            <Building2 className="mr-2 h-5 w-5 text-gold" />
            Company Notifications
          </CardTitle>
          <p className="text-sm text-text-muted">
            Select specific companies you want to receive event notifications for
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {companies.map((company) => (
              <div key={company.companyID} className="flex items-center space-x-2">
                <Checkbox
                  id={`company-${company.companyID}`}
                  checked={selectedCompanies.includes(company.companyID)}
                  onCheckedChange={(checked) => 
                    handleCompanyToggle(company.companyID, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`company-${company.companyID}`}
                  className="text-sm text-text-primary cursor-pointer"
                >
                  {company.companyName}
                </Label>
              </div>
            ))}
          </div>
          {companies.length === 0 && (
            <p className="text-text-muted text-sm">No companies available</p>
          )}
        </CardContent>
      </Card>

      {/* GICS Sector Preferences */}
      <Card className="bg-surface-primary border-border-default">
        <CardHeader>
          <CardTitle className="flex items-center text-text-primary">
            <Globe className="mr-2 h-5 w-5 text-gold" />
            GICS Sector Notifications
          </CardTitle>
          <p className="text-sm text-text-muted">
            Select GICS sectors you want to receive event notifications for
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {uniqueGicsSectors.map((sector) => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={`gics-${sector}`}
                  checked={selectedGicsSectors.includes(sector)}
                  onCheckedChange={(checked) => 
                    handleGicsToggle(sector, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`gics-${sector}`}
                  className="text-sm text-text-primary cursor-pointer"
                >
                  {sector}
                </Label>
              </div>
            ))}
          </div>
          {uniqueGicsSectors.length === 0 && (
            <p className="text-text-muted text-sm">No GICS sectors available</p>
          )}
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="bg-surface-primary border-border-default">
        <CardHeader>
          <CardTitle className="flex items-center text-text-primary">
            <Bell className="mr-2 h-5 w-5 text-gold" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Notification Types</Label>
              <div className="text-sm text-text-muted mt-1">
                {Object.entries(notificationSettings)
                  .filter(([_, settings]) => settings.enabled)
                  .map(([type, settings]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-gold rounded-full"></span>
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)} ({settings.frequency} day{settings.frequency > 1 ? 's' : ''})</span>
                    </div>
                  ))}
                {Object.entries(notificationSettings).filter(([_, settings]) => settings.enabled).length === 0 && (
                  <span className="text-text-muted">No notification types enabled</span>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Filters</Label>
              <div className="text-sm text-text-muted mt-1">
                {selectedCompanies.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>{selectedCompanies.length} company{selectedCompanies.length > 1 ? 'ies' : 'y'}</span>
                  </div>
                )}
                {selectedGicsSectors.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>{selectedGicsSectors.length} GICS sector{selectedGicsSectors.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                {selectedCompanies.length === 0 && selectedGicsSectors.length === 0 && (
                  <span className="text-text-muted">No filters applied (all events)</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notification Logs */}
      {notificationLogs.length > 0 && (
        <Card className="bg-surface-primary border-border-default">
          <CardHeader>
            <CardTitle className="flex items-center text-text-primary">
              <Clock className="mr-2 h-5 w-5 text-gold" />
              Recent Notifications
            </CardTitle>
            <p className="text-sm text-text-muted">
              Your recent notification activity
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notificationLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 bg-surface-secondary rounded">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      log.status === 'sent' ? 'bg-green-500' : 
                      log.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></span>
                    <span className="text-sm font-medium capitalize">{log.notification_type}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={sendRealNotification}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          <Send className="mr-2 h-4 w-4" />
          Push Notification
        </Button>
        <Button 
          onClick={savePreferences}
          disabled={saving}
          className="bg-gold hover:bg-gold-hover"
          size="sm"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences; 