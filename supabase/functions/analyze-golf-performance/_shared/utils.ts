
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const responseHandler = {
  success: (data: any, status: number = 200) => {
    return new Response(
      JSON.stringify(data),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  },
  error: (message: string, status: number = 400) => {
    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};
