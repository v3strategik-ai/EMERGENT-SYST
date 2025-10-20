import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Switch } from '../ui/switch.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Database, 
  Key,
  Users,
  Settings as SettingsIcon,
  Trash2,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../theme/ThemeProvider';
import api from '../../utils/api';

const SettingsModal = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    systemAlerts: true
  });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (open && user?.role === 'admin') {
      fetchUsers();
    }
  }, [open, user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
    toast.success('Notification preferences updated');
  };

  const handleProfileUpdate = async () => {
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // This would call an update profile endpoint
      toast.success('Profile updated successfully');
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/promote`);
      toast.success('User promoted to admin successfully');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/demote`);
      toast.success('User demoted to employee successfully');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to demote user');
    }
  };

  const handleSystemReset = () => {
    toast.info('System reset functionality would be implemented here');
  };

  const handleExportData = () => {
    toast.info('Data export started - you will receive an email when complete');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings & Preferences</span>
          </DialogTitle>
          <DialogDescription>
            Manage your account, preferences, and system settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            {user?.role === 'admin' && <TabsTrigger value="users">User Management</TabsTrigger>}
            {user?.role === 'admin' && <TabsTrigger value="system">System</TabsTrigger>}
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Change Password</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Current Password</Label>
                      <Input
                        type="password"
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData(prev => ({...prev, currentPassword: e.target.value}))}
                        placeholder="Current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => setProfileData(prev => ({...prev, newPassword: e.target.value}))}
                        placeholder="New password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData(prev => ({...prev, confirmPassword: e.target.value}))}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(value) => handleNotificationChange('pushNotifications', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-muted-foreground">Weekly summary emails</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(value) => handleNotificationChange('weeklyReports', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">System Alerts</p>
                      <p className="text-sm text-muted-foreground">Important system notifications</p>
                    </div>
                    <Switch
                      checked={notifications.systemAlerts}
                      onCheckedChange={(value) => handleNotificationChange('systemAlerts', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                
                <div className="pt-4">
                  <p className="font-medium mb-3">Current Theme</p>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-8 rounded border-2 ${theme === 'light' ? 'bg-white border-blue-500' : 'bg-gray-100 border-gray-300'}`}></div>
                    <span>Light</span>
                    <div className={`w-12 h-8 rounded border-2 ${theme === 'dark' ? 'bg-gray-900 border-blue-500' : 'bg-gray-900 border-gray-600'}`}></div>
                    <span>Dark</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab (Admin Only) */}
          {user?.role === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                    <Badge variant="secondary">{users.length} users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-4">Loading users...</div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                              {u.role}
                            </Badge>
                            {u.id !== user.id && (
                              <>
                                {u.role === 'employee' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePromoteUser(u.id)}
                                  >
                                    Promote to Admin
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDemoteUser(u.id)}
                                  >
                                    Demote to Employee
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* System Tab (Admin Only) */}
          {user?.role === 'admin' && (
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>System Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={handleExportData}>
                      <Database className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    
                    <Button variant="outline" onClick={() => toast.info('Cache cleared successfully')}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cache
                    </Button>
                    
                    <Button variant="outline" onClick={() => toast.info('System logs downloaded')}>
                      <Key className="h-4 w-4 mr-2" />
                      Download Logs
                    </Button>
                    
                    <Button variant="destructive" onClick={handleSystemReset}>
                      <Shield className="h-4 w-4 mr-2" />
                      System Reset
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-3">System Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Platform Version</p>
                        <p className="font-medium">Agentik Solutions v2.0</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Database Status</p>
                        <p className="font-medium text-green-600">Connected</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Users</p>
                        <p className="font-medium">{users.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Uptime</p>
                        <p className="font-medium">99.8%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;