import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sun, Moon, Settings, LogOut } from 'lucide-react';
import AICopilot from '../components/AICopilot';
import Dashboard from '../components/suites/Dashboard';
import CRMSuite from '../components/suites/CRMSuite';
import AnalyticsSuite from '../components/suites/AnalyticsSuite';
import AutomationSuite from '../components/suites/AutomationSuite';
import SalesSuite from '../components/suites/SalesSuite';
import CPQSuite from '../components/suites/CPQSuite';
import FinanceSuite from '../components/suites/FinanceSuite';
import DocumentsSuite from '../components/suites/DocumentsSuite';
import PaymentsSuite from '../components/suites/PaymentsSuite';
import IntegrationsSuite from '../components/suites/IntegrationsSuite';

const SystemIXPlatform = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isListening, setIsListening] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'AI Dashboard', badge: null },
    { id: 'crm', label: 'CRM Suite', badge: '4' },
    { id: 'analytics', label: 'Analytics', badge: '2' },
    { id: 'automation', label: 'Automation', badge: '1' },
    { id: 'sales', label: 'Sales', badge: '7' },
    { id: 'cpq', label: 'CPQ', badge: '1' },
    { id: 'finance', label: 'Finance', badge: '3' },
    { id: 'documents', label: 'Documents', badge: '10' },
    { id: 'payments', label: 'Payments', badge: '11' },
    { id: 'integrations', label: 'Integrations', badge: '3' }
  ];

  const handleToggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/agentik-logo.png" 
                alt="Agentik Solutions" 
                className="h-20 w-auto object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-primary bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Agentik Solutions
                </h1>
                <p className="text-base text-muted-foreground font-medium">
                  Revolutionary Business Intelligence Suite
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Live System</span>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} data-testid="theme-toggle">
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
                <Badge variant="destructive" className="ml-1">2</Badge>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="logout-button"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-card">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-10 bg-transparent">
                {tabs.map(tab => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tab.label}
                    {tab.badge && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {tab.badge}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              <div className="mt-6 pb-6">
                <TabsContent value="dashboard" className="mt-0">
                  <Dashboard />
                </TabsContent>

                <TabsContent value="crm" className="mt-0">
                  <CRMSuite />
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <AnalyticsSuite />
                </TabsContent>

                <TabsContent value="automation" className="mt-0">
                  <AutomationSuite />
                </TabsContent>

                <TabsContent value="sales" className="mt-0">
                  <SalesSuite />
                </TabsContent>

                <TabsContent value="cpq" className="mt-0">
                  <CPQSuite />
                </TabsContent>

                <TabsContent value="finance" className="mt-0">
                  <FinanceSuite />
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <DocumentsSuite />
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                  <PaymentsSuite />
                </TabsContent>

                <TabsContent value="integrations" className="mt-0">
                  <IntegrationsSuite />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* AI Copilot */}
        <AICopilot isListening={isListening} onToggleListening={handleToggleListening} />

        {/* Footer */}
        <footer className="border-t border-border bg-card mt-12">
          <div className="px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Agentik Solutions. Built with ❤️ on Emergent Platform
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SystemIXPlatform;
