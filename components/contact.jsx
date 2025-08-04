"use client";

import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Send } from "lucide-react";

const Contact = () => {
  const form = useRef();
  const [isSending, setIsSending] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSending(true);

    emailjs
      .sendForm(
        "service_k20mzjk",      // Your EmailJS service ID
        "template_7hoq4yp",     // Your EmailJS template ID
        form.current,
        "22YENgkcbVALviXBe"     // Your EmailJS public key
      )
      .then(() => {
        toast.success("Message sent successfully! ✅");
        form.current.reset();
        setIsSending(false);
      })
      .catch((error) => {
        console.error("Email send error:", error);
        toast.error("Failed to send message. Please try again.");
        setIsSending(false);
      });
  };

  return (
    <section
      id="contact"
      className="py-24 px-6 bg-slate-900 flex flex-col items-center justify-center"
    >
      <div className="max-w-2xl w-full backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Contact Us</h2>
          <p className="text-gray-400 mt-4 text-lg">
            Have a question, feedback, or just want to say hello?
          </p>
        </div>

        <form
          ref={form}
          onSubmit={sendEmail}
          className="flex flex-col space-y-5"
        >
          <input
            type="text"
            name="user_name"
            placeholder="Your Name"
            required
            className="w-full p-3 rounded-md bg-[#131025] text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="email"
            name="user_email"
            placeholder="Your Email"
            required
            className="w-full p-3 rounded-md bg-[#131025] text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            required
            className="w-full p-3 rounded-md bg-[#131025] text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
          />
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            required
            className="w-full p-3 rounded-md bg-[#131025] text-white border border-gray-600 focus:outline-none focus:border-cyan-500"
          ></textarea>

          <Button
            type="submit"
            disabled={isSending}
            variant="primary"
          >
            <Send className="h-4 w-4"/>
            {isSending ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
