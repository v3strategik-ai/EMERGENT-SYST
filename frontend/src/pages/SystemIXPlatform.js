import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Sun, Moon, Settings } from 'lucide-react';
import AICopilot from '../components/AICopilot';
import Dashboard from '../components/suites/Dashboard';
import CRMSuite from '../components/suites/CRMSuite';
import AnalyticsSuite from '../components/suites/AnalyticsSuite';
import DocumentsSuite from '../components/suites/DocumentsSuite';

const SystemIXPlatform = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    { id: 'payments', label: 'Payments', badge: '11' }
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
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">SX</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  SystemIX AI Ultimate
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
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="border-b border-border bg-card">
          <div className="px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-9 bg-transparent">
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
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-2">Automation Suite</h3>
                    <p className="text-muted-foreground">Coming in next phase...</p>
                  </div>
                </TabsContent>

                <TabsContent value="sales" className="mt-0">
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-2">Sales Suite</h3>
                    <p className="text-muted-foreground">Coming in next phase...</p>
                  </div>
                </TabsContent>

                <TabsContent value="cpq" className="mt-0">
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-2">CPQ Suite</h3>
                    <p className="text-muted-foreground">Coming in next phase...</p>
                  </div>
                </TabsContent>

                <TabsContent value="finance" className="mt-0">
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-2">Finance Suite</h3>
                    <p className="text-muted-foreground">Coming in next phase...</p>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="mt-0">
                  <DocumentsSuite />
                </TabsContent>

                <TabsContent value="payments" className="mt-0">
                  <div className="text-center py-12">
                    <h3 className="text-2xl font-bold mb-2">Payments Suite</h3>
                    <p className="text-muted-foreground">Coming in next phase...</p>
                  </div>
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
              © 2025 SystemIX AI Ultimate. Built with ❤️ on Emergent Platform
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SystemIXPlatform;
