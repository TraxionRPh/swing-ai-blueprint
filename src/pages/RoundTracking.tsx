
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LucideGolf } from "@/components/icons/CustomIcons";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Mock data for past rounds
const pastRounds = [
  { 
    id: 1, 
    date: "2025-04-15", 
    course: "Pebble Beach Golf Links", 
    score: 87, 
    putts: 31, 
    fairways: 8, 
    greens: 7,
    handicapDiff: 15.2
  },
  { 
    id: 2, 
    date: "2025-04-10", 
    course: "Pinehurst No. 2", 
    score: 92, 
    putts: 34, 
    fairways: 7, 
    greens: 6,
    handicapDiff: 19.8
  },
  { 
    id: 3, 
    date: "2025-04-03", 
    course: "Oakland Hills South", 
    score: 84, 
    putts: 28, 
    fairways: 9, 
    greens: 10,
    handicapDiff: 12.1
  },
];

const RoundTracking = () => {
  const [activeTab, setActiveTab] = useState("past-rounds");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Form state for new round
  const [roundData, setRoundData] = useState({
    date: new Date().toISOString().split('T')[0],
    course: "",
    score: "",
    putts: "",
    fairways: "",
    greens: "",
  });
  
  const handleInputChange = (field: string, value: string) => {
    setRoundData({ ...roundData, [field]: value });
  };
  
  const handleSubmitRound = () => {
    setIsSubmitting(true);
    
    // Validate form
    if (!roundData.course || !roundData.score) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Round added successfully",
        description: `Your round at ${roundData.course} has been recorded.`,
      });
      
      // Reset form and switch to past rounds
      setRoundData({
        date: new Date().toISOString().split('T')[0],
        course: "",
        score: "",
        putts: "",
        fairways: "",
        greens: "",
      });
      setActiveTab("past-rounds");
      setIsSubmitting(false);
    }, 1500);
  };
  
  // Round details dialog state
  const [selectedRound, setSelectedRound] = useState<any>(null);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Round Tracking</h1>
        <p className="text-muted-foreground">
          Track your golf rounds and analyze your performance
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="past-rounds">Past Rounds</TabsTrigger>
          <TabsTrigger value="add-round">Add Round</TabsTrigger>
          <TabsTrigger value="handicap">Handicap History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="past-rounds" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Rounds</CardTitle>
              <CardDescription>
                View and analyze your most recent golf rounds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="hidden sm:table-cell">Putts</TableHead>
                    <TableHead className="hidden md:table-cell">FIR</TableHead>
                    <TableHead className="hidden md:table-cell">GIR</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastRounds.map(round => (
                    <TableRow key={round.id}>
                      <TableCell>
                        {new Date(round.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{round.course}</TableCell>
                      <TableCell>{round.score}</TableCell>
                      <TableCell className="hidden sm:table-cell">{round.putts}</TableCell>
                      <TableCell className="hidden md:table-cell">{round.fairways}/14</TableCell>
                      <TableCell className="hidden md:table-cell">{round.greens}/18</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRound(round)}
                            >
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>{round.course}</DialogTitle>
                              <DialogDescription>
                                {new Date(round.date).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted rounded-lg p-3 text-center">
                                  <p className="text-sm text-muted-foreground mb-1">Score</p>
                                  <p className="text-2xl font-bold">{round.score}</p>
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-center">
                                  <p className="text-sm text-muted-foreground mb-1">Handicap Diff.</p>
                                  <p className="text-2xl font-bold">{round.handicapDiff}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4">
                                <div className="bg-muted rounded-lg p-3 text-center">
                                  <p className="text-sm text-muted-foreground mb-1">Putts</p>
                                  <p className="text-xl font-bold">{round.putts}</p>
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-center">
                                  <p className="text-sm text-muted-foreground mb-1">FIR</p>
                                  <p className="text-xl font-bold">{round.fairways}/14</p>
                                </div>
                                <div className="bg-muted rounded-lg p-3 text-center">
                                  <p className="text-sm text-muted-foreground mb-1">GIR</p>
                                  <p className="text-xl font-bold">{round.greens}/18</p>
                                </div>
                              </div>
                              
                              {/* Placeholder for more stats */}
                              <div className="border rounded-lg p-4">
                                <p className="text-sm font-medium mb-2">Round Notes</p>
                                <p className="text-sm text-muted-foreground">
                                  No notes added for this round.
                                </p>
                              </div>
                            </div>
                            <DialogFooter className="sm:justify-start">
                              <Button variant="secondary" type="button">
                                Edit Round
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" disabled>
                Previous
              </Button>
              <Button variant="outline" disabled>
                Next
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="add-round" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Add New Round</CardTitle>
              <CardDescription>
                Record details about your latest golf round
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      value={roundData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course Name</Label>
                    <Input 
                      id="course" 
                      placeholder="Enter course name" 
                      value={roundData.course}
                      onChange={(e) => handleInputChange("course", e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Total Score</Label>
                    <Input 
                      id="score" 
                      type="number"
                      placeholder="e.g., 85" 
                      value={roundData.score}
                      onChange={(e) => handleInputChange("score", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="putts">Putts</Label>
                    <Input 
                      id="putts" 
                      type="number"
                      placeholder="e.g., 32" 
                      value={roundData.putts}
                      onChange={(e) => handleInputChange("putts", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tees">Tees Played</Label>
                    <Select>
                      <SelectTrigger id="tees">
                        <SelectValue placeholder="Select tees" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="championship">Championship</SelectItem>
                        <SelectItem value="back">Back</SelectItem>
                        <SelectItem value="middle">Middle</SelectItem>
                        <SelectItem value="forward">Forward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fairways">Fairways Hit</Label>
                    <Input 
                      id="fairways" 
                      type="number"
                      placeholder="e.g., 9/14" 
                      value={roundData.fairways}
                      onChange={(e) => handleInputChange("fairways", e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="greens">Greens in Regulation</Label>
                    <Input 
                      id="greens" 
                      type="number"
                      placeholder="e.g., 8/18" 
                      value={roundData.greens}
                      onChange={(e) => handleInputChange("greens", e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSubmitRound}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Save Round"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="handicap" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Handicap History</CardTitle>
              <CardDescription>
                Track your handicap progress over time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="text-center space-y-2 mb-6">
                <h3 className="text-6xl font-bold">18.2</h3>
                <p className="text-muted-foreground">Current Handicap Index</p>
              </div>
              <LucideGolf className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground max-w-md text-center">
                Your handicap index is calculated from your 8 best scores from your last 20 rounds.
                Add more rounds to see your handicap history chart here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RoundTracking;
