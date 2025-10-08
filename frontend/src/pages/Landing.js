import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Activity, Shield, BarChart3, Users, CheckCircle, Zap } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/platform');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img 
                src="/agentik-logo.png" 
                alt="Agentik Solutions" 
                className="h-10 w-auto object-contain"
              />
              <span className="font-bold text-2xl text-gray-900">Agentik Solutions</span>
            </div>
            <div className="flex space-x-3">
              <Link to="/login">
                <Button variant="ghost" data-testid="landing-login-button">Log in</Button>
              </Link>
              <Link to="/register">
                <Button data-testid="landing-register-button">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Monitor Status Checks
            <span className="text-blue-600"> In Real-Time</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A powerful SaaS platform for teams to submit, track, and analyze status checks.
            Built for employees and admins who demand visibility and control.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8" data-testid="hero-get-started-button">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="hero-login-button">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardContent className="pt-6">
              <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Status Checks</h3>
              <p className="text-gray-600">
                Employees can quickly submit status checks with priority levels, categories, and detailed descriptions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardContent className="pt-6">
              <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Admins get comprehensive analytics dashboards with real-time insights and visual data representations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardContent className="pt-6">
              <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                Secure authentication with role-based permissions ensuring data privacy and proper access control.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardContent className="pt-6">
              <div className="rounded-full bg-orange-100 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-gray-600">
                Admins can view and manage all users, track activity, and monitor team performance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardContent className="pt-6">
              <div className="rounded-full bg-red-100 w-12 h-12 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Instant visibility into status changes with live updates and notifications.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-all">
            <CardContent className="pt-6">
              <div className="rounded-full bg-indigo-100 w-12 h-12 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Activity Tracking</h3>
              <p className="text-gray-600">
                Complete audit trail of all status checks with timestamps and user attribution.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16 mt-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join teams already using StatusHub to monitor their systems and improve operations.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8" data-testid="cta-register-button">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Agentik Solutions. Built with ❤️ on Emergent Platform.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
