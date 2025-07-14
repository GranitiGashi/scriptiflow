"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface NavigationBarProps {
  logo?: string;
  sections?: { id: string; label: string }[];
}

export default function NavigationBar({
  logo = "/logo.svg",
  sections = [
    { id: "product", label: "Product" },
    { id: "use-cases", label: "Use Cases" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
    { id: "how-it-works", label: "How It Works" },
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
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-background",
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-purple-900/30 py-2"
          : "bg-transparent py-4",
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Company Logo"
            className="h-8 w-auto"
            onError={(e) => {
              e.currentTarget.src =
                "https://api.dicebear.com/7.x/identicon/svg?seed=automation";
            }}
          />
          <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-600">
            AutoDrive
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="text-gray-300 hover:text-purple-400 transition-colors relative group"
            >
              {section.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
            </button>
          ))}
          <Button
            variant="default"
            className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-none shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all"
            onClick={() => scrollToSection("contact")}
          >
            Request Demo
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300 hover:text-purple-400 transition-colors"
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
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-purple-900/30">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="text-gray-300 hover:text-purple-400 transition-colors py-2 text-left"
              >
                {section.label}
              </button>
            ))}
            <Button
              variant="default"
              className="bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white border-none shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all w-full"
              onClick={() => scrollToSection("contact")}
            >
              Request Demo
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
