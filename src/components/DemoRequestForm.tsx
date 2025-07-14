"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { CheckCircle } from "lucide-react";

interface DemoRequestFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function DemoRequestForm({
  open = true,
  onOpenChange,
}: DemoRequestFormProps) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const resetForm = () => {
    setFormState({
      name: "",
      email: "",
      company: "",
      phone: "",
      message: "",
    });
    setIsSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#121212] border border-purple-500/30 max-w-md md:max-w-lg w-[90vw] rounded-xl shadow-xl shadow-purple-900/20">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                Request a Demo
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Fill out the form below and our team will get back to you within
                24 hours.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-200">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a1a] border-purple-500/30 focus:border-purple-500 text-white"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-200">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a1a] border-purple-500/30 focus:border-purple-500 text-white"
                  placeholder="john@yourdealership.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-200">
                  Dealership / Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formState.company}
                  onChange={handleChange}
                  required
                  className="bg-[#1a1a1a] border-purple-500/30 focus:border-purple-500 text-white"
                  placeholder="ABC Motors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-200">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  className="bg-[#1a1a1a] border-purple-500/30 focus:border-purple-500 text-white"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-200">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  className="bg-[#1a1a1a] border-purple-500/30 focus:border-purple-500 text-white min-h-[100px]"
                  placeholder="Tell us about your specific needs or questions..."
                />
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 rounded-md transition-all duration-300 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 border-none"
                >
                  {isSubmitting ? "Submitting..." : "Request Demo"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Request Submitted!
            </h3>
            <p className="text-gray-300 mb-6">
              Thank you for your interest. Our team will contact you shortly to
              schedule your personalized demo.
            </p>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-all duration-300"
            >
              Submit Another Request
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
