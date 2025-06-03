// src/components/PlanCard.tsx
import React from "react";
import {
  View,
  Text,
  Alert,
} from "react-native";
import { formatDistanceToNow } from "date-fns";
import { Clock, Trash2 } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge"; // RN-compatible Badge
import { Button } from "@/components/ui/Button"; // RN-compatible Button
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card"; // RN-compatible Card
import { Separator } from "@/components/ui/Separator"; // RN-compatible Separator
import { SavedPracticePlan } from "@/types/practice-plan";

interface PlanCardProps {
  plan: SavedPracticePlan;
  onView: (plan: SavedPracticePlan) => void;
  onDelete: (planId: string) => void;
}

export const PlanCard = ({ plan, onView, onDelete }: PlanCardProps) => {
  const handleDelete = () => {
    Alert.alert(
      "Delete Practice Plan",
      "Are you sure you want to delete this practice plan? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(plan.id),
        },
      ]
    );
  };

  return (
    <Card className="rounded-lg shadow-sm mb-4">
      <CardHeader className="pb-2">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <CardTitle className="line-clamp-1">
              {plan.problem}
            </CardTitle>
            <CardDescription className="flex-row items-center gap-1 mt-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Text className="text-muted-foreground">
                {formatDistanceToNow(new Date(plan.created_at), { addSuffix: true })}
              </Text>
            </CardDescription>
          </View>
          <Badge variant="outline" className="ml-2">
            {plan.practice_plan?.practicePlan?.duration || "1 day"}
          </Badge>
        </View>
      </CardHeader>

      <CardContent className="pb-2">
        <Text className="text-sm text-muted-foreground line-clamp-2">
          {plan.diagnosis}
        </Text>
      </CardContent>

      <Separator />

      <CardFooter className="pt-4 flex-row justify-between">
        <Button onPress={() => onView(plan)} variant="outline">
          <Text>View Plan</Text>
        </Button>
        <Button
          onPress={handleDelete}
          variant="ghost"
          size="icon"
          className="text-destructive"
        >
          <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
};
