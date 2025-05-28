import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  expo: {
    name: "SwingAI",
    slug: "swing-ai-blueprint",
    version: "1.0.0",
    scheme: "swingaiblueprint",
    orientation: "portrait",
    owner: "gskaff",
    android: {
      package: "com.chipaway.swingai",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    splash: {
      backgroundColor: "#0F172A",
    },
    icon: "./assets/icon.png",
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: config.expo?.extra?.router ?? {},
      eas: {
        projectId: "e3f7e8fb-c7a8-4472-b1d6-d0f738c2fd51",
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    },
  },
});
