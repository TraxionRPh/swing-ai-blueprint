
import React from 'react';
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PremiumFeatureProps {
  children: React.ReactNode;
}

export const PremiumFeature: React.FC<PremiumFeatureProps> = ({ children }) => {
  const { isPremium, loading } = useProfile();
  const navigate = useNavigate();

  if (loading) return null;

  if (!isPremium) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Premium Feature
          </CardTitle>
          <CardDescription>
            This feature is only available for premium subscribers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/subscription')} 
            className="w-full"
          >
            Upgrade to Unlock
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
