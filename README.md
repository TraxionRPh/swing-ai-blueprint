
# ChipAway - Golf Training App (React Native)

This is the React Native version of the ChipAway golf training application.

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Add the `build:dev` script to package.json file manually (this is required for Lovable to build the project):
```json
"scripts": {
  "build:dev": "vite build --mode development",
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web"
}
```

3. Start the development server:
```
npx expo start
```

## Required Dependencies

Please install the following dependencies:

```bash
npx expo install @expo/vector-icons @react-navigation/bottom-tabs @react-navigation/native @react-navigation/stack @react-native-async-storage/async-storage expo expo-status-bar lucide-react-native react react-native react-native-gesture-handler react-native-safe-area-context react-native-screens react-native-svg react-native-url-polyfill @supabase/supabase-js @tanstack/react-query
```

## Project Structure

- `/src/screens` - Main app screens
- `/src/components` - UI components
- `/src/components/ui` - Shared UI components
- `/src/navigation` - Navigation configuration
- `/src/context` - Context providers (Auth, etc.)
- `/src/integrations` - Third-party integrations (Supabase)
