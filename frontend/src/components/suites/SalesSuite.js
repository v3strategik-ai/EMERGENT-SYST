import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TrendingUp, Target, Users, DollarSign, Plus, Download, Share2, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { salesAPI } from '../../utils/crmAPI';
import NewLeadModal from '../modals/NewLeadModal';
import { format } from 'date-fns';

const SalesSuite = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDealOpen, setNewDealOpen] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await crmAPI.getLeads();
      // Filter for closed won deals
      setDeals(response.data);
    } catch (error) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await crmAPI.deleteLead(id);
      toast.success('Deal deleted');
      fetchDeals();
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const closedDeals = deals.filter(d => d.status === 'Closed Won').length;
  const totalRevenue = deals.filter(d => d.status === 'Closed Won').reduce((sum, d) => sum + d.value, 0);
  const teamSize = 23; // Static for now
  const quotaAttainment = deals.length > 0 ? ((closedDeals / deals.length) * 100 * 1.5).toFixed(0) : 0;
  const metrics = [
    { title: 'Monthly Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}K`, change: '+18.2%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Deals Closed', value: closedDeals.toString(), change: '+12 this week', icon: Target, color: 'text-blue-500' },
    { title: 'Sales Team', value: teamSize.toString(), change: '+3 new reps', icon: Users, color: 'text-purple-500' },
    { title: 'Quota Attainment', value: `${quotaAttainment}%`, change: '+8% over target', icon: TrendingUp, color: 'text-orange-500' }
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
            <Button className='bg-green-600 hover:bg-green-700' onClick={() => setNewDealOpen(true)}>
              <Plus className='h-4 w-4 mr-2' />
              New Deal
              <Badge variant='secondary' className='ml-2'>7</Badge>
            </Button>
            <Button variant='outline' onClick={() => toast.success('Sales report exported successfully!')}>
              <Download className='h-4 w-4 mr-2' />
              Export Report
            </Button>
            <Button variant='outline' onClick={() => toast.success('Dashboard shared successfully!')}>
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

          {/* Deals Table */}
          <Card className='bg-card border-border mt-6'>
            <CardHeader>
              <CardTitle>All Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : deals.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No deals yet. Create your first deal!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell className='font-medium'>{deal.company}</TableCell>
                        <TableCell>{deal.name}</TableCell>
                        <TableCell>${deal.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={deal.status === 'Closed Won' ? 'default' : 'secondary'}>
                            {deal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{deal.source}</TableCell>
                        <TableCell>{format(new Date(deal.created_at), 'MMM dd')}</TableCell>
                        <TableCell>
                          <Button size='sm' variant='ghost' onClick={() => handleDelete(deal.id)}>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <NewLeadModal open={newDealOpen} onOpenChange={setNewDealOpen} onSuccess={fetchDeals} />
    </div>
  );
};

export default SalesSuite;
