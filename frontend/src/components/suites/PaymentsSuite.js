import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CreditCard, DollarSign, TrendingUp, RefreshCw, Plus, Download, Settings } from 'lucide-react';

const PaymentsSuite = () => {
  const metrics = [
    { title: 'Total Processed', value: '$3.2M', change: '+22.4%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Transactions', value: '2,847', change: '+156 today', icon: CreditCard, color: 'text-blue-500' },
    { title: 'Success Rate', value: '99.2%', change: '+0.3%', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Recurring', value: '847', change: '+89 active', icon: RefreshCw, color: 'text-orange-500' }
  ];

  const gateways = [
    { name: 'Stripe', status: 'Active', volume: '$1.2M', icon: CreditCard, color: 'bg-blue-600' },
    { name: 'PayPal', status: 'Active', volume: '$890K', icon: CreditCard, color: 'bg-blue-500' },
    { name: 'Square', status: 'Active', volume: '$650K', icon: CreditCard, color: 'bg-black' },
    { name: 'Authorize.net', status: 'Inactive', volume: '$0', icon: CreditCard, color: 'bg-gray-600' }
  ];

  const recentTransactions = [
    { id: 'TRX-001', customer: 'Acme Corp', amount: '$5,430', status: 'Completed', gateway: 'Stripe' },
    { id: 'TRX-002', customer: 'TechStart Inc', amount: '$2,150', status: 'Completed', gateway: 'PayPal' },
    { id: 'TRX-003', customer: 'Global Solutions', amount: '$8,920', status: 'Pending', gateway: 'Stripe' },
    { id: 'TRX-004', customer: 'Innovation Labs', amount: '$3,670', status: 'Completed', gateway: 'Square' },
    { id: 'TRX-005', customer: 'Digital Dynamics', amount: '$1,890', status: 'Failed', gateway: 'PayPal' }
  ];

  const recurringPlans = [
    { plan: 'Basic Plan', subscribers: 234, mrr: '$23,400', status: 'Active' },
    { plan: 'Pro Plan', subscribers: 89, mrr: '$44,500', status: 'Active' },
    { plan: 'Enterprise Plan', subscribers: 12, mrr: '$36,000', status: 'Active' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'text-green-500',
      'Pending': 'text-yellow-500',
      'Failed': 'text-red-500'
    };
    return colors[status] || 'text-gray-500';
  };

  return (
    <div className='space-y-6' data-testid='payments-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <CreditCard className='h-6 w-6 text-blue-500' />
            <span>Multi-Gateway Payment Suite</span>
          </CardTitle>
          <CardDescription>
            Integrated payment processing with multiple gateways, recurring billing, and fraud detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-blue-600 hover:bg-blue-700'>
              <Plus className='h-4 w-4 mr-2' />
              Process Payment
              <Badge variant='secondary' className='ml-2'>11</Badge>
            </Button>
            <Button variant='outline'>
              <Settings className='h-4 w-4 mr-2' />
              Gateway Settings
            </Button>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Export Transactions
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Payment Gateways</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {gateways.map((gateway, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 border border-border rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div className={`p-2 rounded-lg ${gateway.color}`}>
                          <gateway.icon className='h-4 w-4 text-white' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-sm'>{gateway.name}</h4>
                          <p className='text-xs text-muted-foreground'>{gateway.volume} volume</p>
                        </div>
                      </div>
                      <Badge variant={gateway.status === 'Active' ? 'default' : 'secondary'}>
                        {gateway.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Recurring Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {recurringPlans.map((plan, idx) => (
                    <div key={idx} className='p-3 border border-border rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-semibold text-sm'>{plan.plan}</h4>
                        <Badge variant='outline'>{plan.status}</Badge>
                      </div>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='text-muted-foreground'>Subscribers</p>
                          <p className='font-bold'>{plan.subscribers}</p>
                        </div>
                        <div>
                          <p className='text-muted-foreground'>MRR</p>
                          <p className='font-bold'>{plan.mrr}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {recentTransactions.map((transaction, idx) => (
                  <div key={idx} className='flex items-center justify-between p-3 border border-border rounded-lg'>
                    <div>
                      <h4 className='font-semibold text-sm'>{transaction.id}</h4>
                      <p className='text-xs text-muted-foreground'>{transaction.customer}</p>
                    </div>
                    <div className='flex items-center space-x-4'>
                      <span className='text-xs text-muted-foreground'>{transaction.gateway}</span>
                      <span className='font-bold'>{transaction.amount}</span>
                      <Badge className={getStatusColor(transaction.status)} variant='outline'>
                        {transaction.status}
                      </Badge>
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

export default PaymentsSuite;
