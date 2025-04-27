
// CORS handling for Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function cors(request: Request, response: Response): Response {
  // Add CORS headers to the response
  const headers = new Headers(response.headers);
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  // Return the response with CORS headers
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
