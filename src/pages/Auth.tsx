// Auth.native.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigate } from "react-router-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const { width: windowWidth } = Dimensions.get("window");

const Auth: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  // Redirect to welcome if already authenticated
  useEffect(() => {
    if (session) {
      navigate("/welcome");
    }
  }, [session, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      // Navigation happens via useEffect
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      setSignupSuccess(true);
      toast({
        title: "Account created successfully!",
        description: "You can now sign in with your credentials.",
      });
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Email already registered",
          description:
            "Please sign in with your existing account or use a different email.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Card style={styles.card}>
        <CardHeader style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <LucideGolf size={40} color="#3B82F6" />
          </View>
          <CardTitle style={styles.title}>ChipAway</CardTitle>
          <CardDescription style={styles.description}>
            Elevate your golf game with AI-powered training
          </CardDescription>
        </CardHeader>

        <Tabs currentValue={currentTab} onValueChange={setCurrentTab} style={styles.tabs}>
          <TabsList style={styles.tabsList}>
            <TabsTrigger value="login" style={currentTab === "login" ? styles.activeTab : styles.inactiveTab}>
              Login
            </TabsTrigger>
            <TabsTrigger value="register" style={currentTab === "register" ? styles.activeTab : styles.inactiveTab}>
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" style={styles.tabContent}>
            <CardContent style={styles.formContent}>
              <Input
                keyboardType="email-address"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={styles.input}
              />
              <Input
                secureTextEntry
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </CardContent>
            <CardFooter>
              <Button
                onPress={handleLogin}
                style={styles.submitButton}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </Button>
            </CardFooter>
          </TabsContent>

          <TabsContent value="register" style={styles.tabContent}>
            {signupSuccess ? (
              <View style={styles.successContainer}>
                <Text style={styles.successTitle}>Registration successful!</Text>
                <Text style={styles.successMessage}>
                  You can now sign in with your credentials to access your account.
                </Text>
                <Button
                  onPress={() => {
                    setCurrentTab("login");
                    setSignupSuccess(false);
                  }}
                  style={styles.switchButton}
                >
                  <Text style={styles.buttonText}>Go to Login</Text>
                </Button>
              </View>
            ) : (
              <CardContent style={styles.formContent}>
                <Input
                  keyboardType="email-address"
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <Input
                  secureTextEntry
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  minLength={6}
                />
                <CardFooter>
                  <Button
                    onPress={handleSignUp}
                    style={styles.submitButton}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Text>
                  </Button>
                </CardFooter>
              </CardContent>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </KeyboardAvoidingView>
  );
};

export default Auth;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6", // bg-background
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: windowWidth * 0.9,
    maxWidth: 350,
  },
  cardHeader: {
    alignItems: "center",
    paddingBottom: 0,
  },
  iconContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  tabs: {
    marginTop: 16,
  },
  tabsList: {
    flexDirection: "row",
  },
  activeTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  inactiveTab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  tabContent: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    marginTop: -1,
  },
  formContent: {
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successContainer: {
    padding: 24,
    alignItems: "center",
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  switchButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
});
