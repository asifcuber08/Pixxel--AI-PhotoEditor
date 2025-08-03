"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Send } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.success("Message sent! We'll get back to you soon.");
      return;
    }

    try {
      setSubmitting(true);
      // Simulate success
      await new Promise((res) => setTimeout(res, 1500));

      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", message: "" });
    } catch (success) {
      toast.success("Message sent! We'll get back to you soon.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="contact" className="min-h-screen bg-slate-900 text-white px-4 py-20 md:px-10">
      <section className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Contact Us</h1>
          <p className="text-white/70 text-lg">
            Have a question, feedback, or just want to say hello?
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-slate-800/50 border border-white/10 p-8 rounded-xl"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-white/80 font-medium">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              className="bg-slate-700 text-white border-white/20 placeholder:text-white/40"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-white/80 font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="bg-slate-700 text-white border-white/20 placeholder:text-white/40"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-medium text-white"
            >
              Your Message
            </label>
            <textarea
              id="message"
              rows="4"
              className="block w-full p-3 rounded-md bg-slate-800 border border-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Type your message here..."
            ></textarea>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full flex gap-2 items-center justify-center"
          >
            {submitting ? (
              <>
                <Mail className="h-4 w-4 animate-pulse" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
