import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();

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
              <CardHeader>
                <CardTitle className="flex items-center text-text-primary">
                  <User className="mr-2 h-5 w-5 text-gold" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email || ''} disabled />
                </div>
                <Button>Update Profile</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader>
                <CardTitle className="flex items-center text-text-primary">
                  <Bell className="mr-2 h-5 w-5 text-gold" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-text-muted">Receive email updates for events and RSVPs</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-text-muted">Receive push notifications for urgent updates</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Summary</Label>
                    <p className="text-sm text-text-muted">Get a weekly digest of platform activity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader>
                <CardTitle className="flex items-center text-text-primary">
                  <Shield className="mr-2 h-5 w-5 text-gold" />
                  Security
                </CardTitle>
              </CardHeader>
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
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-surface-primary border-border-default">
              <CardHeader>
                <CardTitle className="flex items-center text-text-primary">
                  <Palette className="mr-2 h-5 w-5 text-gold" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Terminal Theme</Label>
                    <p className="text-sm text-text-muted">Use Bloomberg terminal-inspired design</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-text-muted">Display more information in less space</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-surface-primary border-error/20">
              <CardHeader>
                <CardTitle className="flex items-center text-error">
                  <Database className="mr-2 h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
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
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;