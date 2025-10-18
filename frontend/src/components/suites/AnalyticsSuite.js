import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { BarChart3, TrendingUp, DollarSign, Activity, Download, Share2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { analyticsAPI } from '../../utils/crmAPI';

const AnalyticsSuite = () => {
  const [newDashboardOpen, setNewDashboardOpen] = useState(false);
  const [dashboardName, setDashboardName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateDashboard = async () => {
    if (dashboardName.trim()) {
      setLoading(true);
      try {
        await analyticsAPI.createDashboard({
          name: dashboardName,
          dashboard_type: 'Custom',
          widgets: [],
          config: {}
        });
        toast.success(`Dashboard "${dashboardName}" created successfully!`);
        setNewDashboardOpen(false);
        setDashboardName('');
      } catch (error) {
        toast.error('Failed to create dashboard');
      } finally {
        setLoading(false);
      }
    }
  };
  const metrics = [
    { title: 'Total Analytics', value: '2,847', change: '+156 this month', icon: BarChart3, color: 'text-blue-500' },
    { title: 'Active Dashboards', value: '23', change: '+5 new', icon: Activity, color: 'text-green-500' },
    { title: 'Data Points', value: '1.2M', change: '+234K', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Insights Generated', value: '847', change: '+89 today', icon: DollarSign, color: 'text-orange-500' }
  ];

  const dashboards = [
    { name: 'Sales Performance', type: 'Real-time', users: '45', icon: TrendingUp, color: 'bg-blue-600' },
    { name: 'Customer Analytics', type: 'Daily', users: '123', icon: Activity, color: 'bg-green-600' },
    { name: 'Financial Insights', type: 'Weekly', users: '67', icon: DollarSign, color: 'bg-purple-600' },
    { name: 'Operations KPIs', type: 'Monthly', users: '34', icon: BarChart3, color: 'bg-orange-600' }
  ];

  return (
    <div className="space-y-6" data-testid="analytics-suite">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-blue-500" />
            <span>Advanced Analytics Suite</span>
          </CardTitle>
          <CardDescription>
            Comprehensive data analytics with AI-powered insights and predictive modeling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setNewDashboardOpen(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              New Dashboard
              <Badge variant="secondary" className="ml-2">2</Badge>
            </Button>
            <Button variant="outline" onClick={() => toast.success('Data exported successfully!')}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
              <Badge variant="secondary" className="ml-2">3</Badge>
            </Button>
            <Button variant="outline" onClick={() => toast.success('Report shared successfully!')}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metrics.map((metric, idx) => (
              <Card key={idx} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold mt-2">{metric.value}</p>
                      <p className={`text-sm mt-1 ${metric.color}`}>{metric.change}</p>
                    </div>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Active Dashboards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboards.map((dash, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => toast.success(`Opening ${dash.name} dashboard...`)}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${dash.color}`}>
                        <dash.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">{dash.name}</h4>
                        <p className="text-xs text-muted-foreground">{dash.type}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{dash.users} users</span>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toast.info(`Viewing ${dash.name}`); }}>
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={newDashboardOpen} onOpenChange={setNewDashboardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
            <DialogDescription>Design a custom analytics dashboard</DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='dashboard-name'>Dashboard Name</Label>
              <Input
                id='dashboard-name'
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder='e.g., Q4 Sales Performance'
              />
            </div>
            <div className='flex justify-end space-x-2'>
              <Button variant='outline' onClick={() => setNewDashboardOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDashboard} disabled={loading}>
                <Plus className='h-4 w-4 mr-2' />
                {loading ? 'Creating...' : 'Create Dashboard'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalyticsSuite;
