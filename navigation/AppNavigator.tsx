
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import {
  Brain,
  Calendar,
  LucideGolf,
  User
} from '../components/icons/CustomIcons';
import { useAuth } from '../context/AuthContext';

// pages
import AIAnalysis from '../app/AIAnalysis';
import Auth from '../app/Auth';
import ChallengeHistory from '../app/ChallengeHistory';
import ChallengeLibrary from '../app/ChallengeLibrary';
import ChallengeTracking from '../app/ChallengeTracking';
import UserProfile from '../app/Profile';
import RoundsList from '../app/RoundsList';
import RoundTracking from '../app/RoundTracking';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#64748B',
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="ChallengeLibrary" 
        component={ChallengeLibrary} 
        options={{
          title: 'Challenges',
          tabBarIcon: ({ color }) => <LucideGolf width={24} height={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="RoundsList" 
        component={RoundsList} 
        options={{
          title: 'Rounds',
          tabBarIcon: ({ color }) => <Calendar width={24} height={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="AIAnalysis" 
        component={AIAnalysis} 
        options={{
          title: 'Analysis',
          tabBarIcon: ({ color }) => <Brain width={24} height={24} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={UserProfile} 
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User width={24} height={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, session } = useAuth();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0F172A' },
        }}
      >
        {!session ? (
          <Stack.Screen name="Auth" component={Auth} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen 
              name="ChallengeTracking" 
              component={ChallengeTracking}
              options={{
                headerShown: true,
                title: 'Challenge',
                headerStyle: {
                  backgroundColor: '#0F172A',
                },
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen 
              name="ChallengeHistory" 
              component={ChallengeHistory}
              options={{
                headerShown: true,
                title: 'Challenge History',
                headerStyle: {
                  backgroundColor: '#0F172A',
                },
                headerTintColor: '#FFFFFF',
              }}
            />
            <Stack.Screen 
              name="RoundTracking" 
              component={RoundTracking}
              options={{
                headerShown: true,
                title: 'Track Round',
                headerStyle: {
                  backgroundColor: '#0F172A',
                },
                headerTintColor: '#FFFFFF',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
