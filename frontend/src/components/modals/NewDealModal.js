import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { salesAPI } from '../../utils/crmAPI';

const NewDealModal = ({ open, onOpenChange, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    value: '',
    status: 'Prospecting',
    source: 'Website',
    probability: '50'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await salesAPI.createDeal({
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability)
      });
      toast.success('Deal created successfully!');
      onSuccess();
      onOpenChange(false);
      setFormData({
        name: '',
        company: '',
        value: '',
        status: 'Prospecting',
        source: 'Website',
        probability: '50'
      });
    } catch (error) {
      toast.error('Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    'Prospecting',
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
  ];

  const sourceOptions = [
    'Website',
    'Referral',
    'Social Media',
    'Cold Call',
    'Email Campaign',
    'Trade Show',
    'Partner'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription>Add a new sales opportunity to your pipeline</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='deal-name'>Deal Name *</Label>
            <Input
              id='deal-name'
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='e.g., Enterprise Software License'
              required
            />
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='company'>Company *</Label>
            <Input
              id='company'
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder='e.g., Acme Corporation'
              required
            />
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='value'>Deal Value *</Label>
            <Input
              id='value'
              type='number'
              step='0.01'
              min='0'
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder='e.g., 50000'
              required
            />
          </div>
          
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <select
                id='status'
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className='w-full p-2 border border-border rounded'
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='probability'>Probability (%)</Label>
              <Input
                id='probability'
                type='number'
                min='0'
                max='100'
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              />
            </div>
          </div>
          
          <div className='space-y-2'>
            <Label htmlFor='source'>Source</Label>
            <select
              id='source'
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className='w-full p-2 border border-border rounded'
            >
              {sourceOptions.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div className='flex justify-end space-x-2 pt-4'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDealModal;