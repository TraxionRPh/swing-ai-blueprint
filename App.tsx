import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './src/screens/Dashboard';
import DrillLibrary from './src/screens/DrillLibrary';
// ...import other screens

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="DrillLibrary" component={DrillLibrary} />
        {/* ...other screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
