"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Ensure document.documentElement has the dark class
    document.documentElement.classList.add('dark');
  }, []);

  return <>{children}</>;
}