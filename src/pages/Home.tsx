
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { LucideGolf, Home, Dumbbell, Award, List, Brain } from "@/components/icons/CustomIcons";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  });

  const quickLinks = [
    {
      title: "Dashboard",
      icon: Home,
      description: "View your golf performance metrics",
      path: "/dashboard",
      color: "bg-blue-100 dark:bg-blue-900"
    },
    {
      title: "Drills",
      icon: Dumbbell,
      description: "Practice drills to improve your game",
      path: "/drills",
      color: "bg-green-100 dark:bg-green-900"
    },
    {
      title: "Challenges",
      icon: Award,
      description: "Take on challenges to test your skills",
      path: "/challenges",
      color: "bg-amber-100 dark:bg-amber-900"
    },
    {
      title: "Round Tracking",
      icon: List,
      description: "Log and analyze your rounds",
      path: "/rounds",
      color: "bg-purple-100 dark:bg-purple-900"
    },
    {
      title: "AI Analysis",
      icon: Brain,
      description: "Get AI-powered insights for your game",
      path: "/ai-analysis",
      color: "bg-indigo-100 dark:bg-indigo-900"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <header className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center mb-4">
          <LucideGolf className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold">SwingAI</h1>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{greeting}, {user?.email?.split('@')[0] || 'Golfer'}</h2>
            <p className="text-muted-foreground mt-1">Ready to improve your golf game today?</p>
          </div>
          <Button 
            className="mt-4 md:mt-0" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link) => (
              <HoverCard key={link.title} openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-all" 
                    onClick={() => navigate(link.path)}
                  >
                    <CardHeader className={`rounded-t-lg ${link.color}`}>
                      <div className="flex items-center">
                        <link.icon className="h-6 w-6 mr-2" />
                        <CardTitle className="text-lg">{link.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-muted-foreground text-sm">{link.description}</p>
                    </CardContent>
                  </Card>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="flex justify-between space-x-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{link.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                      <Button 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigate(link.path)}
                      >
                        Open {link.title}
                      </Button>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Progress</CardTitle>
              <CardDescription>Your golf journey at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Handicap</span>
                  <span className="font-medium">18.2</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Round</span>
                  <span className="font-medium">83</span>
                </div>
                <div className="flex justify-between">
                  <span>Practice Hours</span>
                  <span className="font-medium">12 hrs this month</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                View Full Dashboard
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendation</CardTitle>
              <CardDescription>Personalized tip for your game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-1">Putting Practice</h4>
                <p className="text-sm text-muted-foreground">
                  Based on your recent rounds, try the "Clock Drill" to improve your distance control on putts.
                  This can help reduce your three-putt frequency.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate('/ai-analysis')}>
                View All Insights
              </Button>
            </CardFooter>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Home;
