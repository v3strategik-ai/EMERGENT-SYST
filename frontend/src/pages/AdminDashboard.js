import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Users, Activity, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { statusAPI, adminAPI } from '../utils/api';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [statusChecks, setStatusChecks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (analytics) {
      fetchFilteredStatusChecks();
    }
  }, [filterCategory, filterPriority, filterStatus]);

  const fetchData = async () => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        adminAPI.getAnalytics(),
        adminAPI.getUsers(),
      ]);
      
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setStatusChecks(analyticsRes.data.recent_activity);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredStatusChecks = async () => {
    try {
      const params = {};
      if (filterCategory !== 'all') params.category = filterCategory;
      if (filterPriority !== 'all') params.priority = filterPriority;
      if (filterStatus !== 'all') params.status_type = filterStatus;
      
      const response = await statusAPI.getAll(params);
      setStatusChecks(response.data);
    } catch (error) {
      toast.error('Failed to filter status checks');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-dashboard">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor all status checks and manage users</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Status Checks</CardTitle>
              <Activity className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="admin-total-checks">{analytics?.total_checks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="admin-total-users">{analytics?.total_users || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Operational</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600" data-testid="admin-operational-count">
                {analytics?.checks_by_status?.Operational || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Critical Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600" data-testid="admin-critical-count">
                {analytics?.checks_by_priority?.Critical || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By Status Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(analytics?.checks_by_status || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {status === 'Operational' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {status === 'Degraded' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    {status === 'Down' && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm">{status}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(analytics?.checks_by_priority || {}).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center">
                  <span className="text-sm">{priority}</span>
                  <Badge className={getPriorityColor(priority)}>{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">By Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(analytics?.checks_by_category || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-sm">{category}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Status Checks and Users */}
        <Tabs defaultValue="status-checks" className="space-y-4">
          <TabsList>
            <TabsTrigger value="status-checks" data-testid="tab-status-checks">Status Checks</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="status-checks" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Status Checks</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger data-testid="filter-category-select">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="System">System</SelectItem>
                      <SelectItem value="Application">Application</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Network">Network</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger data-testid="filter-priority-select">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger data-testid="filter-status-select">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status Types</SelectItem>
                      <SelectItem value="Operational">Operational</SelectItem>
                      <SelectItem value="Degraded">Degraded</SelectItem>
                      <SelectItem value="Down">Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Status Checks Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Status Checks</CardTitle>
                <CardDescription>Complete overview of all submitted status checks</CardDescription>
              </CardHeader>
              <CardContent>
                {statusChecks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No status checks found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Submitted By</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {statusChecks.map((check) => (
                          <TableRow key={check.id} data-testid="admin-status-row">
                            <TableCell className="font-medium">{check.title}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{check.user_name}</div>
                                <div className="text-sm text-gray-500">{check.user_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{check.category}</TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(check.priority)}>{check.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(check.status_type)}>{check.status_type}</Badge>
                            </TableCell>
                            <TableCell>{format(new Date(check.timestamp), 'MMM dd, yyyy HH:mm')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage and view all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No users found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} data-testid="admin-user-row">
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(u.created_at), 'MMM dd, yyyy')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
