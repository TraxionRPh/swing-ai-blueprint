// src/components/DrillCard.tsx
import React, { useState } from "react";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Drill } from "@/types/drill";
import { DrillDetailsModal } from "./DrillDetailsModal";
import { DifficultyBadge } from "./DifficultyBadge";

interface DrillCardProps {
  drill: Drill;
}

export const DrillCard = ({ drill }: DrillCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <View className="flex-row justify-between items-start">
            <CardTitle className="text-xl">{drill.title}</CardTitle>
            <DifficultyBadge difficulty={drill.difficulty} />
          </View>
          <CardDescription>{drill.duration}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <Text className="text-sm text-muted-foreground">
            {drill.overview?.substring(0, 150)}
            {drill.overview && drill.overview.length > 150 ? "…" : ""}
          </Text>
        </CardContent>

        <CardFooter className="flex-row justify-end">
          <Button
            variant="secondary"
            size="sm"
            onPress={() => setShowDetails(true)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      <DrillDetailsModal
        drill={drill}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </View>
  );
};
