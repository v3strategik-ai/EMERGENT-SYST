import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { documentAPI } from '../../utils/crmAPI';

const NewDocumentModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    file_type: 'PDF',
    category: 'Contract',
    template_used: 'Contract Template'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await documentAPI.createDocument({
        ...formData,
        file_size: Math.floor(Math.random() * 5000000) + 100000 // Simulated file size
      });
      toast.success('Document created successfully!');
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        file_type: 'PDF',
        category: 'Contract',
        template_used: 'Contract Template'
      });
    } catch (error) {
      toast.error('Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>Add a document from template</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Document Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder='e.g., Q4 Contract Agreement'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>File Type</Label>
              <Select value={formData.file_type} onValueChange={(value) => setFormData({ ...formData, file_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='PDF'>PDF</SelectItem>
                  <SelectItem value='DOCX'>Word Document</SelectItem>
                  <SelectItem value='XLSX'>Excel Spreadsheet</SelectItem>
                  <SelectItem value='PPTX'>PowerPoint</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Contract'>Contract</SelectItem>
                  <SelectItem value='Proposal'>Proposal</SelectItem>
                  <SelectItem value='Report'>Report</SelectItem>
                  <SelectItem value='Invoice'>Invoice</SelectItem>
                  <SelectItem value='Agreement'>Agreement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Template</Label>
            <Select value={formData.template_used} onValueChange={(value) => setFormData({ ...formData, template_used: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Contract Template'>Contract Template</SelectItem>
                <SelectItem value='Invoice Template'>Invoice Template</SelectItem>
                <SelectItem value='Proposal Template'>Proposal Template</SelectItem>
                <SelectItem value='Report Template'>Report Template</SelectItem>
                <SelectItem value='Agreement Template'>Agreement Template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                'Create Document'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDocumentModal;
