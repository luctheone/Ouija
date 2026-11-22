'use client';

import { useEffect } from 'react';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const nav = document.getElementById('ouija-main-nav');
    if (nav) nav.style.display = 'none';
    return () => { if (nav) nav.style.display = ''; };
  }, []);

  return <>{children}</>;
}
