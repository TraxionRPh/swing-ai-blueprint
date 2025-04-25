
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";

const Subscription = () => {
  const { isPremium } = useProfile();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          is_premium: true, 
          subscription_type: 'monthly',
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Upgraded Successfully",
        description: "You now have full access to premium features!",
      });

      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your subscription.",
        variant: "destructive"
      });
      console.error('Upgrade error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Subscription</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isPremium ? 'Premium Subscription' : 'Free Tier'}
          </CardTitle>
          <CardDescription>
            {isPremium 
              ? 'You have full access to all features.' 
              : 'Unlock all features with a premium subscription.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isPremium && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Free Tier Includes:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>Access to Drill Library</li>
                  <li>Basic Round Tracking</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Premium Features:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  <li>AI Analysis</li>
                  <li>Unlimited Practice Plan Generation</li>
                  <li>Advanced Round Tracking</li>
                  <li>Performance Insights</li>
                </ul>
              </div>
              <Button 
                onClick={handleUpgrade} 
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Upgrade to Premium - $9.99/month'}
              </Button>
            </div>
          )}
          
          {isPremium && (
            <div className="space-y-4">
              <p>You have full access to all premium features.</p>
              <Button variant="destructive" className="w-full">
                Manage Subscription
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Subscription;
