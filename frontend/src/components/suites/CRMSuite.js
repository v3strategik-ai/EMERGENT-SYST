import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, DollarSign, TrendingUp, BarChart3, Plus, Upload, FileDown } from 'lucide-react';

const CRMSuite = () => {
  const metrics = [
    { title: 'Total Pipeline Value', value: '$1.47M', change: '+18.5%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Active Leads', value: '35', change: '+12%', icon: Users, color: 'text-blue-500' },
    { title: 'Conversion Rate', value: '24.8%', change: '+3.2%', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Avg Deal Size', value: '$42K', change: '+8.7%', icon: BarChart3, color: 'text-orange-500' }
  ];

  const pipelineStages = [
    { stage: 'Lead', count: 12, value: '$450K', color: 'bg-gray-500' },
    { stage: 'Qualified', count: 8, value: '$320K', color: 'bg-blue-500' },
    { stage: 'Discovery', count: 6, value: '$280K', color: 'bg-yellow-500' },
    { stage: 'Proposal', count: 4, value: '$180K', color: 'bg-orange-500' },
    { stage: 'Negotiation', count: 3, value: '$150K', color: 'bg-purple-500' },
    { stage: 'Closed Won', count: 2, value: '$95K', color: 'bg-green-500' }
  ];

  return (
    <div className='space-y-6' data-testid='crm-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Users className='h-6 w-6 text-purple-500' />
            <span>Advanced CRM Suite</span>
          </CardTitle>
          <CardDescription>
            Salesforce-inspired customer relationship management with AI intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Action Buttons */}
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-purple-600 hover:bg-purple-700'>
              <Plus className='h-4 w-4 mr-2' />
              New Lead
              <Badge variant='secondary' className='ml-2'>12</Badge>
            </Button>
            <Button variant='outline' className='border-green-600 text-green-600'>
              <Upload className='h-4 w-4 mr-2' />
              Import Leads
              <Badge variant='secondary' className='ml-2'>13</Badge>
            </Button>
            <Button variant='outline' className='border-blue-600 text-blue-600'>
              <FileDown className='h-4 w-4 mr-2' />
              Export Data
              <Badge variant='secondary' className='ml-2'>14</Badge>
            </Button>
          </div>

          {/* Metrics Grid */}
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

          {/* Sales Pipeline */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                <BarChart3 className='h-5 w-5' />
                <span>Sales Pipeline Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
                {pipelineStages.map((stage, idx) => (
                  <Card key={idx} className='bg-card border-border'>
                    <CardContent className='p-4 text-center'>
                      <h3 className='font-semibold text-sm mb-2'>{stage.stage}</h3>
                      <p className='text-2xl font-bold mb-1'>{stage.count}</p>
                      <p className='text-xs text-muted-foreground mb-2'>{stage.value}</p>
                      <div className={`h-2 rounded-full ${stage.color}`}></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRMSuite;
