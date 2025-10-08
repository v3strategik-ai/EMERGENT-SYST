import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { paymentAPI } from '../../utils/crmAPI';

const NewTransactionModal = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    amount: '',
    gateway: 'Stripe',
    payment_method: 'Credit Card'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await paymentAPI.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Transaction processed successfully!');
      onSuccess();
      onOpenChange(false);
      setFormData({
        customer_name: '',
        customer_email: '',
        amount: '',
        gateway: 'Stripe',
        payment_method: 'Credit Card'
      });
    } catch (error) {
      toast.error('Failed to process transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>Create a new transaction</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='customer_name'>Customer Name</Label>
            <Input
              id='customer_name'
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='customer_email'>Customer Email</Label>
            <Input
              id='customer_email'
              type='email'
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='amount'>Amount ($)</Label>
            <Input
              id='amount'
              type='number'
              step='0.01'
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              placeholder='0.00'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Payment Gateway</Label>
              <Select value={formData.gateway} onValueChange={(value) => setFormData({ ...formData, gateway: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Stripe'>Stripe</SelectItem>
                  <SelectItem value='PayPal'>PayPal</SelectItem>
                  <SelectItem value='Square'>Square</SelectItem>
                  <SelectItem value='Authorize.net'>Authorize.net</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Credit Card'>Credit Card</SelectItem>
                  <SelectItem value='Debit Card'>Debit Card</SelectItem>
                  <SelectItem value='Bank Transfer'>Bank Transfer</SelectItem>
                  <SelectItem value='PayPal'>PayPal</SelectItem>
                </SelectContent>
              </Select>
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
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTransactionModal;
