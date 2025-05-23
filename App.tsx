import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import your screens
import Dashboard from './src/screens/Dashboard';
import DrillLibrary from './src/screens/DrillLibrary';
import ChallengeLibrary from './src/screens/ChallengeLibrary';
// …and so on

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="DrillLibrary" component={DrillLibrary} />
        <Stack.Screen name="ChallengeLibrary" component={ChallengeLibrary} />
        {/* add the rest of your src/screens/*.tsx here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default registerRootComponent(App);
