import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FileText, DollarSign, TrendingUp, Clock, Plus, Settings, Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { quoteAPI } from '../../utils/crmAPI';
import NewQuoteModal from '../modals/NewQuoteModal';
import { format } from 'date-fns';

const CPQSuite = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuoteOpen, setNewQuoteOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const response = await quoteAPI.getQuotes();
      setQuotes(response.data);
    } catch (error) {
      toast.error('Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await quoteAPI.deleteQuote(id);
      toast.success('Quote deleted');
      fetchQuotes();
    } catch (error) {
      toast.error('Failed to delete quote');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await quoteAPI.updateQuote(id, { status: newStatus });
      toast.success('Status updated');
      fetchQuotes();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
  const activeQuotes = quotes.filter(q => q.status !== 'Rejected').length;
  const approvedQuotes = quotes.filter(q => q.status === 'Approved').length;
  const conversionRate = activeQuotes > 0 ? ((approvedQuotes / activeQuotes) * 100).toFixed(1) : 0;

  const metrics = [
    { title: 'Active Quotes', value: activeQuotes.toString(), change: '+12 this week', icon: FileText, color: 'text-blue-500' },
    { title: 'Quote Value', value: `$${(totalValue / 1000).toFixed(1)}K`, change: '+18.5%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, change: '+5.2%', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Avg Quote Time', value: '2.4h', change: '-0.8h', icon: Clock, color: 'text-orange-500' }
  ];

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
            <Button className='bg-blue-600 hover:bg-blue-700' onClick={() => setNewQuoteOpen(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Create Quote
              <Badge variant='secondary' className='ml-2'>1</Badge>
            </Button>
            <Button variant='outline' onClick={() => toast.info('Opening price calculator...')}>
              <Settings className='h-4 w-4 mr-2' />
              Price Calculator
            </Button>
            <Button variant='outline' onClick={() => toast.success('Quotes exported successfully!')}>
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

          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle>All Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : quotes.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No quotes yet. Create your first quote!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className='font-medium'>{quote.quote_number}</TableCell>
                        <TableCell>{quote.client_name}</TableCell>
                        <TableCell>${quote.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge>{quote.status}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(quote.created_at), 'MMM dd')}</TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            <Button size='sm' variant='ghost' onClick={() => handleDelete(quote.id)}>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
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

      <NewQuoteModal open={newQuoteOpen} onOpenChange={setNewQuoteOpen} onSuccess={fetchQuotes} />
    </div>
  );
};

export default CPQSuite;
