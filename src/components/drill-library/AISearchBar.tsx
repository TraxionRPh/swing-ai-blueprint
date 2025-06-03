// src/components/AISearchBar.tsx
import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Brain } from "@/components/icons/CustomIcons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/Loading";
import { AlertCircle } from "lucide-react-native";

interface AISearchBarProps {
  onSearch: (query: string) => void;
  isAnalyzing: boolean;
}

export const AISearchBar = memo(
  ({ onSearch, isAnalyzing }: AISearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const { toast } = useToast();

    const handleAISearch = useCallback(() => {
      if (!searchQuery.trim()) {
        toast({
          title: "Please describe your issue",
          description:
            "Tell us what's happening with your game and we'll find the best drills to help.",
          variant: "destructive",
        });
        return;
      }

      onSearch(searchQuery);
    }, [searchQuery, onSearch, toast]);

    const examplePrompts = [
      "I keep hooking my driver to the left",
      "My iron shots are too thin and low",
      "I struggle with consistency in my putting",
      "I hit behind the ball with my wedges",
    ];

    const handleExampleClick = useCallback(
      (example: string) => {
        setSearchQuery(example);
        // Auto-search when clicking an example
        setTimeout(() => {
          onSearch(example);
        }, 100);
      },
      [onSearch]
    );

    return (
      <ScrollView
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 8 }}
      >
        <View className="space-y-6">
          <View className="flex flex-col gap-4">
            <View className="flex-1 border border-primary/50 bg-gradient-to-r p-[1px] from-[#9b87f5] to-[#D946EF] rounded-lg">
              <View className="bg-card rounded-lg w-full flex flex-col p-2">
                <TextInput
                  multiline
                  placeholder="Describe your golf issue in detail (e.g., 'I'm hitting behind the ball with my irons' or 'My drives are consistently slicing to the right')"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="w-full bg-transparent text-sm min-h-[100px] text-foreground"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <Button
              onPress={handleAISearch}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-[#9b87f5] to-[#D946EF] text-white hover:opacity-90 w-full"
            >
              <View className="flex-row items-center">
                <Brain className="mr-2 h-4 w-4" />
                <Text>{isAnalyzing ? "Analyzing..." : "Find Perfect Drills"}</Text>
              </View>
            </Button>
          </View>

          <View className="text-sm">
            <View className="flex-row items-center gap-1 text-muted-foreground mb-2">
              <AlertCircle className="h-4 w-4" />
              <Text className="text-muted-foreground">
                For best results, be specific about your issue
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {examplePrompts.map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleExampleClick(prompt)}
                  className="bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full"
                >
                  <Text className="text-xs text-muted-foreground">
                    "{prompt}"
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {isAnalyzing && (
            <Loading message="Analyzing your golf issue to find the most effective drills..." />
          )}
        </View>
      </ScrollView>
    );
  }
);

AISearchBar.displayName = "AISearchBar";
