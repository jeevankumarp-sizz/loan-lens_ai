import React from 'react';
import LandingNav from './landing-page/components/LandingNav';
import HeroSection from './landing-page/components/HeroSection';
import StatsSection from './landing-page/components/StatsSection';
import FeaturesSection from './landing-page/components/FeaturesSection';
import WorkflowSection from './landing-page/components/WorkflowSection';
import TestimonialsSection from './landing-page/components/TestimonialsSection';
import ComplianceSection from './landing-page/components/ComplianceSection';
import LandingFooter from './landing-page/components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <WorkflowSection />
      <TestimonialsSection />
      <ComplianceSection />
      <LandingFooter />
    </div>
  );
}