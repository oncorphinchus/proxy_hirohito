'use client';

import { useEffect, useState } from 'react';

export default function SuppressHydrationWarning({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR or first client render, we hide content to avoid hydration mismatches
  if (!isClient) {
    // Return a placeholder with matching structure but invisible
    return (
      <div style={{ visibility: 'hidden' }} suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // After hydration on client, we show the actual content
  return <div suppressHydrationWarning>{children}</div>;
} 