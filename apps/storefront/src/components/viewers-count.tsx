"use client";

import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

function getRandomViewers() {
  return Math.floor(Math.random() * 7) + 2; // 2-8
}

export function ViewersCount() {
  const [viewers, setViewers] = useState(() => getRandomViewers());

  useEffect(() => {
    const tick = () => {
      setViewers(getRandomViewers());
    };

    // Update every 15-30 seconds
    const schedule = () => {
      const delay = 15000 + Math.random() * 15000;
      return setTimeout(() => {
        tick();
        timerId = schedule();
      }, delay);
    };

    let timerId = schedule();
    return () => clearTimeout(timerId);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span>
        <span className="font-semibold text-foreground">{viewers} people</span>{" "}
        viewing this right now
      </span>
    </div>
  );
}
