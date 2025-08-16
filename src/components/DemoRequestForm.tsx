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
  mailtoTo?: string;
}

export default function DemoRequestForm({
  open = true,
  onOpenChange,
  mailtoTo = 'hello@autodrive.ai',
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
    try {
      const subject = encodeURIComponent(`Demo Request — ${formState.company || formState.name}`);
      const body = encodeURIComponent(
        `Name: ${formState.name}\nEmail: ${formState.email}\nCompany: ${formState.company}\nPhone: ${formState.phone}\n\nMessage:\n${formState.message}`
      );
      if (typeof window !== 'undefined') {
        window.location.href = `mailto:${mailtoTo}?subject=${subject}&body=${body}`;
      }
    } catch (_) {}
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 300);
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
      <DialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border border-violet-500/30 max-w-md md:max-w-lg w-[90vw] rounded-2xl shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
        {!isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">
                Get started for free
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                Fill out the form below and our team will get back to you within
                24 hours to set up your account.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200 font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 focus:border-violet-500 text-white rounded-lg"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 focus:border-violet-500 text-white rounded-lg"
                  placeholder="john@yourdealership.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company" className="text-slate-200 font-medium">
                  Dealership / Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formState.company}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600 focus:border-violet-500 text-white rounded-lg"
                  placeholder="ABC Motors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-200 font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 focus:border-violet-500 text-white rounded-lg"
                  placeholder="(123) 456-7890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-slate-200 font-medium">
                  Message (Optional)
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 focus:border-emerald-500 text-white min-h-[100px] rounded-lg"
                  placeholder="Tell us about your specific needs or questions..."
                />
              </div>

              <DialogFooter className="mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 border-none"
                >
                  {isSubmitting ? "Submitting..." : "Get started for free"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Request Submitted!
            </h3>
            <p className="text-slate-300 mb-6">
              Thank you for your interest. Our team will contact you shortly to
              schedule your personalized demo and get you started.
            </p>
            <Button
              onClick={resetForm}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
            >
              Submit Another Request
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
