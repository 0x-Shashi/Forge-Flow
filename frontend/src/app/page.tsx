'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar/Navbar';
import NodePanel from '@/components/Sidebar/NodePanel';
import ConfigPanel from '@/components/Sidebar/ConfigPanel';
import SolanaProvider from '@/components/Providers/SolanaProvider';
import ToastProvider from '@/components/Providers/ToastProvider';

// Dynamic import for WorkflowCanvas to avoid SSR issues with React Flow
const WorkflowCanvas = dynamic(
  () => import('@/components/Canvas/WorkflowCanvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-[#080810]">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 border border-purple-500/20 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-purple-500/30" />
          </div>
          <p className="text-sm text-gray-500">Loading canvas...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  return (
    <SolanaProvider>
      <main className="h-screen w-screen flex flex-col bg-[#050508] overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Node Palette */}
          <NodePanel />

          {/* Canvas */}
          <div className="flex-1 relative bg-[#080810]">
            <WorkflowCanvas />
          </div>
        </div>

        {/* Config Panel (slides in from right) */}
        <ConfigPanel />
        
        {/* Toast Notifications */}
        <ToastProvider />
      </main>
    </SolanaProvider>
  );
}
