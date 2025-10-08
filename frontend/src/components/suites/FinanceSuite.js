import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DollarSign, TrendingUp, PieChart, BarChart3, Plus, Download, FileText } from 'lucide-react';

const FinanceSuite = () => {
  const metrics = [
    { title: 'Total Revenue', value: '$2.8M', change: '+15.2%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Profit Margin', value: '28.4%', change: '+3.1%', icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Cash Flow', value: '$456K', change: '+8.7%', icon: PieChart, color: 'text-purple-500' },
    { title: 'ROI', value: '34.2%', change: '+5.8%', icon: BarChart3, color: 'text-orange-500' }
  ];

  const reports = [
    { name: 'P&L Statement', type: 'Monthly', status: 'Ready', icon: FileText, color: 'bg-green-600' },
    { name: 'Cash Flow', type: 'Weekly', status: 'Processing', icon: TrendingUp, color: 'bg-blue-600' },
    { name: 'Balance Sheet', type: 'Quarterly', status: 'Ready', icon: PieChart, color: 'bg-purple-600' },
    { name: 'Budget Analysis', type: 'Monthly', status: 'Pending', icon: BarChart3, color: 'bg-orange-600' }
  ];

  const budgets = [
    { category: 'Sales & Marketing', allocated: '$125K', spent: '$98K', remaining: '$27K', percentage: 78 },
    { category: 'Operations', allocated: '$200K', spent: '$156K', remaining: '$44K', percentage: 78 },
    { category: 'Technology', allocated: '$80K', spent: '$72K', remaining: '$8K', percentage: 90 },
    { category: 'Human Resources', allocated: '$150K', spent: '$134K', remaining: '$16K', percentage: 89 }
  ];

  return (
    <div className='space-y-6' data-testid='finance-suite'>
      <Card className='bg-card border-border'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <DollarSign className='h-6 w-6 text-green-500' />
            <span>Advanced Finance Suite</span>
          </CardTitle>
          <CardDescription>
            Comprehensive financial management with AI-powered insights and automated reporting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex space-x-4 mb-6'>
            <Button className='bg-green-600 hover:bg-green-700'>
              <Plus className='h-4 w-4 mr-2' />
              Generate Report
              <Badge variant='secondary' className='ml-2'>3</Badge>
            </Button>
            <Button variant='outline'>
              <BarChart3 className='h-4 w-4 mr-2' />
              Budget Planner
            </Button>
            <Button variant='outline'>
              <Download className='h-4 w-4 mr-2' />
              Export Data
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
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {reports.map((report, idx) => (
                    <div key={idx} className='flex items-center justify-between p-3 border border-border rounded-lg'>
                      <div className='flex items-center space-x-3'>
                        <div className={`p-2 rounded-lg ${report.color}`}>
                          <report.icon className='h-4 w-4 text-white' />
                        </div>
                        <div>
                          <h4 className='font-semibold text-sm'>{report.name}</h4>
                          <p className='text-xs text-muted-foreground'>{report.type}</p>
                        </div>
                      </div>
                      <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className='bg-card border-border'>
              <CardHeader>
                <CardTitle>Budget Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {budgets.map((budget, idx) => (
                    <div key={idx} className='p-3 border border-border rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-semibold text-sm'>{budget.category}</h4>
                        <span className='text-sm text-muted-foreground'>{budget.percentage}% used</span>
                      </div>
                      <div className='flex items-center justify-between text-xs mb-2'>
                        <span>Allocated: {budget.allocated}</span>
                        <span>Remaining: {budget.remaining}</span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full ${
                            budget.percentage > 85 ? 'bg-red-500' : budget.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${budget.percentage}%` }}
                        ></div>
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

export default FinanceSuite;
