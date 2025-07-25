"use client";
import React from 'react';
import './globals.css';

import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <body className={`${inter.className} flex min-h-full bg-slate-100 text-slate-900`}>
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-65 flex flex-col min-h-full">
          <main className="flex-grow w-full p-0 transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
