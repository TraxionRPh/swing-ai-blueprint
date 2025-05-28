import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config,
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
    }
  };
};
