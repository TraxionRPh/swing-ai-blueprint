
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { TextInput } from 'react-native';
import { useToast } from '@/components/ui/toast';
import { LucideGolf } from '@/components/icons/CustomIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

enum AuthMode {
  SIGN_IN = "sign_in",
  SIGN_UP = "sign_up"
}

const Auth = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mode, setMode] = useState<AuthMode>(AuthMode.SIGN_IN);
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const isSignUp = mode === AuthMode.SIGN_UP;

  const toggleMode = () => {
    setMode(isSignUp ? AuthMode.SIGN_IN : AuthMode.SIGN_UP);
    // Clear form fields when switching modes
    setPassword("");
    setConfirmPassword("");
  };

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, firstName, lastName);
        toast({
          title: "Account created",
          description: "You can now sign in to your account.",
          variant: "success",
        });
        setMode(AuthMode.SIGN_IN);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LucideGolf width={40} height={40} color="#10B981" />
              </View>
              <Text style={styles.title}>ChipAway</Text>
              <Text style={styles.subtitle}>
                {isSignUp ? "Create an account to get started" : "Sign in to your account"}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.formField}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {isSignUp && (
                <>
                  <View style={styles.row}>
                    <View style={[styles.formField, styles.halfWidth]}>
                      <Text style={styles.label}>First Name</Text>
                      <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First name"
                        placeholderTextColor="#6B7280"
                      />
                    </View>

                    <View style={[styles.formField, styles.halfWidth]}>
                      <Text style={styles.label}>Last Name</Text>
                      <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last name"
                        placeholderTextColor="#6B7280"
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.formField}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                />
              </View>

              {isSignUp && (
                <View style={styles.formField}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor="#6B7280"
                    secureTextEntry
                  />
                </View>
              )}

              <Button
                onPress={handleAuth}
                disabled={loading}
                loading={loading}
                style={styles.button}
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={toggleMode}>
                  <Text style={styles.footerLink}>{isSignUp ? "Sign In" : "Sign Up"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A', // background color
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1F2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  formField: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1F2C',
    borderWidth: 1,
    borderColor: '#2A2F3C',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  button: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 4,
  },
  footerLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Auth;
