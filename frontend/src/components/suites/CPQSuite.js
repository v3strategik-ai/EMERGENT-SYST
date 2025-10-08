import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, DollarSign, TrendingUp, Clock, Plus, Settings, Download } from 'lucide-react';

const CPQSuite = () => {
  const metrics = [
    { title: 'Active Quotes', value: '89', change: '+12 this week', icon: FileText, color: 'text-blue-500' },
    { title: 'Quote Value', value: '$1.2M', change: '+18.5%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Conversion Rate', value: '67.3%', change: '+5.2%', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Avg Quote Time', value: '2.4h', change: '-0.8h', icon: Clock, color: 'text-orange-500' }
  ];

  const templates = [
    { name: 'Standard Service', status: 'Active', uses: '45', icon: FileText, color: 'bg-blue-600' },
    { name: 'Enterprise Package', status: 'Active', uses: '23', icon: FileText, color: 'bg-green-600' },
    { name: 'Custom Solution', status: 'Draft', uses: '12', icon: FileText, color: 'bg-yellow-600' },
    { name: 'Maintenance Plan', status: 'Active', uses: '67', icon: FileText, color: 'bg-purple-600' }
  ];

  const recentQuotes = [
    { id: 'Q-2024-001', client: 'Acme Corp', value: '$45,000', status: 'Pending', date: '2024-09-20' },
    { id: 'Q-2024-002', client: 'TechStart Inc', value: '$78,500', status: 'Approved', date: '2024-09-19' },
    { id: 'Q-2024-003', client: 'Global Solutions', value: '$125,000', status: 'In Review', date: '2024-09-18' },
    { id: 'Q-2024-004', client: 'Innovation Labs', value: '$32,000', status: 'Draft', date: '2024-09-17' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Approved': 'text-green-500',
      'Pending': 'text-yellow-500',
      'In Review': 'text-blue-500',
      'Draft': 'text-gray-500'
    };
    return colors[status] || 'text-gray-500';
  };

  return (
    <div className='space-y-6' data-testid='cpq-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <FileText className='h-6 w-6 text-blue-500' />
            <span>Robust CPQ Suite</span>
          </CardTitle>
          <CardDescription>
            Configure, Price, Quote - AI-powered pricing optimization and quote generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-blue-600 hover:bg-blue-700'>
              <Plus className='h-4 w-4 mr-2' />
              Create Quote
              <Badge variant='secondary' className='ml-2'>1</Badge>
            </Button>
            <Button variant='outline'>
              <Settings className='h-4 w-4 mr-2' />
              Price Calculator
            </Button>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Export Quotes
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Quote Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {templates.map((template, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 border border-border rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div className={`p-2 rounded-lg ${template.color}`}>
                          <template.icon className='h-4 w-4 text-white' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-sm'>{template.name}</h4>
                          <p className='text-xs text-muted-foreground'>{template.uses} uses this month</p>
                        </div>
                      </div>
                      <Badge variant={template.status === 'Active' ? 'default' : 'secondary'}>
                        {template.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {recentQuotes.map((quote, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 border border-border rounded-lg'>
                      <div>
                        <h4 className='font-semibold text-sm'>{quote.id}</h4>
                        <p className='text-xs text-muted-foreground'>{quote.client}</p>
                      </div>
                      <div className='text-right'>
                        <p className='font-bold text-sm'>{quote.value}</p>
                        <p className={`text-xs ${getStatusColor(quote.status)}`}>{quote.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CPQSuite;
