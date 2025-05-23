import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Dashboard from './src/screens/Dashboard';
import DrillLibrary from './src/screens/DrillLibrary';
import ChallengeLibrary from './src/screens/ChallengeLibrary';
// …import your other screens here

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="DrillLibrary" component={DrillLibrary} />
        <Stack.Screen name="ChallengeLibrary" component={ChallengeLibrary} />
        {/* …and so on */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default registerRootComponent(App);
