import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { DollarSign, Users, TrendingUp, Activity, Bot, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, FileText, CreditCard, Calendar, BarChart3, Zap, Lock, Database } from 'lucide-react';
import { toast } from 'sonner';
import NewLeadModal from '../modals/NewLeadModal';
import NewQuoteModal from '../modals/NewQuoteModal';
import NewTransactionModal from '../modals/NewTransactionModal';

const Dashboard = () => {
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  
  const handleQuickAction = (action) => {
    switch(action) {
      case 'New Lead':
        setLeadModalOpen(true);
        break;
      case 'Create Quote':
        setQuoteModalOpen(true);
        break;
      case 'Send Invoice':
        setInvoiceModalOpen(true);
        break;
      case 'Schedule Meeting':
        toast.success('Opening calendar to schedule meeting...');
        break;
      case 'Generate Report':
        toast.success('Generating comprehensive report...');
        break;
      case 'AI Analysis':
        toast.success('Running AI analysis on your data...');
        break;
      case 'Security Scan':
        toast.success('Initiating security scan...');
        break;
      case 'Backup Data':
        toast.success('Starting data backup process...');
        break;
      default:
        toast.info(`Opening ${action}...`);
    }
  };
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$18.9M',
      change: '+15.2% this month',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Active Users',
      value: '12,847',
      change: '+8.7% this week',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Conversion Rate',
      value: '4.2%',
      change: '+0.8% improvement',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: 'System Efficiency',
      value: '98.7%',
      change: 'Optimal performance',
      icon: Activity,
      color: 'text-orange-500'
    },
    {
      title: 'AI Accuracy',
      value: '97.3%',
      change: 'Machine learning',
      icon: Bot,
      color: 'text-cyan-500'
    },
    {
      title: 'Security Score',
      value: '99.8%',
      change: 'Enterprise grade',
      icon: Shield,
      color: 'text-red-500'
    }
  ];

  const quickActions = [
    { title: 'New Lead', icon: Plus, color: 'bg-red-600', badge: '12' },
    { title: 'Create Quote', icon: FileText, color: 'bg-green-600', badge: '13' },
    { title: 'Send Invoice', icon: CreditCard, color: 'bg-blue-600', badge: '14' },
    { title: 'Schedule Meeting', icon: Calendar, color: 'bg-orange-600', badge: '15' },
    { title: 'Generate Report', icon: BarChart3, color: 'bg-purple-600', badge: '16' },
    { title: 'AI Analysis', icon: Zap, color: 'bg-teal-600', badge: '17' },
    { title: 'Security Scan', icon: Lock, color: 'bg-pink-600', badge: '18' },
    { title: 'Backup Data', icon: Database, color: 'bg-indigo-600', badge: '19' }
  ];

  return (
    <div className='space-y-6' data-testid='dashboard-view'>
      {/* Metrics Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {metrics.map((metric, idx) => (
          <Card key={idx} className='bg-card border-border hover:shadow-lg transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>{metric.title}</p>
                  <p className='text-3xl font-bold mt-2'>{metric.value}</p>
                  <p className={`text-sm mt-2 ${metric.color}`}>{metric.change}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className='bg-card border-border'>
        <CardContent className='p-6'>
          <div className='flex items-center space-x-2 mb-6'>
            <Bot className='h-5 w-5' />
            <h3 className='text-xl font-semibold'>Quick Actions</h3>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4'>
            {quickActions.map((action, idx) => (
              <Button
                key={idx}
                variant='outline'
                className={`relative h-20 flex-col space-y-2 ${action.color} text-white border-none hover:opacity-80 transition-opacity`}
                onClick={() => handleQuickAction(action.title)}
              >
                <action.icon className='h-6 w-6' />
                <span className='text-xs'>{action.title}</span>
                <Badge variant='secondary' className='absolute -top-2 -right-2 text-xs'>
                  +{action.badge}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <NewLeadModal open={leadModalOpen} onOpenChange={setLeadModalOpen} onSuccess={() => toast.success('Lead created!')} />
      <NewQuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} onSuccess={() => toast.success('Quote created!')} />
      <NewTransactionModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} onSuccess={() => toast.success('Invoice processed!')} />
    </div>
  );
};

export default Dashboard;
