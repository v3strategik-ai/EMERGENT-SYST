import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FileText, Upload, RefreshCw, Search, Folder, File, Image, Archive, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { documentAPI } from '../../utils/crmAPI';
import NewDocumentModal from '../modals/NewDocumentModal';
import { format } from 'date-fns';

const DocumentsSuite = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDocOpen, setNewDocOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentAPI.deleteDocument(id);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const totalDocs = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.file_size, 0);
  const templates = [...new Set(documents.map(d => d.template_used))].length;
  const metrics = [
    { title: 'Total Documents', value: totalDocs.toString(), change: '+156 this month', icon: FileText, color: 'text-blue-500' },
    { title: 'Storage Used', value: `${(totalSize / 1000000).toFixed(0)} MB`, change: '+23 MB', icon: Folder, color: 'text-green-500' },
    { title: 'Templates', value: templates.toString(), change: '+3 new', icon: File, color: 'text-purple-500' },
    { title: 'Conversions', value: '1,234', change: '+89 today', icon: RefreshCw, color: 'text-orange-500' }
  ];

  const templateList = [
    { name: 'Contract Template', type: 'Legal', uses: '45', icon: FileText, color: 'bg-blue-600' },
    { name: 'Invoice Template', type: 'Finance', uses: '123', icon: File, color: 'bg-green-600' },
    { name: 'Proposal Template', type: 'Sales', uses: '67', icon: FileText, color: 'bg-purple-600' },
    { name: 'Report Template', type: 'Analytics', uses: '34', icon: File, color: 'bg-orange-600' },
    { name: 'Agreement Template', type: 'Legal', uses: '28', icon: FileText, color: 'bg-red-600' },
    { name: 'Quote Template', type: 'Sales', uses: '89', icon: File, color: 'bg-teal-600' }
  ];

  const fileTypes = [
    { type: 'Documents', count: '1,234', icon: FileText, color: 'text-blue-500' },
    { type: 'Images', count: '567', icon: Image, color: 'text-green-500' },
    { type: 'Archives', count: '234', icon: Archive, color: 'text-orange-500' },
    { type: 'Other', count: '812', icon: Folder, color: 'text-purple-500' }
  ];

  return (
    <div className="space-y-6" data-testid="documents-suite">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-blue-500" />
            <span>Robust Document Center</span>
          </CardTitle>
          <CardDescription>
            Comprehensive document management with 20+ templates and file converter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setNewDocOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
              <Badge variant="secondary" className="ml-2">10</Badge>
            </Button>
            <Button variant="outline" onClick={() => setNewDocOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Create from Template
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              File Converter
            </Button>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metrics.map((metric, idx) => (
              <Card key={idx} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold mt-2">{metric.value}</p>
                      <p className={`text-sm mt-1 ${metric.color}`}>{metric.change}</p>
                    </div>
                    <metric.icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Document Templates (20+)</CardTitle>
                <CardDescription>Pre-built templates for common business documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templateList.map((template, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-lg hover:bg-accent cursor-pointer">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${template.color}`}>
                          <template.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{template.name}</h4>
                          <p className="text-xs text-muted-foreground">{template.type}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{template.uses} uses</span>
                        <Button size="sm" variant="outline">Use</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>File Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fileTypes.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <file.icon className={`h-5 w-5 ${file.color}`} />
                        <span className="font-semibold">{file.type}</span>
                      </div>
                      <Badge variant="outline">{file.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Table */}
          <Card className='bg-card border-border mt-6'>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <Loader2 className='h-8 w-8 animate-spin' />
                </div>
              ) : documents.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  <p>No documents yet. Upload or create your first document!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className='font-medium'>{doc.name}</TableCell>
                        <TableCell>{doc.file_type}</TableCell>
                        <TableCell>{doc.category}</TableCell>
                        <TableCell>{(doc.file_size / 1000).toFixed(0)} KB</TableCell>
                        <TableCell>{format(new Date(doc.created_at), 'MMM dd')}</TableCell>
                        <TableCell>
                          <Button size='sm' variant='ghost' onClick={() => handleDelete(doc.id)}>
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

      <NewDocumentModal open={newDocOpen} onOpenChange={setNewDocOpen} onSuccess={fetchDocuments} />
    </div>
  );
};

export default DocumentsSuite;
