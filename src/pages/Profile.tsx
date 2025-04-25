
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useProfile, HandicapLevel } from "@/hooks/useProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { NotificationPreferences } from "@/components/profile/NotificationPreferences";

const Profile = () => {
  const { handicap, goals, isPremium, loading, saveProfile, firstName, lastName, avatarUrl } = useProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [localHandicap, setLocalHandicap] = useState<HandicapLevel | null>(handicap);
  const [localGoals, setLocalGoals] = useState<string | null>(goals);
  const [localFirstName, setLocalFirstName] = useState<string | null>(firstName);
  const [localLastName, setLocalLastName] = useState<string | null>(lastName);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null>(avatarUrl);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveProfile({
        handicap: localHandicap || undefined,
        goals: localGoals || undefined,
        firstName: localFirstName || undefined,
        lastName: localLastName || undefined,
        avatarUrl: localAvatarUrl || undefined,
      });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center pb-6">
            <AvatarUpload
              url={localAvatarUrl}
              onUpload={(url) => setLocalAvatarUrl(url)}
              size={150}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={localFirstName || ''}
                onChange={(e) => setLocalFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={localLastName || ''}
                onChange={(e) => setLocalLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetScore">Target Round Score</Label>
              <div className="text-muted-foreground">
                {scoreGoal ? `${scoreGoal} strokes` : 'Not set'}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetHandicap">Target Handicap</Label>
              <div className="text-muted-foreground">
                {handicapGoal ? `${handicapGoal} handicap` : 'Not set'}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skill Level</h3>
            <RadioGroup value={localHandicap || ''} onValueChange={(value) => setLocalHandicap(value as HandicapLevel)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">Beginner (36+ handicap)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="novice" id="novice" />
                <Label htmlFor="novice">Novice (25-36 handicap)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate (15-24 handicap)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced">Advanced (5-14 handicap)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expert" id="expert" />
                <Label htmlFor="expert">Expert (0-4 handicap)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pro" id="pro" />
                <Label htmlFor="pro">Professional (+ handicap)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Goals</h3>
            <Textarea 
              placeholder="What are your golf improvement goals?"
              value={localGoals || ''}
              onChange={(e) => setLocalGoals(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <NotificationPreferences />

      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Manage your subscription and access premium features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Shield className={isPremium ? "text-green-500" : "text-gray-400"} />
            <span className="font-medium">
              {isPremium ? 'Premium Member' : 'Free Tier'}
            </span>
          </div>
          {!isPremium && (
            <Button variant="outline" onClick={() => window.location.href = '/subscription'}>
              Upgrade to Premium
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
