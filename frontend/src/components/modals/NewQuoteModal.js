import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { quoteAPI } from '../../utils/crmAPI';

const NewQuoteModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    tax_rate: 0.08
  });
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'description' ? value : parseFloat(value) || 0;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await quoteAPI.createQuote({
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          total: item.quantity * item.price
        }))
      });
      toast.success('Quote created successfully!');
      onSuccess();
      onOpenChange(false);
      setFormData({ client_name: '', client_email: '', tax_rate: 0.08 });
      setItems([{ description: '', quantity: 1, price: 0 }]);
    } catch (error) {
      toast.error('Failed to create quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create New Quote</DialogTitle>
          <DialogDescription>Generate a quote for your client</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='client_name'>Client Name</Label>
              <Input
                id='client_name'
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='client_email'>Client Email</Label>
              <Input
                id='client_email'
                type='email'
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <Label>Line Items</Label>
              <Button type='button' size='sm' onClick={addItem}>
                <Plus className='h-4 w-4 mr-1' /> Add Item
              </Button>
            </div>
            {items.map((item, index) => (
              <div key={index} className='grid grid-cols-12 gap-2 items-end'>
                <div className='col-span-5'>
                  <Input
                    placeholder='Description'
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className='col-span-2'>
                  <Input
                    type='number'
                    placeholder='Qty'
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    min='1'
                    required
                  />
                </div>
                <div className='col-span-3'>
                  <Input
                    type='number'
                    placeholder='Price'
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', e.target.value)}
                    min='0'
                    step='0.01'
                    required
                  />
                </div>
                <div className='col-span-2'>
                  {items.length > 1 && (
                    <Button type='button' size='sm' variant='ghost' onClick={() => removeItem(index)}>
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='tax_rate'>Tax Rate (%)</Label>
            <Input
              id='tax_rate'
              type='number'
              value={formData.tax_rate * 100}
              onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) / 100 })}
              min='0'
              max='100'
              step='0.1'
            />
          </div>

          <div className='border-t pt-4'>
            <div className='flex justify-between text-sm'>
              <span>Subtotal:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Tax ({(formData.tax_rate * 100).toFixed(1)}%):</span>
              <span>${(calculateTotal() * formData.tax_rate).toFixed(2)}</span>
            </div>
            <div className='flex justify-between font-bold text-lg mt-2'>
              <span>Total:</span>
              <span>${(calculateTotal() * (1 + formData.tax_rate)).toFixed(2)}</span>
            </div>
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
                'Create Quote'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewQuoteModal;
