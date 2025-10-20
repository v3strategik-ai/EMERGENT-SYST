import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Mic, 
  MicOff, 
  Bot, 
  Settings, 
  MessageCircle, 
  TrendingUp, 
  Loader2, 
  Send,
  Brain,
  Sparkles,
  BarChart3,
  FileText,
  Lightbulb,
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AICopilot = ({ isListening, onToggleListening }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [lastCommand, setLastCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isListening) {
      setStatus('Listening...');
      const timeout = setTimeout(() => {
        simulateCommand();
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setStatus('Ready');
    }
  }, [isListening]);

  const simulateCommand = async () => {
    const commands = [
      'Generate Q3 financial report',
      'Analyze sales pipeline',
      'Create customer segmentation',
      'Forecast revenue trends'
    ];
    const command = commands[Math.floor(Math.random() * commands.length)];
    setLastCommand(command);
    setStatus('Processing...');
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/query`,
        { query: command },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('AI Task Completed', {
        description: response.data.response.substring(0, 100) + '...'
      });
    } catch (error) {
      toast.error('AI processing failed');
    } finally {
      setIsProcessing(false);
      setStatus('Ready');
      onToggleListening();
    }
  };

  const capabilities = [
    { name: 'Data Analysis', icon: TrendingUp },
    { name: 'Report Generation', icon: MessageCircle },
    { name: 'Automation', icon: Bot },
    { name: 'Learning', icon: Upload }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="ai-copilot">
      {isOpen && (
        <Card className="mb-4 w-96 bg-card border-border shadow-2xl animate-in slide-in-from-bottom">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <span>Platinum AI Copilot</span>
              <Badge variant={status === 'Ready' ? 'default' : 'secondary'}>{status}</Badge>
            </CardTitle>
            <CardDescription>AI-powered business intelligence assistant</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Upload className="h-4 w-4 mr-1" />
                  Upload KB
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {lastCommand && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Last Command:</p>
                <p className="text-sm text-muted-foreground">"{lastCommand}"</p>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">AI Capabilities:</h4>
              <div className="grid grid-cols-2 gap-2">
                {capabilities.map((cap, idx) => (
                  <div key={idx} className="p-2 border border-border rounded-lg text-center hover:bg-accent cursor-pointer">
                    <cap.icon className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                    <p className="text-xs font-medium">{cap.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button size="sm" variant="outline" className="flex-1">
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat Mode
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2">
        {isOpen && (
          <Button onClick={() => setIsOpen(false)} variant="outline" size="sm" className="bg-background">
            Close
          </Button>
        )}
        <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm" className="bg-background">
          <Bot className="h-4 w-4" />
        </Button>
        <Button
          onClick={onToggleListening}
          disabled={isProcessing}
          className={`h-16 w-16 rounded-full shadow-lg transition-all duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 animate-pulse scale-110'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          data-testid="voice-control-button"
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {isListening && (
        <div className="absolute -top-12 right-0 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          {status}
        </div>
      )}
    </div>
  );
};

export default AICopilot;
