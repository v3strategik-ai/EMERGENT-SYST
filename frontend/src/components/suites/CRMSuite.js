import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, DollarSign, TrendingUp, BarChart3, Plus, Upload, FileDown, Download, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { crmAPI } from '../../utils/crmAPI';
import api from '../../utils/api';
import NewLeadModal from '../modals/NewLeadModal';
import BulkImportModal from '../modals/BulkImportModal';
import { format } from 'date-fns';

const CRMSuite = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLeadOpen, setNewLeadOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await crmAPI.getLeads();
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    try {
      await crmAPI.deleteLead(id);
      toast.success('Lead deleted successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await crmAPI.updateLead(id, { status: newStatus });
      toast.success('Status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleExportLeads = async () => {
    try {
      const response = await api.get('/bulk/export/leads', {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Leads exported successfully!');
    } catch (error) {
      toast.error('Failed to export leads');
    }
  };

  // Calculate metrics from real data
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const activeLeads = leads.length;
  const closedWon = leads.filter(l => l.status === 'Closed Won').length;
  const conversionRate = activeLeads > 0 ? ((closedWon / activeLeads) * 100).toFixed(1) : 0;
  const avgDealSize = activeLeads > 0 ? (totalValue / activeLeads).toFixed(0) : 0;

  const metrics = [
    { title: 'Total Pipeline Value', value: `$${(totalValue / 1000).toFixed(1)}K`, change: '+18.5%', icon: DollarSign, color: 'text-green-500' },
    { title: 'Active Leads', value: activeLeads.toString(), change: '+12%', icon: Users, color: 'text-blue-500' },
    { title: 'Conversion Rate', value: `${conversionRate}%`, change: '+3.2%', icon: TrendingUp, color: 'text-purple-500' },
    { title: 'Avg Deal Size', value: `$${avgDealSize}`, change: '+8.7%', icon: BarChart3, color: 'text-orange-500' }
  ];

  const stages = ['Lead', 'Qualified', 'Discovery', 'Proposal', 'Negotiation', 'Closed Won'];
  const pipelineStages = stages.map((stage, idx) => {
    const stageLeads = leads.filter(l => l.status === stage);
    const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
    const colors = ['bg-gray-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-purple-500', 'bg-green-500'];
    return {
      stage,
      count: stageLeads.length,
      value: `$${(stageValue / 1000).toFixed(0)}K`,
      color: colors[idx]
    };
  });

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
            <Button className='bg-purple-600 hover:bg-purple-700' onClick={() => setNewLeadOpen(true)}>
              <Plus className='h-4 w-4 mr-2' />
              New Lead
              <Badge variant='secondary' className='ml-2'>12</Badge>
            </Button>
            <Button variant='outline' className='border-green-600 text-green-600' onClick={() => setImportModalOpen(true)}>
              <Upload className='h-4 w-4 mr-2' />
              Import Leads
              <Badge variant='secondary' className='ml-2'>CSV</Badge>
            </Button>
            <Button variant='outline' className='border-blue-600 text-blue-600' onClick={handleExportLeads}>
              <Download className='h-4 w-4 mr-2' />
              Export Leads
              <Badge variant='secondary' className='ml-2'>CSV</Badge>
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
          <Card className='bg-card border-border mb-6'>
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

          {/* Leads Table */}
          <Card className='bg-card border-border'>
            <CardHeader>
              <CardTitle>All Leads</CardTitle>
              <CardDescription>Manage your sales pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : leads.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No leads yet. Create your first lead!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className='font-medium'>{lead.name}</TableCell>
                        <TableCell>{lead.company}</TableCell>
                        <TableCell>${lead.value.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge>{lead.status}</Badge>
                        </TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>{format(new Date(lead.created_at), 'MMM dd')}</TableCell>
                        <TableCell>
                          <div className='flex space-x-2'>
                            <Button size='sm' variant='ghost' onClick={() => handleDeleteLead(lead.id)}>
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

      <NewLeadModal open={newLeadOpen} onOpenChange={setNewLeadOpen} onSuccess={fetchLeads} />
    </div>
  );
};

export default CRMSuite;
