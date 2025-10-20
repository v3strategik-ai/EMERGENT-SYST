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

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="ai-copilot">
      {/* Advanced AI Copilot Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-500" />
              <span>Advanced AI Copilot</span>
              <Badge variant={status === 'Ready' ? 'default' : 'secondary'}>{status}</Badge>
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>AI Chat</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Insights</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Reports</span>
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Predictions</span>
              </TabsTrigger>
            </TabsList>

            {/* AI Chat Tab */}
            <TabsContent value="chat" className="mt-4">
              <div className="h-96 border rounded-lg flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && <Bot className="h-4 w-4 mt-0.5 text-purple-500" />}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-4 w-4 text-purple-500" />
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about your business data..."
                      onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleTextMessage(inputMessage)}
                      disabled={isProcessing}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleTextMessage(inputMessage)}
                      disabled={isProcessing || !inputMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onToggleListening}
                      disabled={!isVoiceSupported || isProcessing}
                      className={isListening ? 'bg-red-50 text-red-600' : ''}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isListening ? 'Stop Voice' : 'Voice Input'}
                    </Button>
                    {!isVoiceSupported && (
                      <Badge variant="outline" className="text-xs">Voice not supported</Badge>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Insights Tab */}
            <TabsContent value="insights" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-96 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span>Sales Forecast</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">AI-powered sales prediction for next 30 days</p>
                    <Button 
                      size="sm" 
                      onClick={() => generateQuickInsight('sales_forecast')}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Forecast
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <span>Smart Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">AI-generated business recommendations</p>
                    <Button 
                      size="sm" 
                      onClick={() => generateQuickInsight('recommendations')}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Get Recommendations
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span>Executive Report</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Automated executive summary generation</p>
                    <Button 
                      size="sm" 
                      onClick={() => generateQuickInsight('executive_report')}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      <span>Anomaly Detection</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">AI-powered business anomaly detection</p>
                    <Badge variant="outline" className="w-full justify-center">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="mt-4">
              <div className="space-y-4 h-96 overflow-y-auto">
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Report Generation</h3>
                  <p className="text-muted-foreground mb-4">Generate comprehensive business reports using AI</p>
                  <div className="space-y-2">
                    <Button onClick={() => generateQuickInsight('executive_report')} disabled={isProcessing}>
                      Generate Executive Summary
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Predictions Tab */}
            <TabsContent value="predictions" className="mt-4">
              <div className="space-y-4 h-96 overflow-y-auto">
                <div className="text-center py-8">
                  <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Predictions</h3>
                  <p className="text-muted-foreground mb-4">Advanced predictive analytics for your business</p>
                  <div className="space-y-2">
                    <Button onClick={() => generateQuickInsight('sales_forecast')} disabled={isProcessing}>
                      Sales Forecast
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Brain className="h-8 w-8" />
        </Button>
        
        <Button
          onClick={onToggleListening}
          disabled={isProcessing || !isVoiceSupported}
          className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 animate-pulse scale-110'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          data-testid="voice-control-button"
        >
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Status Indicator */}
      {isListening && (
        <div className="absolute -top-12 right-0 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
          {status}
        </div>
      )}
    </div>
  );
};

export default AICopilot;
