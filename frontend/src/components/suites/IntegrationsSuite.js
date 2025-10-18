import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Switch } from '../ui/switch.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Zap, 
  MessageSquare, 
  Video, 
  Users, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Plus, 
  RefreshCw as Sync, 
  Database,
  Calendar,
  FileText,
  Bell,
  Activity,
  CloudIcon
} from 'lucide-react';
import { toast } from 'sonner';

const IntegrationsSuite = () => {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  
  // Connection states for each platform
  const [integrations, setIntegrations] = useState({
    salesforce: {
      name: 'Salesforce CRM',
      icon: Database,
      color: 'bg-blue-600',
      connected: false,
      status: 'Disconnected',
      lastSync: null,
      features: {
        leadSync: false,
        contactSync: false,
        dealTracking: false,
        opportunityPipeline: false
      },
      metrics: {
        syncedLeads: 0,
        syncedContacts: 0,
        activeDeals: 0
      }
    },
    slack: {
      name: 'Slack Workspace',
      icon: MessageSquare,
      color: 'bg-purple-600',
      connected: true,
      status: 'Connected',
      lastSync: '2 minutes ago',
      features: {
        notifications: true,
        automatedUpdates: true,
        botIntegration: false,
        channelManagement: true
      },
      metrics: {
        activeChannels: 12,
        dailyMessages: 847,
        automations: 5
      }
    },
    zoom: {
      name: 'Zoom Meetings',
      icon: Video,
      color: 'bg-blue-500',
      connected: true,
      status: 'Connected',
      lastSync: '5 minutes ago',
      features: {
        meetingScheduling: true,
        calendarSync: true,
        recordingManagement: false,
        participantTracking: true
      },
      metrics: {
        scheduledMeetings: 23,
        totalParticipants: 156,
        recordings: 8
      }
    }
  });

  const handleConnect = (platform) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        connected: !prev[platform].connected,
        status: prev[platform].connected ? 'Disconnected' : 'Connected',
        lastSync: prev[platform].connected ? null : 'Just now'
      }
    }));
    toast.success(`${integrations[platform].name} ${integrations[platform].connected ? 'disconnected' : 'connected'} successfully!`);
  };

  const handleSync = (platform) => {
    setSyncModalOpen(true);
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          lastSync: 'Just now'
        }
      }));
      setSyncModalOpen(false);
      toast.success(`${integrations[platform].name} synced successfully!`);
    }, 2000);
  };

  const handleFeatureToggle = (platform, feature) => {
    setIntegrations(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        features: {
          ...prev[platform].features,
          [feature]: !prev[platform].features[feature]
        }
      }
    }));
    toast.success(`${feature} ${integrations[platform].features[feature] ? 'disabled' : 'enabled'} for ${integrations[platform].name}`);
  };

  const connectedCount = Object.values(integrations).filter(i => i.connected).length;
  const totalSyncs = Object.values(integrations).filter(i => i.lastSync).length;

  const overallMetrics = [
    { title: 'Connected Apps', value: `${connectedCount}/3`, change: '+1 this week', icon: CloudIcon, color: 'text-green-500' },
    { title: 'Data Syncs Today', value: '47', change: '+12 new', icon: Sync, color: 'text-blue-500' },
    { title: 'Active Automations', value: '23', change: '+5 running', icon: Zap, color: 'text-purple-500' },
    { title: 'API Calls (24h)', value: '2.4K', change: '+15.2%', icon: Activity, color: 'text-orange-500' }
  ];

  return (
    <div className='space-y-6' data-testid='integrations-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Zap className='h-6 w-6 text-purple-500' />
            <span>Platform Integrations</span>
          </CardTitle>
          <CardDescription>
            Seamless connectivity to Salesforce, Slack, Zoom and other business platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Action Buttons */}
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-purple-600 hover:bg-purple-700' onClick={() => setConfigModalOpen(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Add Integration
            </Button>
            <Button variant='outline' onClick={() => toast.info('Running sync for all connected platforms...')}>
              <Sync className='h-4 w-4 mr-2' />
              Sync All
            </Button>
            <Button variant='outline' onClick={() => toast.info('Opening integration marketplace...')}>
              <Settings className='h-4 w-4 mr-2' />
              Marketplace
            </Button>
          </div>

          {/* Overall Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
            {overallMetrics.map((metric, idx) => (
              <Card key={idx} className='bg-card border-border'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>{metric.title}</p>
                      <p className='text-2xl font-bold mt-2'>{metric.value}</p>
                      <p className={`text-sm mt-1 ${metric.color}`}>{metric.change}</p>
                    </div>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Platforms */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {Object.entries(integrations).map(([key, integration]) => (
              <Card key={key} className='bg-card border-border'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-3'>
                      <div className={`p-3 rounded-lg ${integration.color}`}>
                        <integration.icon className='h-6 w-6 text-white' />
                      </div>
                      <div>
                        <CardTitle className='text-lg'>{integration.name}</CardTitle>
                        <div className='flex items-center space-x-2 mt-1'>
                          {integration.connected ? (
                            <CheckCircle className='h-4 w-4 text-green-500' />
                          ) : (
                            <XCircle className='h-4 w-4 text-red-500' />
                          )}
                          <span className={`text-sm ${integration.connected ? 'text-green-500' : 'text-red-500'}`}>
                            {integration.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={integration.connected}
                      onCheckedChange={() => handleConnect(key)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {integration.connected && (
                    <>
                      <div className='mb-4'>
                        <p className='text-xs text-muted-foreground mb-2'>Last Sync: {integration.lastSync}</p>
                        <div className='grid grid-cols-2 gap-4 text-sm'>
                          {Object.entries(integration.metrics).map(([metricKey, value]) => (
                            <div key={metricKey}>
                              <p className='text-muted-foreground capitalize'>{metricKey.replace(/([A-Z])/g, ' $1')}</p>
                              <p className='font-bold'>{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className='space-y-2 mb-4'>
                        <h4 className='font-semibold text-sm'>Features</h4>
                        {Object.entries(integration.features).map(([feature, enabled]) => (
                          <div key={feature} className='flex items-center justify-between'>
                            <span className='text-sm capitalize'>{feature.replace(/([A-Z])/g, ' $1')}</span>
                            <Switch
                              checked={enabled}
                              onCheckedChange={() => handleFeatureToggle(key, feature)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className='flex space-x-2'>
                    <Button 
                      size='sm' 
                      variant='outline' 
                      className='flex-1'
                      onClick={() => {
                        setSelectedIntegration(key);
                        setConfigModalOpen(true);
                      }}
                    >
                      <Settings className='h-4 w-4 mr-1' />
                      Configure
                    </Button>
                    {integration.connected && (
                      <Button 
                        size='sm' 
                        variant='outline'
                        onClick={() => handleSync(key)}
                      >
                        <Sync className='h-4 w-4 mr-1' />
                        Sync
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Details Tabs */}
          <Card className='bg-card border-border mt-6'>
            <CardHeader>
              <CardTitle>Integration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="salesforce" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="salesforce">Salesforce CRM</TabsTrigger>
                  <TabsTrigger value="slack">Slack Workspace</TabsTrigger>
                  <TabsTrigger value="zoom">Zoom Meetings</TabsTrigger>
                </TabsList>

                <TabsContent value="salesforce" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Data Sync Options</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Lead Synchronization</span>
                          <Badge variant="outline">Bi-directional</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Contact Management</span>
                          <Badge variant="outline">Real-time</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Opportunity Pipeline</span>
                          <Badge variant="outline">Daily</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Deal Tracking</span>
                          <Badge variant="outline">Hourly</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Sync Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Records Synced</span>
                            <span className="font-semibold">1,234</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Last Full Sync</span>
                            <span className="font-semibold">2 hours ago</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Sync Success Rate</span>
                            <span className="font-semibold text-green-500">99.2%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="slack" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notification Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>New Lead Alerts</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Deal Updates</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Meeting Reminders</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Daily Reports</span>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Channel Management</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">#sales-updates</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">#crm-notifications</span>
                            <Badge variant="default">Active</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">#team-alerts</span>
                            <Badge variant="secondary">Inactive</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="zoom" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Meeting Configuration</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>Auto-schedule from CRM</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Calendar Sync</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Recording Auto-save</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Participant Analytics</span>
                          <Switch defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Meeting Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">This Week's Meetings</span>
                            <span className="font-semibold">23</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total Participants</span>
                            <span className="font-semibold">156</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Avg Meeting Duration</span>
                            <span className="font-semibold">42 min</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Recordings Created</span>
                            <span className="font-semibold">8</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Configuration Modal */}
      <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Integration Configuration</DialogTitle>
            <DialogDescription>Configure your platform integration settings</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label>API Endpoint</Label>
              <Input placeholder='https://api.platform.com' />
            </div>
            <div className='space-y-2'>
              <Label>API Key</Label>
              <Input type='password' placeholder='Enter your API key' />
            </div>
            <div className='space-y-2'>
              <Label>Sync Frequency</Label>
              <select className='w-full p-2 border border-border rounded'>
                <option>Real-time</option>
                <option>Every 15 minutes</option>
                <option>Hourly</option>
                <option>Daily</option>
              </select>
            </div>
            <div className='flex justify-end space-x-2 pt-4'>
              <Button variant='outline' onClick={() => setConfigModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setConfigModalOpen(false);
                toast.success('Integration configured successfully!');
              }}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sync Modal */}
      <Dialog open={syncModalOpen} onOpenChange={setSyncModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Syncing Data</DialogTitle>
            <DialogDescription>Please wait while we sync your data...</DialogDescription>
          </DialogHeader>
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsSuite;