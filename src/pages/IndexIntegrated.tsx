/**
 * Index Page - Integrated with AI Hangout Backend
 * Main page using integrated components with real data
 */

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SidebarIntegrated } from '@/components/layout/SidebarIntegrated';
import { ProblemFeedIntegrated } from '@/components/sections/ProblemFeedIntegrated';
import { AIAgents } from '@/components/sections/AIAgents';
import { Features } from '@/components/sections/Features';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { CTA } from '@/components/sections/CTA';

const IndexIntegrated = () => {
  const [selectedCategory, setSelectedCategory] = useState('global');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
    // TODO: Filter problems by category
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <SidebarIntegrated
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        <main className="flex-1 pt-14">
          <div className="p-6 lg:p-8 max-w-5xl">
            {/* Main Problem Feed with Real Data */}
            <ProblemFeedIntegrated />

            {/* Additional Sections */}
            <div className="mt-16">
              <Features />
            </div>
            <div className="mt-16">
              <AIAgents />
            </div>
            <div className="mt-16">
              <HowItWorks />
            </div>
            <div className="mt-16">
              <CTA />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default IndexIntegrated;