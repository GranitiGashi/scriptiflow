"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { captureEvent } from "@/lib/analytics";

interface NavigationBarProps {
  logo?: string;
  sections?: { id: string; label: string }[];
}

export default function NavigationBar({
  logo = "/logo.svg",
  sections = [
    { id: "integrations", label: "Product" },
    { id: "features", label: "Use cases" },
    { id: "pricing", label: "Pricing" },
  ],
}: NavigationBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for transparent to solid background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    try { captureEvent('navbar_click', { section: id }); } catch {}
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 py-3"
          : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
        {/* Logo */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-white">
            ScriptiFlow
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              {section.label}
            </button>
          ))}
          <button
            onClick={() => scrollToSection("faq")}
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Docs
          </button>
          <a
            href="/login"
            className="text-slate-300 hover:text-white transition-colors font-medium"
            onClick={() => { try { captureEvent('navbar_click', { section: 'login' }); } catch {} }}
          >
            Sign in
          </a>
          <Button
            variant="default"
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg border-none transition-all"
            onClick={() => scrollToSection("pricing")}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-300 hover:text-white transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-slate-300 hover:text-white transition-colors py-2 text-left font-medium"
              >
                {section.label}
              </button>
            ))}
            <button
              onClick={() => scrollToSection("faq")}
              className="text-slate-300 hover:text-white transition-colors py-2 text-left font-medium"
            >
              Docs
            </button>
            <a
              href="/login"
              className="text-slate-300 hover:text-white transition-colors py-2 font-medium"
            >
              Sign in
            </a>
            <Button
              variant="default"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-lg border-none transition-all w-full"
              onClick={() => scrollToSection("pricing")}
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
