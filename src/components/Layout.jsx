import React from 'react';
import Navigation from './Navigation';
import FloatingEmergencyButton from './FloatingEmergencyButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Mobile top spacer */}
        <div className="h-16 lg:hidden"></div>
        
        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
      
      {/* Floating Emergency Button for Mobile */}
      <FloatingEmergencyButton />
    </div>
  );
};

export default Layout;
