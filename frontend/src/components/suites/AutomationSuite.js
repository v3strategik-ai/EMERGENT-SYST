import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Zap, GitBranch, Clock, CheckCircle, Plus, Play, Pause, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { workflowAPI } from '../../utils/crmAPI';
import NewWorkflowModal from '../modals/NewWorkflowModal';

const AutomationSuite = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await workflowAPI.getWorkflows();
      setWorkflows(response.data);
    } catch (error) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await workflowAPI.updateWorkflow(id, { status: newStatus });
      toast.success(`Workflow ${newStatus.toLowerCase()}`);
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to update workflow');
    }
  };

  const handleDelete = async (id) => {
    try {
      await workflowAPI.deleteWorkflow(id);
      toast.success('Workflow deleted');
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const activeCount = workflows.filter(w => w.status === 'Active').length;
  const totalRuns = workflows.reduce((sum, w) => sum + (w.run_count || 0), 0);
  const metrics = [
    { title: 'Active Workflows', value: '127', change: '+23 this month', icon: Zap, color: 'text-blue-500' },
    { title: 'Tasks Automated', value: '8,942', change: '+1,234 today', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Time Saved', value: '847h', change: '+156h this week', icon: Clock, color: 'text-purple-500' },
    { title: 'Success Rate', value: '99.4%', change: '+0.3% improvement', icon: GitBranch, color: 'text-orange-500' }
  ];

  const workflows = [
    { name: 'Lead Auto-Assignment', status: 'Active', triggers: '342/day', icon: GitBranch, color: 'bg-green-600' },
    { name: 'Invoice Generation', status: 'Active', triggers: '89/day', icon: CheckCircle, color: 'bg-blue-600' },
    { name: 'Email Follow-ups', status: 'Active', triggers: '567/day', icon: Zap, color: 'bg-purple-600' },
    { name: 'Report Scheduling', status: 'Paused', triggers: '45/day', icon: Clock, color: 'bg-orange-600' },
    { name: 'Data Backup', status: 'Active', triggers: '24/day', icon: GitBranch, color: 'bg-teal-600' },
    { name: 'Slack Notifications', status: 'Active', triggers: '789/day', icon: Zap, color: 'bg-pink-600' }
  ];

  return (
    <div className='space-y-6' data-testid='automation-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Zap className='h-6 w-6 text-purple-500' />
            <span>Workflow Automation Suite</span>
          </CardTitle>
          <CardDescription>
            Automate repetitive tasks with powerful workflow engine and AI triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-purple-600 hover:bg-purple-700'>
              <Plus className='h-4 w-4 mr-2' />
              New Workflow
              <Badge variant='secondary' className='ml-2'>1</Badge>
            </Button>
            <Button variant='outline'>
              <Play className='h-4 w-4 mr-2' />
              Run All
            </Button>
            <Button variant='outline'>
              <Pause className='h-4 w-4 mr-2' />
              Pause All
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
            {metrics.map((metric, idx) => (
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

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {workflows.map((workflow, idx) => (
                  <div key={idx} className='p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-colors'>
                    <div className='flex items-center space-x-3 mb-3'>
                      <div className={`p-2 rounded-lg ${workflow.color}`}>
                        <workflow.icon className='h-5 w-5 text-white' />
                      </div>
                      <div>
                        <h4 className='font-semibold text-sm'>{workflow.name}</h4>
                        <p className='text-xs text-muted-foreground'>{workflow.triggers}</p>
                      </div>
                    </div>
                    <div className='flex justify-between items-center'>
                      <Badge variant={workflow.status === 'Active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      <Button size='sm' variant='outline'>Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationSuite;
