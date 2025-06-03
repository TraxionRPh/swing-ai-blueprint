import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

export function AvatarUpload({ url, onUpload, size = 150 }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function selectAndUpload() {
    try {
      setUploading(true);

      // Launch the image library for user to pick one image
      const result = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.7,
      });

      if (result.didCancel) {
        setUploading(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error("No image selected.");
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        throw new Error("Failed to obtain image URI.");
      }

      // Fetch the image from the local URI to get a blob
      const response = await fetch(asset.uri);
      const blob = await response.blob();

      // Derive file extension from the file name or fallback to jpg
      const uriParts = asset.uri.split(".");
      const fileExt = uriParts.length > 1 ? uriParts.pop() : "jpg";

      // Get current user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated.");
      }

      // Create a unique path: userID/randomstring.extension
      const filePath = `${user.id}/${Math.random().toString(36).slice(2)}.${fileExt}`;

      // Upload the blob to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the uploaded image
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Inform parent of new URL
      onUpload(publicUrl);

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error uploading avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}
        onPress={selectAndUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="large" color="#999" />
        ) : url ? (
          <Image source={{ uri: url }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
        ) : (
          <View style={[styles.fallbackContainer, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={styles.fallbackText}>Upload</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.uploadButton, uploading && styles.buttonDisabled]}
        onPress={selectAndUpload}
        disabled={uploading}
      >
        <Camera size={18} color="#fff" style={styles.cameraIcon} />
        <Text style={styles.uploadButtonText}>
          {uploading ? "Uploading..." : "Upload Image"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ececec",
    overflow: "hidden",
  },
  avatarImage: {
    resizeMode: "cover",
  },
  fallbackContainer: {
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "500",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  cameraIcon: {
    marginRight: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
