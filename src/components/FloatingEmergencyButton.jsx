import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield } from 'lucide-react';

const FloatingEmergencyButton = () => {
  const navigate = useNavigate();

  const handleEmergencyClick = () => {
    console.log('Emergency button clicked!'); // Debug log
    navigate('/emergency');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 lg:hidden">
      <Button
        size="lg"
        onClick={handleEmergencyClick}
        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl animate-pulse hover:animate-none transition-all duration-300 transform hover:scale-110 active:scale-95 relative"
      >
        <Shield className="w-6 h-6" />
        
        {/* Emergency indicator ring */}
        <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
      </Button>
    </div>
  );
};

export default FloatingEmergencyButton;
