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

const AICopilot = ({ isListening, onToggleListening }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Chat functionality
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello! I\'m your AI Business Intelligence Assistant. I can help you with analytics, forecasting, report generation, and more. What would you like to know?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Voice recognition
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // AI Insights
  const [aiInsights, setAiInsights] = useState({
    predictions: [],
    recommendations: [],
    anomalies: []
  });

  useEffect(() => {
    // Initialize voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const latest = event.results[event.results.length - 1];
        if (latest.isFinal) {
          const command = latest[0].transcript.trim();
          handleVoiceCommand(command);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setStatus('Voice recognition error');
        onToggleListening();
      };
      
      setRecognition(recognitionInstance);
      setIsVoiceSupported(true);
    }
    
    // Load AI insights
    loadAIInsights();
    
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isListening && recognition) {
      setStatus('Listening...');
      recognition.start();
    } else if (recognition) {
      setStatus('Ready');
      recognition.stop();
    }
  }, [isListening, recognition]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAIInsights = async () => {
    try {
      const response = await api.get('/ai-advanced/dashboard/insights');
      if (response.data.success) {
        setAiInsights(response.data.dashboard);
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
    }
  };

  const handleVoiceCommand = async (command) => {
    try {
      setIsProcessing(true);
      setStatus('Processing voice command...');
      
      const response = await api.post('/ai-advanced/copilot/voice-command', {
        command_text: command,
        user_context: {
          current_page: window.location.pathname,
          platform_section: 'main_dashboard'
        }
      });
      
      if (response.data.success) {
        addMessage('user', command);
        addMessage('ai', response.data.interpretation);
        setStatus('Voice command processed');
      } else {
        toast.error('Failed to process voice command');
      }
    } catch (error) {
      console.error('Voice command error:', error);
      toast.error('Voice command processing failed');
    } finally {
      setIsProcessing(false);
      onToggleListening();
    }
  };

  const handleTextMessage = async (message) => {
    if (!message.trim()) return;
    
    try {
      setIsProcessing(true);
      addMessage('user', message);
      setInputMessage('');
      
      const response = await api.post('/ai-advanced/copilot/query', {
        query: message,
        context_data: {
          current_page: window.location.pathname,
          user_session: Date.now()
        }
      });
      
      if (response.data.success) {
        addMessage('ai', response.data.ai_response);
      } else {
        addMessage('ai', 'I apologize, but I\'m having trouble processing your request right now.');
      }
    } catch (error) {
      console.error('Text message error:', error);
      addMessage('ai', 'Sorry, there was an error processing your message. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addMessage = (type, content) => {
    const newMessage = {
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateQuickInsight = async (type) => {
    try {
      setIsProcessing(true);
      let endpoint = '';
      let requestData = {};
      
      switch (type) {
        case 'sales_forecast':
          endpoint = '/ai-advanced/predict/sales-forecast';
          requestData = {
            sales_data: [
              { value: 50000, status: 'Prospecting', source: 'Website' },
              { value: 75000, status: 'Negotiation', source: 'Referral' }
            ],
            forecast_period_days: 30
          };
          break;
        case 'executive_report':
          endpoint = '/ai-advanced/reports/executive-summary';
          requestData = {
            data: {
              sales: { revenue: 150000, deals: 12 },
              crm: { leads: 45, conversion_rate: 0.23 },
              finance: { expenses: 85000, profit_margin: 0.43 }
            }
          };
          break;
        case 'recommendations':
          endpoint = '/ai-advanced/recommendations/generate';
          requestData = {
            context: 'Business performance optimization',
            business_data: {
              revenue_growth: 0.15,
              customer_satisfaction: 0.87,
              operational_efficiency: 0.78
            }
          };
          break;
        default:
          return;
      }
      
      const response = await api.post(endpoint, requestData);
      
      if (response.data.success) {
        const resultText = typeof response.data === 'object' 
          ? JSON.stringify(response.data, null, 2)
          : response.data;
        addMessage('ai', `Generated ${type.replace('_', ' ')} insight:\n\n${resultText}`);
      } else {
        addMessage('ai', `Failed to generate ${type.replace('_', ' ')} insight.`);
      }
    } catch (error) {
      console.error(`${type} generation error:`, error);
      addMessage('ai', `Error generating ${type.replace('_', ' ')} insight.`);
    } finally {
      setIsProcessing(false);
    }
  };

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
