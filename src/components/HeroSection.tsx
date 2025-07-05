"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

// Create a default DemoRequestForm component since we don't have access to the actual implementation
const DemoRequestForm = ({ onSubmitSuccess = () => {} }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm text-gray-300">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm text-gray-300">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="company" className="text-sm text-gray-300">
          Dealership Name
        </label>
        <input
          type="text"
          id="company"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          placeholder="ABC Motors"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm text-gray-300">
          Message (Optional)
        </label>
        <textarea
          id="message"
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          placeholder="Tell us about your needs..."
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2 rounded-md transition-all duration-300"
      >
        Submit Request
      </Button>
    </form>
  );
};

export default function HeroSection() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [animationActive, setAnimationActive] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimationActive(true);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background gradient and animation effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-indigo-900/30 z-0"></div>

      {/* Animated tech background elements */}
      <div className="absolute inset-0 z-0">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl transform transition-all duration-1000 ${animationActive ? "scale-125 opacity-70" : "opacity-0"}`}
        ></div>
        <div
          className={`absolute bottom-1/3 right-1/3 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl transform transition-all duration-1500 delay-300 ${animationActive ? "scale-150 opacity-60" : "opacity-0"}`}
        ></div>
        <div
          className={`absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl transform transition-all duration-2000 delay-500 ${animationActive ? "scale-125 opacity-50" : "opacity-0"}`}
        ></div>

        {/* Tech grid lines */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(0deg, transparent 24%, rgba(128, 90, 213, 0.3) 25%, rgba(128, 90, 213, 0.3) 26%, transparent 27%, transparent 74%, rgba(128, 90, 213, 0.3) 75%, rgba(128, 90, 213, 0.3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(128, 90, 213, 0.3) 25%, rgba(128, 90, 213, 0.3) 26%, transparent 27%, transparent 74%, rgba(128, 90, 213, 0.3) 75%, rgba(128, 90, 213, 0.3) 76%, transparent 77%, transparent)",
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-4">
        <div
          className={`transition-all duration-1000 transform ${animationActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 mb-6">
            Automate Your Dealership Marketing
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Boost sales and capture more leads with our AI-powered marketing
            automation platform designed specifically for car dealerships.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 rounded-lg text-lg font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:scale-105"
            >
              Request Demo
            </Button>

            <Button
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10 px-8 py-6 rounded-lg text-lg font-medium transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Animated tech elements */}
        <div
          className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent transition-opacity duration-1000 ${animationActive ? "opacity-70" : "opacity-0"}`}
        ></div>
      </div>

      {/* Demo request form dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-gray-900 border border-purple-500/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              Request a Demo
            </DialogTitle>
          </DialogHeader>
          <DemoRequestForm onSubmitSuccess={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
    </section>
  );
}
