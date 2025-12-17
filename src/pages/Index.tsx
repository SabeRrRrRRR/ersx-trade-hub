import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Users,
  Globe,
  Send,
} from 'lucide-react';

const Index = () => {
  const stats = [
    { label: 'Trading Volume', value: '$2.4B+', icon: BarChart3 },
    { label: 'Active Users', value: '150K+', icon: Users },
    { label: 'Countries', value: '120+', icon: Globe },
    { label: 'Uptime', value: '99.9%', icon: Zap },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Advanced Trading',
      description: 'Professional-grade charts with multiple indicators and timeframes for precise analysis.',
    },
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Your assets are protected with industry-leading security measures and cold storage.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Execute trades in milliseconds with our high-performance matching engine.',
    },
    {
      icon: BarChart3,
      title: 'Deep Liquidity',
      description: 'Access deep order books and tight spreads for optimal trade execution.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm text-primary">Live Trading Now</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-slide-up">
              Trade <span className="text-gradient">ERSX</span> with
              <br />Confidence
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              The next generation cryptocurrency exchange. Professional tools, deep liquidity, and bank-grade security for traders of all levels.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/auth?mode=register">
                <Button variant="hero" size="xl">
                  Start Trading
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="xl">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Live Price Ticker */}
            <div className="mt-12 glass-card p-4 inline-flex items-center gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">E</span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">ERSX/USD</p>
                  <p className="text-xl font-bold font-mono">$1.2500</p>
                </div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className="text-lg font-semibold text-success">+5.24%</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-left">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-lg font-semibold font-mono">$24.5M</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-gradient">ERSX</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for traders who demand the best. Our platform combines cutting-edge technology with intuitive design.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="stat-card group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                The Future of <span className="text-gradient">Digital Assets</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                ERSX Exchange is built on the belief that everyone should have access to professional-grade trading tools. Our platform combines institutional-level features with an intuitive interface.
              </p>
              <ul className="space-y-3">
                {[
                  'Advanced charting with 50+ indicators',
                  'Multi-layer security architecture',
                  '24/7 customer support',
                  'Competitive trading fees',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card p-8 gradient-border">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>
                  <p className="text-4xl font-bold text-gradient">$847M+</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Daily Transactions</p>
                    <p className="text-2xl font-semibold">125K+</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Avg. Response</p>
                    <p className="text-2xl font-semibold">&lt;50ms</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              Have questions? Our support team is here to help you 24/7.
            </p>
            
            <div className="glass-card p-8">
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" />
                  <Input type="email" placeholder="Your Email" />
                </div>
                <Input placeholder="Subject" />
                <textarea
                  className="flex min-h-[120px] w-full rounded-lg border border-border bg-input px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                  placeholder="Your Message"
                />
                <Button variant="hero" className="w-full">
                  Send Message
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of traders who trust ERSX Exchange. Sign up now and receive 100 ERSX welcome bonus!
          </p>
          <Link to="/auth?mode=register">
            <Button variant="hero" size="xl">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
