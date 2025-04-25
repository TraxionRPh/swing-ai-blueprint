
/**
 * This script can be run to populate the drills data in the database.
 * 
 * Run using: node scripts/populate-drills.js
 */
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://xocrhthipvspkndtkxeq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to format instructions into markdown
function formatInstructions(data) {
  let instructions = "How to perform:\n";
  
  if (data.instruction1) instructions += `1. ${data.instruction1}\n`;
  if (data.instruction2) instructions += `2. ${data.instruction2}\n`;
  if (data.instruction3) instructions += `3. ${data.instruction3}\n`;
  if (data.instruction4 && data.instruction4.trim() !== "") instructions += `4. ${data.instruction4}\n`;
  if (data.instruction5 && data.instruction5.trim() !== "") instructions += `5. ${data.instruction5}\n`;
  
  instructions += "\nCommon Mistakes:\n";
  
  if (data.common_mistake1 && data.common_mistake1.trim() !== "") instructions += `- ${data.common_mistake1}\n`;
  if (data.common_mistake2 && data.common_mistake2.trim() !== "") instructions += `- ${data.common_mistake2}\n`;
  if (data.common_mistake3 && data.common_mistake3.trim() !== "") instructions += `- ${data.common_mistake3}\n`;
  if (data.common_mistake4 && data.common_mistake4.trim() !== "") instructions += `- ${data.common_mistake4}\n`;
  if (data.common_mistake5 && data.common_mistake5.trim() !== "") instructions += `- ${data.common_mistake5}\n`;
  
  if (data.pro_tip) {
    instructions += "\nPro tip:\n";
    instructions += data.pro_tip;
  }
  
  return instructions;
}

const drillsData = [
  // Copy all the drills data from the edge function here
  // This is a backup method for adding the drills
];

async function populateDrills() {
  try {
    console.log('Adding drills to the database...');
    
    // Instead of using this script directly, we'll use the edge function
    console.log('This is a sample script. For production, use the Supabase Edge Function.');
    console.log('To deploy and run the edge function:');
    console.log('1. Deploy the edge function with: supabase functions deploy add-drills');
    console.log('2. Invoke the function with: supabase functions invoke add-drills');
    
  } catch (error) {
    console.error('Error adding drills:', error);
  }
}

populateDrills();
