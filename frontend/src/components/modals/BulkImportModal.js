import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const BulkImportModal = ({ 
  open, 
  onOpenChange, 
  onSuccess, 
  importType = 'leads', // 'leads', 'deals', 'transactions'
  title = 'Bulk Import'
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  
  const importTypes = {
    leads: {
      endpoint: '/bulk/import/leads',
      templateEndpoint: '/bulk/templates/leads',
      fileName: 'leads_import_template.csv',
      title: 'Import Leads',
      description: 'Upload a CSV file to import multiple leads at once',
      columns: 'name, email, company, phone, source, status'
    },
    deals: {
      endpoint: '/bulk/import/deals',
      templateEndpoint: '/bulk/templates/deals',
      fileName: 'deals_import_template.csv',
      title: 'Import Deals',
      description: 'Upload a CSV file to import multiple deals at once',
      columns: 'name, company, value, status, source, probability, assigned_to'
    },
    transactions: {
      endpoint: '/bulk/import/transactions',
      templateEndpoint: '/bulk/templates/transactions',
      fileName: 'transactions_import_template.csv',
      title: 'Import Transactions',
      description: 'Upload a CSV file to import multiple transactions at once',
      columns: 'description, amount, type, status, customer, method'
    }
  };
  
  const config = importTypes[importType] || importTypes.leads;

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setProgress(0);
      setResult(null);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(config.endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.success) {
        setResult({
          success: true,
          message: response.data.message,
          count: response.data.imported_count
        });
        toast.success(`Successfully imported ${response.data.imported_count} ${importType}`);
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        setResult({
          success: false,
          message: response.data.error || 'Import failed'
        });
        toast.error('Import failed');
      }

    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.detail || error.message || 'Import failed'
      });
      toast.error('Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get(config.templateEndpoint, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', config.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const handleClose = () => {
    setFile(null);
    setLoading(false);
    setProgress(0);
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>{config.title}</span>
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select CSV File</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Template
                </Button>
              </div>
              {file && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {/* Required Columns Info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required columns:</strong> {config.columns}
              </AlertDescription>
            </Alert>
          </div>

          {/* Progress Bar */}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing {importType}...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {/* Result Display */}
          {result && (
            <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription>
                {result.success ? (
                  <div>
                    <strong>Success!</strong> {result.message}
                    {result.count && (
                      <div className="mt-1 text-sm">
                        Imported {result.count} {importType} successfully.
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <strong>Error:</strong> {result.message}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              {result?.success ? 'Close' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || loading || result?.success}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importType}
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Download the template file to see the required format</li>
              <li>Fill in your data using the same column structure</li>
              <li>Save as CSV file and upload using the file picker above</li>
              <li>Click Import to process your data</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;