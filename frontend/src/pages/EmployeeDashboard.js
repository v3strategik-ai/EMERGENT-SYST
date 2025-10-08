import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { statusAPI } from '../utils/api';
import { format } from 'date-fns';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [statusChecks, setStatusChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'System',
    priority: 'Medium',
    status_type: 'Operational',
  });

  const categories = ['System', 'Application', 'Database', 'Network', 'Security', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statusTypes = ['Operational', 'Degraded', 'Down'];

  useEffect(() => {
    fetchStatusChecks();
  }, []);

  const fetchStatusChecks = async () => {
    try {
      const response = await statusAPI.getMy();
      setStatusChecks(response.data);
    } catch (error) {
      toast.error('Failed to load status checks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCheck) {
        await statusAPI.update(editingCheck.id, formData);
        toast.success('Status check updated successfully');
      } else {
        await statusAPI.create(formData);
        toast.success('Status check submitted successfully');
      }
      
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'System',
        priority: 'Medium',
        status_type: 'Operational',
      });
      setEditingCheck(null);
      fetchStatusChecks();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit status check');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (check) => {
    setEditingCheck(check);
    setFormData({
      title: check.title,
      description: check.description,
      category: check.category,
      priority: check.priority,
      status_type: check.status_type,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await statusAPI.delete(id);
      toast.success('Status check deleted');
      fetchStatusChecks();
    } catch (error) {
      toast.error('Failed to delete status check');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Low: 'bg-blue-100 text-blue-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      High: 'bg-orange-100 text-orange-700',
      Critical: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (statusType) => {
    const colors = {
      Operational: 'bg-green-100 text-green-700',
      Degraded: 'bg-yellow-100 text-yellow-700',
      Down: 'bg-red-100 text-red-700',
    };
    return colors[statusType] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="employee-dashboard">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Manage your status checks below.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Submissions</CardDescription>
              <CardTitle className="text-3xl" data-testid="employee-total-checks">{statusChecks.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Operational</CardDescription>
              <CardTitle className="text-3xl text-green-600" data-testid="employee-operational-count">
                {statusChecks.filter((c) => c.status_type === 'Operational').length}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Needs Attention</CardDescription>
              <CardTitle className="text-3xl text-red-600" data-testid="employee-attention-count">
                {statusChecks.filter((c) => c.status_type === 'Down' || c.priority === 'Critical').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingCheck(null);
              setFormData({
                title: '',
                description: '',
                category: 'System',
                priority: 'Medium',
                status_type: 'Operational',
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="new-status-check-button">
                <Plus className="mr-2 h-4 w-4" />
                New Status Check
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{editingCheck ? 'Edit Status Check' : 'Submit New Status Check'}</DialogTitle>
                <DialogDescription>
                  {editingCheck ? 'Update the details of your status check.' : 'Fill in the details below to submit a new status check.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief title of the status check"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="status-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    data-testid="status-description-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger data-testid="status-category-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger data-testid="status-priority-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((pri) => (
                          <SelectItem key={pri} value={pri}>{pri}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status_type">Status Type</Label>
                  <Select value={formData.status_type} onValueChange={(value) => setFormData({ ...formData, status_type: value })}>
                    <SelectTrigger data-testid="status-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="status-cancel-button">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} data-testid="status-submit-button">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : editingCheck ? (
                      'Update'
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Status Checks Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Status Checks</CardTitle>
            <CardDescription>View and manage all your submitted status checks</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : statusChecks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No status checks yet. Submit your first one!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusChecks.map((check) => (
                    <TableRow key={check.id} data-testid="status-check-row">
                      <TableCell className="font-medium">{check.title}</TableCell>
                      <TableCell>{check.category}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(check.priority)}>{check.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(check.status_type)}>{check.status_type}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(check.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(check)} data-testid={`edit-button-${check.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600" data-testid={`delete-button-${check.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your status check.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(check.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
