import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

const PriceCalculatorModal = ({ open, onOpenChange }) => {
  const [calculation, setCalculation] = useState({
    basePrice: '',
    quantity: '1',
    discount: '0',
    taxRate: '10',
    additionalFees: '0'
  });

  const [results, setResults] = useState(null);

  const calculatePricing = () => {
    const base = parseFloat(calculation.basePrice) || 0;
    const qty = parseInt(calculation.quantity) || 1;
    const discount = parseFloat(calculation.discount) || 0;
    const tax = parseFloat(calculation.taxRate) || 0;
    const fees = parseFloat(calculation.additionalFees) || 0;

    if (base <= 0) {
      toast.error('Please enter a valid base price');
      return;
    }

    const subtotal = base * qty;
    const discountAmount = (subtotal * discount) / 100;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * tax) / 100;
    const total = afterDiscount + taxAmount + fees;

    setResults({
      subtotal: subtotal.toFixed(2),
      discountAmount: discountAmount.toFixed(2),
      afterDiscount: afterDiscount.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      additionalFees: fees.toFixed(2),
      total: total.toFixed(2),
      perUnit: (total / qty).toFixed(2)
    });

    toast.success('Price calculated successfully!');
  };

  const resetCalculation = () => {
    setCalculation({
      basePrice: '',
      quantity: '1',
      discount: '0',
      taxRate: '10',
      additionalFees: '0'
    });
    setResults(null);
  };

  const pricingTiers = [
    { name: 'Basic', price: 99, description: 'Essential features' },
    { name: 'Professional', price: 199, description: 'Advanced functionality' },
    { name: 'Enterprise', price: 399, description: 'Full feature set' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-blue-500" />
            <span>Price Calculator</span>
          </DialogTitle>
          <DialogDescription>
            Calculate accurate pricing for quotes with discounts, taxes, and fees
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={calculation.basePrice}
                      onChange={(e) => setCalculation({...calculation, basePrice: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={calculation.quantity}
                      onChange={(e) => setCalculation({...calculation, quantity: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={calculation.discount}
                      onChange={(e) => setCalculation({...calculation, discount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={calculation.taxRate}
                      onChange={(e) => setCalculation({...calculation, taxRate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Fees ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={calculation.additionalFees}
                    onChange={(e) => setCalculation({...calculation, additionalFees: e.target.value})}
                  />
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button onClick={calculatePricing} className="flex-1">
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate
                  </Button>
                  <Button variant="outline" onClick={resetCalculation}>
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Pricing Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Select Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pricingTiers.map((tier) => (
                    <Button
                      key={tier.name}
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setCalculation({...calculation, basePrice: tier.price.toString()})}
                    >
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{tier.name}</Badge>
                        <span className="text-sm text-muted-foreground">{tier.description}</span>
                      </div>
                      <span className="font-semibold">${tier.price}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span>Pricing Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${results.subtotal}</span>
                      </div>
                      
                      {parseFloat(results.discountAmount) > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount ({calculation.discount}%):</span>
                          <span>-${results.discountAmount}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">After Discount:</span>
                        <span>${results.afterDiscount}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({calculation.taxRate}%):</span>
                        <span>${results.taxAmount}</span>
                      </div>
                      
                      {parseFloat(results.additionalFees) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Additional Fees:</span>
                          <span>${results.additionalFees}</span>
                        </div>
                      )}
                      
                      <hr />
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-green-600">${results.total}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Per Unit:</span>
                        <span>${results.perUnit}</span>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(`Total: $${results.total} (Per Unit: $${results.perUnit})`);
                          toast.success('Pricing copied to clipboard!');
                        }}
                      >
                        Copy Results
                      </Button>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          toast.success('Quote created with calculated pricing!');
                          onOpenChange(false);
                        }}
                      >
                        Create Quote with This Price
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Enter pricing details and click Calculate to see the breakdown
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Tips</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-start space-x-2">
                  <Percent className="h-4 w-4 mt-0.5 text-blue-500" />
                  <span>Volume discounts typically range from 5-15% for bulk orders</span>
                </div>
                <div className="flex items-start space-x-2">
                  <DollarSign className="h-4 w-4 mt-0.5 text-green-500" />
                  <span>Consider market rates and competitor pricing</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Plus className="h-4 w-4 mt-0.5 text-orange-500" />
                  <span>Include implementation and support costs in total price</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceCalculatorModal;