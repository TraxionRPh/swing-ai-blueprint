
# ChipAway - Golf Training App (React Native)

This is the React Native version of the ChipAway golf training application.

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Start the development server:
```
npx expo start
```

## Required Dependencies to Add

Please add the following dependencies manually to your package.json file:

```json
"dependencies": {
  "@expo/vector-icons": "^14.0.0",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/stack": "^6.3.20",
  "@react-native-async-storage/async-storage": "1.21.0",
  "expo": "~50.0.0",
  "expo-status-bar": "~1.11.1",
  "lucide-react-native": "^0.358.0",
  "react": "18.2.0",
  "react-native": "0.73.4",
  "react-native-gesture-handler": "~2.14.0",
  "react-native-safe-area-context": "4.8.2",
  "react-native-screens": "~3.29.0",
  "react-native-svg": "14.1.0",
  "react-native-url-polyfill": "^2.0.0"
},
"devDependencies": {
  "@babel/core": "^7.20.0",
  "@types/react": "~18.2.45",
  "typescript": "^5.3.0"
}
```

Also make sure to add the `"build:dev"` script to package.json:

```json
"scripts": {
  "build:dev": "vite build --mode development",
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

## Project Structure

- `/src/screens` - Main app screens
- `/src/components` - UI components
- `/src/components/ui` - Shared UI components
- `/src/navigation` - Navigation configuration
- `/src/context` - Context providers (Auth, etc.)
- `/src/integrations` - Third-party integrations (Supabase)
