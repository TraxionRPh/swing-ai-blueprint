// NotFound.native.tsx
import React, { useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocation, useNavigate } from "react-router-native";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react-native";

export const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: Route not found:", location.pathname);
  }, [location.pathname]);

  const handleReturn = () => {
    navigate("/dashboard");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <AlertCircle size={32} color="#D97706" /> {/* amber-600 */}
        </View>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.subtitle}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Button style={styles.button} onPress={handleReturn}>
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default NotFound;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB", // gray-50
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    width: width * 0.9,
    maxWidth: 360,
    backgroundColor: "#FFFFFF", // white
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    backgroundColor: "#FEF3C7", // amber-100
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  code: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827", // gray-900
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#374151", // gray-700
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280", // gray-500
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "#3B82F6", // primary
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
