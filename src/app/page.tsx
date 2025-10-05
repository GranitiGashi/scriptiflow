"use client";

import React from "react";
import Link from "next/link";
import NavigationBar from "@/components/NavigationBar";
import DemoRequestForm from "@/components/DemoRequestForm";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Rocket, 
  Brain, 
  Share2, 
  LineChart, 
  Shield, 
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  Users,
  Car,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Workflow,
  Camera,
  MessageSquare,
  Mail,
  Upload,
  Eye,
  Database,
  Smartphone,
  Instagram,
  Facebook,
  CreditCard,
  BarChart,
  Send,
  Globe,
  PlayCircle,
  Settings,
  Layers,
  Activity
} from "lucide-react";

export default function Home() {
  const [showDemoForm, setShowDemoForm] = React.useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 text-white overflow-x-hidden">
      <NavigationBar />

      {/* HERO SECTION - Futuristic Design */}
      <section className="relative pt-32 pb-24 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0 -z-10">
          {/* Animated gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-cyan-500/10 animate-pulse"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e81_1px,transparent_1px),linear-gradient(to_bottom,#312e81_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-400/20 text-violet-300 text-sm mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Dealership Automation Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight tracking-tight mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-cyan-200">
              Automate Your
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
              Car Dealership
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Seamlessly integrate Mobile.de, autopost to Facebook & Instagram, run AI-powered ads, 
            and send personalized email campaigns. All in one powerful automation platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              onClick={() => setShowDemoForm(true)} 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-xl font-semibold shadow-2xl shadow-violet-500/25 border-0"
            >
              Start Free Trial
              <Rocket className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-violet-400/30 text-violet-300 hover:bg-violet-500/10 px-10 py-4 text-lg rounded-xl backdrop-blur-sm"
              onClick={() => setShowDemoForm(true)}
            >
              Watch Demo
              <PlayCircle className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400 mb-2">500+</div>
              <p className="text-slate-400 text-sm">Dealerships Trust Us</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400 mb-2">95%</div>
              <p className="text-slate-400 text-sm">Time Saved</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">3x</div>
              <p className="text-slate-400 text-sm">More Leads</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-2">24/7</div>
              <p className="text-slate-400 text-sm">Automation</p>
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATIONS SHOWCASE */}
      <section className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-900/50 to-indigo-950/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                One Platform. All Your Tools.
              </span>
            </h2>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto">
              Connect Mobile.de, Facebook, Instagram, Stripe, and your email tools in minutes. 
              No coding required.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {[
              { name: 'Mobile.de', icon: <Car className="h-8 w-8" />, color: 'text-orange-400' },
              { name: 'Facebook', icon: <Facebook className="h-8 w-8" />, color: 'text-blue-400' },
              { name: 'Instagram', icon: <Instagram className="h-8 w-8" />, color: 'text-pink-400' },
              { name: 'Stripe', icon: <CreditCard className="h-8 w-8" />, color: 'text-purple-400' },
            ].map((integration, i) => (
              <div key={i} className="group p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-violet-500/30 transition-all duration-300 backdrop-blur-sm">
                <div className={`${integration.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {integration.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-sm">
              <Globe className="h-4 w-4" />
              <span>Connect 500+ more tools via API</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-indigo-950/50 to-violet-950/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-violet-400">
                Powerful Automation Features
              </span>
            </h2>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto">
              Everything you need to automate your dealership operations and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Upload className="h-8 w-8" />,
                title: "Mobile.de Integration",
                description: "Automatically sync your inventory from Mobile.de. New cars appear instantly across all your marketing channels.",
                gradient: "from-orange-500/20 to-red-500/20",
                border: "border-orange-500/30"
              },
              {
                icon: <Share2 className="h-8 w-8" />,
                title: "Social Media Autoposting",
                description: "Automatically post new inventory to Facebook and Instagram with AI-generated captions and hashtags.",
                gradient: "from-blue-500/20 to-pink-500/20",
                border: "border-blue-500/30"
              },
              {
                icon: <Brain className="h-8 w-8" />,
                title: "AI-Powered Ads",
                description: "Create and optimize Facebook and Instagram ads using AI. Target the right customers with smart audience selection.",
                gradient: "from-purple-500/20 to-violet-500/20",
                border: "border-purple-500/30"
              },
              {
                icon: <BarChart className="h-8 w-8" />,
                title: "Advanced Analytics",
                description: "Get detailed insights on ad performance, social media engagement, and sales metrics in real-time dashboards.",
                gradient: "from-cyan-500/20 to-teal-500/20",
                border: "border-cyan-500/30"
              },
              {
                icon: <Mail className="h-8 w-8" />,
                title: "Email Automation",
                description: "Send personalized email campaigns to different customer segments with dynamic content and scheduling.",
                gradient: "from-green-500/20 to-emerald-500/20",
                border: "border-green-500/30"
              },
              {
                icon: <CreditCard className="h-8 w-8" />,
                title: "Payment Processing",
                description: "Integrated Stripe payments for ad spending, subscriptions, and customer transactions with automatic reconciliation.",
                gradient: "from-violet-500/20 to-purple-500/20",
                border: "border-violet-500/30"
              }
            ].map((feature, i) => (
              <div key={i} className={`group p-8 rounded-2xl bg-gradient-to-b ${feature.gradient} border ${feature.border} hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                <div className="text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-violet-950/50 to-slate-950/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-cyan-400">
                How It Works
              </span>
            </h2>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Connect",
                description: "Link your Mobile.de account, Facebook, Instagram, and email tools",
                icon: <Settings className="h-12 w-12" />,
                color: "violet"
              },
              {
                step: "02",
                title: "Configure",
                description: "Set up your posting schedules, ad targeting, and email templates",
                icon: <Layers className="h-12 w-12" />,
                color: "purple"
              },
              {
                step: "03",
                title: "Automate",
                description: "Watch as new cars are automatically posted and promoted across channels",
                icon: <Workflow className="h-12 w-12" />,
                color: "cyan"
              },
              {
                step: "04",
                title: "Optimize",
                description: "Review insights and let AI improve your campaigns for better results",
                icon: <Activity className="h-12 w-12" />,
                color: "pink"
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-r from-${step.color}-600 to-${step.color}-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-${step.color}-500/25`}>
                    <div className="text-white">
                      {step.icon}
                    </div>
                  </div>
                  <div className={`text-sm text-${step.color}-400 font-bold mb-2`}>STEP {step.step}</div>
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
                
                {/* Connection line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-px bg-gradient-to-r from-violet-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-950/50 to-indigo-950/50">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Choose Your Plan</h2>
          <p className="text-slate-300 text-xl mb-16">Start small, scale as you grow. No setup fees, cancel anytime.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                key: 'basic' as const,
                name: 'Starter',
                price: '€299/mo',
                description: 'Perfect for small dealerships',
                features: [
                  'Mobile.de integration',
                  'Basic social media posting',
                  'Email campaigns',
                  'Basic analytics',
                  'Up to 100 cars'
                ],
                cta: 'Choose Plan',
                popular: false
              },
              {
                key: 'pro' as const,
                name: 'Professional',
                price: '€599/mo',
                description: 'Most popular for growing dealerships',
                features: [
                  'Everything in Starter',
                  'AI-powered ads',
                  'Advanced autoposting',
                  'Custom email templates',
                  'Advanced analytics',
                  'Up to 500 cars',
                  'Priority support'
                ],
                cta: 'Choose Plan',
                popular: true
              },
              {
                key: 'premium' as const,
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large dealership groups',
                features: [
                  'Everything in Professional',
                  'Unlimited cars',
                  'Custom integrations',
                  'Dedicated account manager',
                  'White-label options',
                  'API access',
                  'Custom training'
                ],
                cta: 'Contact Sales',
                popular: false
              }
            ].map((plan, idx) => (
              <div key={plan.name} className={`relative p-8 rounded-2xl border backdrop-blur-sm ${
                plan.popular 
                  ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-purple-500/10 scale-105' 
                  : 'border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-slate-900/50'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 text-sm rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-violet-400 mb-2">{plan.price}</div>
                <p className="text-slate-400 mb-8">{plan.description}</p>
                
                <ul className="space-y-4 mb-8 text-left">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-violet-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => plan.cta === 'Contact Sales' ? setShowDemoForm(true) : window.location.assign(`/pricing?plan=${plan.key}`)} 
                  className={`w-full py-3 rounded-xl font-semibold ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white' 
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
          {/* Removed modal; redirect to /pricing?plan=... */}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-indigo-950/50 to-violet-950/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">What Our Customers Say</h2>
            <p className="text-slate-300 text-xl">Real results from real dealerships</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "ScriptiFlow transformed our social media presence. We now post consistently across all platforms and our engagement has tripled. The AI ads feature alone paid for itself in the first month.",
                author: "Marcus Weber",
                role: "Marketing Director",
                company: "Berlin Auto Center",
                results: "+300% engagement"
              },
              {
                text: "The Mobile.de integration is seamless. New cars automatically appear on our social media within minutes. Our sales team loves the email automation - it nurtures leads while they focus on closing deals.",
                author: "Sarah Mueller",
                role: "General Manager", 
                company: "Munich Motors",
                results: "+150% lead conversion"
              },
              {
                text: "We've saved 20 hours per week on manual posting and ad management. The insights dashboard gives us clear ROI metrics, and the automated email campaigns have increased our repeat customers by 40%.",
                author: "Thomas Klein",
                role: "Owner",
                company: "Hamburg Car Gallery",
                results: "+40% repeat customers"
              }
            ].map((testimonial, i) => (
              <div key={i} className="p-8 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                <div className="text-violet-400 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <blockquote className="text-slate-300 mb-6 italic">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{testimonial.author}</div>
                    <div className="text-slate-400 text-sm">{testimonial.role}</div>
                    <div className="text-slate-400 text-sm">{testimonial.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-violet-400 font-bold text-lg">{testimonial.results}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-violet-950/50 to-slate-950/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: 'How quickly can I get started?',
                a: 'Most dealerships are up and running within 24 hours. Our team provides personalized onboarding to ensure smooth integration with your existing systems.'
              },
              {
                q: 'Does it work with my Mobile.de account?',
                a: 'Yes! We have full API integration with Mobile.de. Your inventory syncs automatically and new listings appear across all your marketing channels instantly.'
              },
              {
                q: 'Can I customize the AI-generated ads?',
                a: 'Absolutely. You can review and edit all AI-generated content before it goes live. Set your brand guidelines and the AI will learn your preferences over time.'
              },
              {
                q: 'What email templates are included?',
                a: 'We provide proven templates for new arrivals, price drops, service reminders, follow-ups, and seasonal campaigns. All are customizable to match your brand.'
              },
              {
                q: 'How do I track ROI from social media ads?',
                a: 'Our dashboard shows detailed metrics including cost per lead, conversion rates, and revenue attribution. Connect your CRM for complete sales tracking.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use enterprise-grade security with encrypted data storage, regular backups, and GDPR compliance. Your customer data never leaves secure EU servers.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-3">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-950 to-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Automate Your Dealership?
          </h2>
          <p className="text-slate-300 text-xl mb-12">
            Join hundreds of dealerships already growing with ScriptiFlow. 
            Start your free trial today - no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              onClick={() => setShowDemoForm(true)} 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-xl font-semibold shadow-2xl shadow-violet-500/25"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-violet-400/30 text-violet-300 hover:bg-violet-500/10 px-10 py-4 text-lg rounded-xl"
              onClick={() => setShowDemoForm(true)}
            >
              Schedule Demo
            </Button>
          </div>
          
          <div className="mt-12 text-slate-400 text-sm">
            <p>✓ 14-day free trial  ✓ No setup fees  ✓ Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Demo dialog */}
      <DemoRequestForm open={showDemoForm} onOpenChange={setShowDemoForm} mailtoTo="hello@scriptiflow.com" />
    </main>
  );
}