"use client";

import { useState } from "react";
import { Instagram, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@shops/ui";
import { useStore } from "@/lib/store-context";
import { trpc } from "@/lib/trpc";
import { STORE_EMAILS } from "@/lib/constants";

export default function ContactClient() {
  const store = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });

  const contactEmail = STORE_EMAILS[store.slug] || `support@${store.slug}.shop`;
  const instagram = store.config?.socialInstagram;

  const submitContact = trpc.storefront.submitContactForm.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Failed to send message. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    submitContact.mutate({
      storeSlug: store.slug,
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">
        Have a question or need help? We&apos;d love to hear from you.
      </p>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          {submitted ? (
            <div className="rounded-xl border bg-muted/30 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold mb-2">Message Sent!</h2>
              <p className="text-muted-foreground">
                Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1.5">Subject</label>
                <select
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Question</option>
                  <option value="return">Return / Exchange</option>
                  <option value="shipping">Shipping</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1.5">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  placeholder="How can we help?"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" size="lg" className="w-full sm:w-auto px-8" disabled={submitContact.isPending}>
                {submitContact.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Email</h3>
            <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-4 w-4" />
              {contactEmail}
            </a>
          </div>
          {instagram && (
            <div>
              <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Instagram</h3>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
                Follow us on Instagram
              </a>
            </div>
          )}
          <div>
            <h3 className="font-medium text-sm uppercase tracking-wider mb-3">Response Time</h3>
            <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours during business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
