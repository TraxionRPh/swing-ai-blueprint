// Subscription.native.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";

export const Subscription: React.FC = () => {
  const { isPremium, refreshProfile } = useProfile();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("subscriptions")
        .update({
          is_premium: true,
          subscription_type: "monthly",
          subscription_start: new Date().toISOString(),
          subscription_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Upgraded Successfully",
        description: "You now have full access to premium features!",
      });

      // Refresh profile context so isPremium updates
      await refreshProfile();
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your subscription.",
        variant: "destructive",
      });
      console.error("Upgrade error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Subscription</Text>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              {isPremium ? "Premium Subscription" : "Free Tier"}
            </CardTitle>
            <CardDescription>
              {isPremium
                ? "You have full access to all features."
                : "Unlock all features with a premium subscription."}
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            {!isPremium ? (
              <View>
                <View style={styles.infoBox}>
                  <Text style={styles.subheading}>Free Tier Includes:</Text>
                  <View style={styles.list}>
                    <Text style={styles.listItem}>• Access to Drill Library</Text>
                    <Text style={styles.listItem}>• Basic Round Tracking</Text>
                  </View>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.subheading}>Premium Features:</Text>
                  <View style={styles.list}>
                    <Text style={styles.listItem}>• AI Analysis</Text>
                    <Text style={styles.listItem}>• Unlimited Practice Plan Generation</Text>
                    <Text style={styles.listItem}>• Advanced Round Tracking</Text>
                    <Text style={styles.listItem}>• Performance Insights</Text>
                  </View>
                </View>
                <Button
                  onPress={handleUpgrade}
                  disabled={isProcessing}
                  style={styles.upgradeButton}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.upgradeText}>
                      Upgrade to Premium - $9.99/month
                    </Text>
                  )}
                </Button>
              </View>
            ) : (
              <View>
                <Text style={styles.fullAccessText}>
                  You have full access to all premium features.
                </Text>
                <Button
                  variant="destructive"
                  onPress={() => {
                    /* Navigate to management page or open link */
                  }}
                  style={styles.manageButton}
                >
                  <Text style={styles.manageText}>Manage Subscription</Text>
                </Button>
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Subscription;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoBox: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  list: {
    paddingLeft: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  upgradeButton: {
    backgroundColor: "#10B981", // emerald-500
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  upgradeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  fullAccessText: {
    fontSize: 16,
    marginBottom: 16,
    color: "#374151",
  },
  manageButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  manageText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
