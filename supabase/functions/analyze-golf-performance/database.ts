
// Database operations module
export async function savePracticePlan(
  userId: string,
  specificProblem: string | undefined,
  practicePlanData: any,
  analysisData: any,
  supabaseUrl: string,
  supabaseKey: string
) {
  if (!practicePlanData && !analysisData) {
    throw new Error('No data to save');
  }

  try {
    const { data: dbData, error: dbError } = await fetch(`${supabaseUrl}/rest/v1/ai_practice_plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        user_id: userId,
        problem: specificProblem || "Golf performance optimization",
        diagnosis: practicePlanData?.diagnosis || "AI-generated performance analysis",
        root_causes: practicePlanData?.rootCauses || analysisData.identifiedIssues,
        recommended_drills: practicePlanData?.recommendedDrills || [
          analysisData.recommendedPractice.primaryDrill,
          analysisData.recommendedPractice.secondaryDrill
        ],
        practice_plan: practicePlanData || analysisData
      })
    }).then(res => res.json());

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return dbData;
  } catch (error) {
    console.error('Save practice plan error:', error);
    throw error;
  }
}
