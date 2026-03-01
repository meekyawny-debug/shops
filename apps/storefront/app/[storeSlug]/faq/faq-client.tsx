"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { storeFaqs } from "@/data/faqs";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left font-medium hover:text-primary transition-colors"
      >
        {q}
        <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FaqClient() {
  const store = useStore();
  const faqs = storeFaqs[store.slug] || storeFaqs.glowhaven!;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold mb-2">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-8">
        Find answers to common questions about {store.name}.
      </p>
      <div>
        {faqs.map((faq, i) => (
          <FaqItem key={i} q={faq.q} a={faq.a} />
        ))}
      </div>
    </div>
  );
}
