// Profile.native.tsx
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigate } from "react-router-native";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile, HandicapLevel } from "@/hooks/useProfile";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Separator } from "@/components/ui/Separator";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";
import { LogOut, Shield, Mail } from "lucide-react-native";

export const Profile: React.FC = () => {
  const { handicap, goals, isPremium, loading, saveProfile, firstName, lastName, avatarUrl, scoreGoal, handicapGoal } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [localHandicap, setLocalHandicap] = useState<HandicapLevel | null>(handicap);
  const [localGoals, setLocalGoals] = useState<string | null>(goals);
  const [localFirstName, setLocalFirstName] = useState<string | null>(firstName);
  const [localLastName, setLocalLastName] = useState<string | null>(lastName);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);
  const [localScoreGoal, setLocalScoreGoal] = useState<number | null>(scoreGoal);
  const [localHandicapGoal, setLocalHandicapGoal] = useState<number | null>(handicapGoal);

  useEffect(() => {
    setLocalHandicap(handicap);
    setLocalGoals(goals);
    setLocalFirstName(firstName);
    setLocalLastName(lastName);
    setLocalAvatarUrl(avatarUrl);
    setLocalScoreGoal(scoreGoal);
    setLocalHandicapGoal(handicapGoal);

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    })();
  }, [handicap, goals, firstName, lastName, avatarUrl, scoreGoal, handicapGoal]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfile({
        handicap: localHandicap || undefined,
        goals: localGoals || undefined,
        firstName: localFirstName || undefined,
        lastName: localLastName || undefined,
        avatarUrl: localAvatarUrl || undefined,
        score_goal: localScoreGoal,
        handicap_goal: localHandicapGoal,
      });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      navigate("/auth");
    } catch (err: any) {
      toast({
        title: "Sign Out Failed",
        description: err.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Profile Settings</Text>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.avatarContainer}>
              <AvatarUpload
                url={localAvatarUrl}
                onUpload={(url) => setLocalAvatarUrl(url)}
                size={150}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Label text="First Name" />
                <Input
                  value={localFirstName || ""}
                  onChangeText={setLocalFirstName}
                  placeholder="Enter your first name"
                />
              </View>
              <View style={styles.halfWidth}>
                <Label text="Last Name" />
                <Input
                  value={localLastName || ""}
                  onChangeText={setLocalLastName}
                  placeholder="Enter your last name"
                />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Mail size={16} color="#6B7280" style={styles.icon} />
                <Label text="Email Address" />
              </View>
              <View style={styles.emailBox}>
                <Text style={styles.emailText}>
                  {userEmail || "Loading email..."}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Label text="Target Round Score" />
                <Input
                  keyboardType="number-pad"
                  value={localScoreGoal?.toString() || ""}
                  onChangeText={(val) =>
                    setLocalScoreGoal(val ? Number(val) : null)
                  }
                  placeholder="Enter target score"
                />
              </View>
              <View style={styles.halfWidth}>
                <Label text="Target Handicap" />
                <Input
                  keyboardType="number-pad"
                  value={localHandicapGoal?.toString() || ""}
                  onChangeText={(val) =>
                    setLocalHandicapGoal(val ? Number(val) : null)
                  }
                  placeholder="Enter target handicap"
                />
              </View>
            </View>

            <Separator style={styles.separator} />

            <View style={styles.field}>
              <Text style={styles.sectionTitle}>Skill Level</Text>
              <RadioGroup
                value={localHandicap || ""}
                onValueChange={(v) => setLocalHandicap(v as HandicapLevel)}
              >
                {[
                  ["beginner", "Beginner (36+ handicap)"],
                  ["novice", "Novice (25-36 handicap)"],
                  ["intermediate", "Intermediate (15-24 handicap)"],
                  ["advanced", "Advanced (5-14 handicap)"],
                  ["expert", "Expert (0-4 handicap)"],
                  ["pro", "Professional (+ handicap)"],
                ].map(([value, label]) => (
                  <View key={value} style={styles.radioRow}>
                    <RadioGroupItem value={value} />
                    <Text style={styles.radioLabel}>{label}</Text>
                  </View>
                ))}
              </RadioGroup>
            </View>

            <View style={styles.field}>
              <Text style={styles.sectionTitle}>Goals</Text>
              <Textarea
                value={localGoals || ""}
                onChangeText={setLocalGoals}
                placeholder="What are your golf improvement goals?"
                style={styles.textarea}
              />
            </View>

            <Button
              onPress={handleSave}
              disabled={isSaving}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </Button>
          </CardContent>
        </Card>

        <NotificationPreferences />

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>
              Manage your subscription and access premium features
            </CardDescription>
          </CardHeader>
          <CardContent style={styles.cardContent}>
            <View style={styles.subRow}>
              <Shield
                size={20}
                color={isPremium ? "#10B981" : "#9CA3AF"}
                style={styles.icon}
              />
              <Text style={styles.subText}>
                {isPremium ? "Premium Member" : "Free Tier"}
              </Text>
            </View>
            {!isPremium && (
              <Button
                variant="outline"
                onPress={() => navigate("/subscription")}
                style={styles.upgradeButton}
              >
                <Text style={styles.upgradeText}>Upgrade to Premium</Text>
              </Button>
            )}
          </CardContent>
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            variant="destructive"
            onPress={handleLogout}
            disabled={isLoggingOut}
            style={styles.logoutButton}
          >
            <View style={styles.logoutRow}>
              <LogOut size={16} color="#FFFFFF" style={styles.icon} />
              <Text style={styles.logoutText}>
                {isLoggingOut ? "Signing Out..." : "Sign Out"}
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    marginBottom: 24,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  halfWidth: {
    width: "48%",
  },
  field: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    marginRight: 6,
  },
  emailBox: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 6,
  },
  emailText: {
    fontSize: 14,
    color: "#111827",
  },
  separator: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  subText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  upgradeButton: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  upgradeText: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutContainer: {
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
