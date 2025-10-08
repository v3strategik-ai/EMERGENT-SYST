import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { workflowAPI } from '../../utils/crmAPI';

const NewWorkflowModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'Time-based',
    action_type: 'Email',
    frequency: 'Daily'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await workflowAPI.createWorkflow(formData);
      toast.success('Workflow created successfully!');
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        description: '',
        trigger_type: 'Time-based',
        action_type: 'Email',
        frequency: 'Daily'
      });
    } catch (error) {
      toast.error('Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>Automate your business processes</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Workflow Name</Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder='e.g., Lead Auto-Assignment'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Trigger Type</Label>
              <Select value={formData.trigger_type} onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Time-based'>Time-based</SelectItem>
                  <SelectItem value='Event-based'>Event-based</SelectItem>
                  <SelectItem value='Manual'>Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Action Type</Label>
              <Select value={formData.action_type} onValueChange={(value) => setFormData({ ...formData, action_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Email'>Send Email</SelectItem>
                  <SelectItem value='Notification'>Send Notification</SelectItem>
                  <SelectItem value='Update'>Update Record</SelectItem>
                  <SelectItem value='Create'>Create Record</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Hourly'>Hourly</SelectItem>
                <SelectItem value='Daily'>Daily</SelectItem>
                <SelectItem value='Weekly'>Weekly</SelectItem>
                <SelectItem value='Monthly'>Monthly</SelectItem>
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
                'Create Workflow'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewWorkflowModal;
