import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { ProblemFeed } from '@/components/sections/ProblemFeed';
import { AIAgents } from '@/components/sections/AIAgents';
import { Features } from '@/components/sections/Features';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { CTA } from '@/components/sections/CTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pt-14">
          <div className="p-6 lg:p-8 max-w-5xl">
            <ProblemFeed />
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

export default Index;