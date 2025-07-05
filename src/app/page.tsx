"use client";

import React from "react";
import HeroSection from "@/components/HeroSection";
import NavigationBar from "@/components/NavigationBar";
import ContentSection from "@/components/ContentSection";
import DemoRequestForm from "@/components/DemoRequestForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Target,
  BarChart3,
  Users,
  Car,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Home() {
  const [showDemoForm, setShowDemoForm] = React.useState(false);

  const handleRequestDemo = () => {
    setShowDemoForm(true);
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <NavigationBar />

      {/* Hero Section */}
      <HeroSection />

      {/* Product Section */}
      <ContentSection
        id="product"
        title="Revolutionary Marketing Automation"
        subtitle="Built for Car Dealerships"
        description="Transform your dealership's marketing with AI-powered automation that drives real results. Our platform combines cutting-edge technology with deep automotive industry expertise."
        contentType="features"
        items={[
          {
            title: "AI-Powered Lead Generation",
            description:
              "Automatically identify and engage with high-intent prospects using advanced machine learning algorithms that analyze customer behavior patterns.",
            icon: <Zap className="h-6 w-6" />,
          },
          {
            title: "Smart Campaign Optimization",
            description:
              "Continuously improve your marketing ROI with real-time performance analytics and automated A/B testing across all channels.",
            icon: <Target className="h-6 w-6" />,
          },
          {
            title: "Customer Journey Tracking",
            description:
              "Follow prospects from first click to final purchase with comprehensive analytics that reveal every touchpoint in their journey.",
            icon: <BarChart3 className="h-6 w-6" />,
          },
          {
            title: "Inventory Integration",
            description:
              "Automatically sync your marketing campaigns with inventory changes, ensuring customers always see available vehicles.",
            icon: <Car className="h-6 w-6" />,
          },
        ]}
        className="bg-gradient-to-b from-black to-purple-950/20"
      />

      {/* Use Cases Section */}
      <ContentSection
        id="use-cases"
        title="Proven Results Across Dealerships"
        subtitle="Real Success Stories"
        description="See how our platform transforms dealership marketing operations and drives measurable business growth."
        contentType="cards"
        items={[
          {
            title: "35% Increase in Lead Conversion",
            description:
              "Premium Auto Group saw a 35% boost in lead-to-sale conversion rates within 90 days of implementation through personalized follow-up sequences.",
            image:
              "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
          },
          {
            title: "40% Reduction in Ad Spend",
            description:
              "Metro Motors reduced their advertising costs by 40% while maintaining lead volume through AI-driven campaign optimization and audience targeting.",
            image:
              "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
          },
          {
            title: "60% Faster Sales Cycle",
            description:
              "City Car Center accelerated their average sales cycle by 60% using automated nurturing campaigns and intelligent lead scoring.",
            image:
              "https://images.unsplash.com/photo-1552960394-c81add8de6b8?w=800&q=80",
          },
        ]}
        className="bg-gradient-to-b from-purple-950/20 to-black"
      />

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-black to-indigo-950/20"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Choose Your Growth Plan
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Flexible pricing designed to scale with your dealership's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="bg-black/50 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-white mb-2">
                  Starter
                </CardTitle>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-purple-400">
                    $499
                  </span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-300">
                  Perfect for small to medium dealerships getting started with
                  automation
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 mb-8">
                  {[
                    "Basic lead automation",
                    "Email marketing campaigns",
                    "Performance dashboard",
                    "CRM integration",
                    "Email support",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  onClick={handleRequestDemo}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan - Featured */}
            <Card className="bg-black/50 border-2 border-purple-500 hover:border-purple-400 transition-all duration-300 relative overflow-hidden transform scale-105">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-medium">
                Most Popular
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10"></div>
              <CardHeader className="relative z-10 pt-12">
                <CardTitle className="text-2xl text-white mb-2">
                  Professional
                </CardTitle>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-purple-400">
                    $999
                  </span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <CardDescription className="text-gray-300">
                  Advanced automation for growing dealerships ready to scale
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 mb-8">
                  {[
                    "Advanced lead automation",
                    "Multi-channel marketing",
                    "Custom reporting & analytics",
                    "Priority support",
                    "Campaign optimization",
                    "Inventory sync",
                    "A/B testing suite",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-900/30"
                  onClick={handleRequestDemo}
                >
                  Request Demo
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-black/50 border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-white mb-2">
                  Enterprise
                </CardTitle>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-purple-400">
                    Custom
                  </span>
                </div>
                <CardDescription className="text-gray-300">
                  Complete solution for large dealership groups and franchises
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3 mb-8">
                  {[
                    "Full marketing automation suite",
                    "Dedicated account manager",
                    "Custom integrations",
                    "24/7 priority support",
                    "Advanced analytics",
                    "White-label options",
                    "Custom training",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="h-5 w-5 text-purple-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/20"
                  onClick={handleRequestDemo}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-indigo-950/20 to-black relative"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                Pioneering Automotive Marketing
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Founded in 2020 by automotive industry veterans and AI experts,
                we've dedicated ourselves to solving the unique marketing
                challenges faced by car dealerships in the digital age.
              </p>
              <p className="text-gray-300 mb-8">
                Our team combines deep industry knowledge with cutting-edge
                technology to create solutions that drive real, measurable
                results for our clients. We understand that every dealership is
                unique, which is why our platform adapts to your specific needs
                and goals.
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    500+
                  </div>
                  <div className="text-gray-400 text-sm">Dealerships</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    35%
                  </div>
                  <div className="text-gray-400 text-sm">
                    Avg. Lead Increase
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    $2M+
                  </div>
                  <div className="text-gray-400 text-sm">Revenue Generated</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="Team working on automotive marketing solutions"
                className="relative z-10 w-full h-96 object-cover rounded-2xl border border-purple-500/30"
              />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-black to-purple-950/20"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our streamlined process gets you from setup to success in just
              four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "01",
                title: "Integration",
                description:
                  "We seamlessly connect with your existing CRM, inventory management, and marketing tools.",
                icon: <Shield className="h-8 w-8" />,
              },
              {
                number: "02",
                title: "Configuration",
                description:
                  "Our experts configure the platform to match your dealership's specific needs and goals.",
                icon: <Target className="h-8 w-8" />,
              },
              {
                number: "03",
                title: "Automation",
                description:
                  "Marketing campaigns launch automatically based on customer behavior and inventory changes.",
                icon: <Zap className="h-8 w-8" />,
              },
              {
                number: "04",
                title: "Optimization",
                description:
                  "AI continuously improves performance based on real-world results and market conditions.",
                icon: <TrendingUp className="h-8 w-8" />,
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-black/50 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300 h-full">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-6 mx-auto">
                    <div className="text-purple-100">{step.icon}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-purple-400 font-semibold mb-2">
                      STEP {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>

                {/* Connection line */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-purple-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-purple-950/20 to-black"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
              Ready to Transform Your Marketing?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with our team to see how we can help your dealership
              grow
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-black/50 border border-purple-500/30 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Send us a message
              </h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      className="bg-gray-900/50 border-purple-500/30 focus:border-purple-500 text-white mt-2"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      className="bg-gray-900/50 border-purple-500/30 focus:border-purple-500 text-white mt-2"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-gray-900/50 border-purple-500/30 focus:border-purple-500 text-white mt-2"
                    placeholder="john@yourdealership.com"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="text-gray-300">
                    Dealership Name
                  </Label>
                  <Input
                    id="company"
                    className="bg-gray-900/50 border-purple-500/30 focus:border-purple-500 text-white mt-2"
                    placeholder="ABC Motors"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    className="bg-gray-900/50 border-purple-500/30 focus:border-purple-500 text-white mt-2 min-h-[120px]"
                    placeholder="Tell us about your marketing goals and challenges..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3"
                >
                  Send Message
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Get in touch
                </h3>
                <p className="text-gray-300 mb-8">
                  Ready to see how our platform can transform your dealership's
                  marketing? Our team is here to help you get started.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-600/20 rounded-lg flex-shrink-0">
                    <Mail className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Email</h4>
                    <p className="text-gray-300">hello@autodrive.ai</p>
                    <p className="text-gray-400 text-sm">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-600/20 rounded-lg flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Phone</h4>
                    <p className="text-gray-300">(555) 123-4567</p>
                    <p className="text-gray-400 text-sm">Mon-Fri 9AM-6PM PST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-600/20 rounded-lg flex-shrink-0">
                    <MapPin className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Office</h4>
                    <p className="text-gray-300">123 Innovation Drive</p>
                    <p className="text-gray-300">San Francisco, CA 94105</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600/10 to-indigo-600/10 border border-purple-500/30 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-purple-400 mr-3" />
                  <h4 className="text-white font-semibold">
                    Quick Response Guarantee
                  </h4>
                </div>
                <p className="text-gray-300 text-sm">
                  We understand that time is money in the automotive industry.
                  That's why we guarantee a response to all inquiries within 24
                  hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Request Dialog */}
      <DemoRequestForm open={showDemoForm} onOpenChange={setShowDemoForm} />

      {/* Footer */}
      <footer className="bg-black border-t border-purple-900/30 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img
                  src="https://api.dicebear.com/7.x/identicon/svg?seed=autodrive"
                  alt="AutoDrive Logo"
                  className="h-8 w-8 mr-3"
                />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
                  AutoDrive
                </span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Revolutionizing car dealership marketing with AI-powered
                automation. Drive more leads, increase conversions, and grow
                your business.
              </p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#product"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#use-cases"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Use Cases
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="hover:text-purple-400 transition-colors"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#about"
                    className="hover:text-purple-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-purple-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-900/30 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 AutoDrive AI. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
