
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Calendar, Brain } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose which notifications you'd like to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bell className="h-5 w-5 text-primary" />
            <Label htmlFor="practice-reminders">Practice Reminders</Label>
          </div>
          <Switch
            id="practice-reminders"
            checked={preferences.practice_reminders}
            onCheckedChange={(checked) => updatePreferences({ practice_reminders: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-primary" />
            <Label htmlFor="round-completion">Round Completion Reminders</Label>
          </div>
          <Switch
            id="round-completion"
            checked={preferences.round_completion_reminders}
            onCheckedChange={(checked) => updatePreferences({ round_completion_reminders: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-5 w-5 text-primary" />
            <Label htmlFor="ai-insights">AI Insights</Label>
          </div>
          <Switch
            id="ai-insights"
            checked={preferences.ai_insights}
            onCheckedChange={(checked) => updatePreferences({ ai_insights: checked })}
          />
        </div>
      </CardContent>
    </Card>
  );
};
