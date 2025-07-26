import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft } from 'lucide-react';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-500 flex items-center justify-center">
              <Shield className="text-white h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Access Denied</h1>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Admin Only</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            This dashboard is only available to IR Administrators. Please contact your administrator if you need access.
          </p>
        </div>

        <Card className="bg-gray-900 border border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-white">Available Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">View Events</p>
                  <p className="text-gray-400 text-xs">Browse and manage your events</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-black text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Calendar View</p>
                  <p className="text-gray-400 text-xs">View events in calendar format</p>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <Button 
                onClick={() => navigate('/events')}
                className="w-full bg-yellow-400 text-black font-semibold py-2 h-10 hover:bg-yellow-500 transition-colors"
              >
                Go to Events
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessDenied; 