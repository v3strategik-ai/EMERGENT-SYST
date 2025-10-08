import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { TrendingUp, Target, Users, DollarSign, Plus, Download, Share2 } from 'lucide-react';

const SalesSuite = () => {
  const metrics = [
    { title: 'Monthly Revenue', value: '$2.4M', change: '+18.2%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Deals Closed', value: '67', change: '+12 this week', icon: Target, color: 'text-blue-500' },
    { title: 'Sales Team', value: '23', change: '+3 new reps', icon: Users, color: 'text-purple-500' },
    { title: 'Quota Attainment', value: '124%', change: '+8% over target', icon: TrendingUp, color: 'text-orange-500' }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', deals: 23, revenue: '$456K', quota: '142%', trend: '+23%' },
    { name: 'Michael Chen', deals: 19, revenue: '$389K', quota: '128%', trend: '+18%' },
    { name: 'Emily Rodriguez', deals: 17, revenue: '$342K', quota: '119%', trend: '+15%' },
    { name: 'David Park', deals: 15, revenue: '$298K', quota: '112%', trend: '+12%' }
  ];

  const territories = [
    { region: 'North America', revenue: '$1.2M', deals: 34, growth: '+24%' },
    { region: 'Europe', revenue: '$780K', deals: 18, growth: '+19%' },
    { region: 'Asia Pacific', revenue: '$420K', deals: 15, growth: '+31%' }
  ];

  return (
    <div className='space-y-6' data-testid='sales-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <TrendingUp className='h-6 w-6 text-green-500' />
            <span>Sales Performance Suite</span>
          </CardTitle>
          <CardDescription>
            Comprehensive sales analytics, forecasting, and team performance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-green-600 hover:bg-green-700'>
              <Plus className='h-4 w-4 mr-2' />
              New Deal
              <Badge variant='secondary' className='ml-2'>7</Badge>
            </Button>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Export Report
            </Button>
            <Button variant='outline'>
              <Share2 className='h-4 w-4 mr-2' />
              Share Dashboard
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
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {topPerformers.map((performer, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 border border-border rounded-lg'>
                      <div>
                        <h4 className='font-semibold'>{performer.name}</h4>
                        <p className='text-sm text-muted-foreground'>{performer.deals} deals • {performer.revenue}</p>
                      </div>
                      <div className='text-right'>
                        <Badge variant='default'>{performer.quota}</Badge>
                        <p className='text-sm text-green-500 mt-1'>{performer.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Territory Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {territories.map((territory, idx) => (
                    <div key={idx} className='p-4 border border-border rounded-lg'>
                      <div className='flex justify-between items-center mb-2'>
                        <h4 className='font-semibold'>{territory.region}</h4>
                        <Badge variant='outline'>{territory.growth}</Badge>
                      </div>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='text-muted-foreground'>Revenue</p>
                          <p className='font-bold'>{territory.revenue}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>Deals</p>
                          <p className='font-bold'>{territory.deals}</p>
                        </div>
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

export default SalesSuite;
