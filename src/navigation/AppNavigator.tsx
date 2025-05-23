
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/context/AuthContext';

// Screens
import Dashboard from '@/screens/Dashboard';
import DrillLibrary from '@/screens/DrillLibrary';
import ChallengeLibrary from '@/screens/ChallengeLibrary';
import ChallengeTracking from '@/screens/ChallengeTracking';
import ChallengeHistory from '@/screens/ChallengeHistory';
import AIPracticePlans from '@/screens/AIPracticePlans';
import MyPracticePlans from '@/screens/MyPracticePlans';
import RoundTracking from '@/screens/RoundTracking';
import RoundsList from '@/screens/RoundsList';
import RoundDetail from '@/screens/RoundDetail';
import AIAnalysis from '@/screens/AIAnalysis';
import Profile from '@/screens/Profile';
import Subscription from '@/screens/Subscription';
import Auth from '@/screens/Auth';
import Welcome from '@/screens/Welcome';

// Icons
import { Home, Award, Dumbbell, Calendar, Clock, Brain, List, User } from '@/components/icons/CustomIcons';
import { Ionicons } from '@expo/vector-icons';

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1F2C',
          borderTopColor: '#2A2F3C',
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={Dashboard} 
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home stroke={color} width={24} height={24} />
        }}
      />
      <Tab.Screen 
        name="DrillsTab" 
        component={DrillLibrary}
        options={{
          tabBarLabel: 'Drills',
          tabBarIcon: ({ color }) => <Dumbbell stroke={color} width={24} height={24} />
        }}
      />
      <Tab.Screen 
        name="ChallengesTab" 
        component={ChallengeLibrary}
        options={{
          tabBarLabel: 'Challenges',
          tabBarIcon: ({ color }) => <Award stroke={color} width={24} height={24} />
        }}
      />
      <Tab.Screen 
        name="PracticeTab" 
        component={AIPracticePlans}
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color }) => <Calendar stroke={color} width={24} height={24} />
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User stroke={color} width={24} height={24} />
        }}
      />
    </Tab.Navigator>
  );
};

// Auth navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="Welcome" component={Welcome} />
    </Stack.Navigator>
  );
};

// App navigator
const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ChallengeTracking" component={ChallengeTracking} />
            <Stack.Screen name="ChallengeHistory" component={ChallengeHistory} />
            <Stack.Screen name="MyPracticePlans" component={MyPracticePlans} />
            <Stack.Screen name="RoundTracking" component={RoundTracking} />
            <Stack.Screen name="RoundsList" component={RoundsList} />
            <Stack.Screen name="RoundDetail" component={RoundDetail} />
            <Stack.Screen name="AIAnalysis" component={AIAnalysis} />
            <Stack.Screen name="Subscription" component={Subscription} />
          </>
        ) : (
          <Stack.Screen name="AuthFlow" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
