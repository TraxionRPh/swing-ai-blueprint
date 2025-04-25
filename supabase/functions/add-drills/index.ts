
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const drillsData = [
  {
    "title": "Tee Gate Drill",
    "overview": "Fix slicing/hooking by training your clubface to come through the ball square on the correct path.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Accuracy", "Path", "Face Control"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Stick two tees in the ground just outside your clubhead — one by the toe and one by the heel — spaced wide enough that your club can pass through cleanly on a good swing.",
      common_mistake1: "Too narrow or wide spacing — adjust so it's challenging but fair",
      instruction2: "Place a ball in the middle.",
      common_mistake2: "Scooping or pulling = you'll hit a tee",
      instruction3: "Hit the ball without touching either tee.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Start with half swings. Once you're clearing the tees consistently, move to full speed."
    })
  },
  {
    "title": "One-Foot Driver Drill",
    "overview": "Improve balance and center contact by challenging your stability during the swing.",
    "difficulty": "Intermediate",
    "category": "Driving", 
    "duration": "15 minutes",
    "focus": ["Balance", "Contact", "Stability"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Set up to hit a drive.",
      common_mistake1: "Falling over or off balance — go slower",
      instruction2: "Move your trail foot (right foot for right-handers) back behind you so only the toe is on the ground.",
      common_mistake2: "Overswinging — this drill is about control, not distance",
      instruction3: "Swing slowly, focusing on staying balanced and striking the ball cleanly.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "You should feel your core working. If you don't, you're probably swinging too hard."
    })
  },
  {
    "title": "Slow Motion Driver",
    "overview": "Fix poor sequencing and improve feel for swing path, clubface, and tempo.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Tempo", "Sequencing", "Feel"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Hit 10 drives at no more than 50% of your normal speed.",
      common_mistake1: "Rushing the backswing even if the downswing is slow",
      instruction2: "Focus on a smooth takeaway, controlled transition, and balanced finish.",
      common_mistake2: "Decelerating through impact",
      instruction3: "Listen and feel for clean, centered contact — don't worry about distance.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "If the ball flies straight at half speed, you've got the sequence right. Speed up slowly from there."
    })
  },
  {
    "title": "Alignment Stick Launch",
    "overview": "Fix slicing and poor launch angle by grooving an upward angle of attack.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Launch Angle", "Path", "Attack Angle"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Stick an alignment rod in the ground 10 feet in front of you, on your target line, about 3 feet high.",
      common_mistake1: "Hitting down or topping the ball",
      instruction2: "Try to hit drives that start just above the stick.",
      common_mistake2: "Aiming right to \"go around\" the stick — don't cheat",
      instruction3: "Tee the ball high and focus on hitting up through the ball.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Video yourself from the side. You should see the driver moving upward through impact."
    })
  },
  {
    "title": "Step-Through Drill",
    "overview": "Train better rhythm and lower body sequencing to gain distance and consistency.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Weight Transfer", "Sequencing", "Rhythm"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Take your setup normally.",
      common_mistake1: "Stepping too late or too early — timing is key",
      instruction2: "Start your backswing.",
      common_mistake2: "Losing balance — start slow",
      instruction3: "As you start your downswing, step your back foot forward (toward target), finishing with all your weight on your front foot.",
      common_mistake3: "",
      instruction4: "Let your momentum carry you into a full finish.",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "This drill exaggerates good lower-body motion. Try it barefoot for bonus feedback on balance."
    })
  },
  {
    "title": "Hold the Finish",
    "overview": "Improve balance, tempo, and swing consistency by focusing on your finish position.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Balance", "Finish", "Follow Through"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Set up normally with your driver.",
      common_mistake1: "Rushing the swing or falling out of balance.",
      instruction2: "Swing with the goal of holding your finish position for a full 3 seconds.",
      common_mistake2: "Not completing the follow-through — don't cut the swing short.",
      instruction3: "You should end with your chest facing the target, your back heel off the ground, and full weight on your lead foot.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "If you can't hold your finish, you're either swinging too hard or off balance. Slow it down and work up."
    })
  },
  {
    "title": "Wide-Narrow-Wide",
    "overview": "Improve swing shape and tempo by exaggerating correct body and arm movement.",
    "difficulty": "Advanced",
    "category": "Driving",
    "duration": "20 minutes",
    "focus": ["Tempo", "Width", "Sequencing"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Take practice swings focusing on a wide takeaway (arms extended).",
      common_mistake1: "Staying narrow or collapsing arms too early.",
      instruction2: "As you transition down, feel your arms narrow and hands drop close to your body.",
      common_mistake2: "Forcing the motion without flow.",
      instruction3: "Re-extend through the ball with width in your arms and follow-through.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Use slow-motion swings to exaggerate each phase."
    })
  },
  {
    "title": "Impact Bag Smash",
    "overview": "Train for solid contact and a square clubface at impact.",
    "difficulty": "Beginner",
    "category": "Driving",
    "duration": "10 minutes",
    "focus": ["Impact", "Contact", "Clubface"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Set up an impact bag where you would normally hit the ball.",
      common_mistake1: "Flipping or scooping the club into the bag.",
      instruction2: "Make swings into the bag, focusing on hitting it with a square clubface and forward shaft lean.",
      common_mistake2: "Hitting with poor body rotation.",
      instruction3: "Your lead wrist should be flat, not cupped, at impact.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Video your body and hands at impact — you should look like a Tour player (even if the swing isn't!)."
    })
  },
  {
    "title": "Feet-Together Driver",
    "overview": "Improve tempo and center contact by restricting lower body sway.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Tempo", "Center Contact", "Balance"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Set up with your feet just a few inches apart, heels touching.",
      common_mistake1: "Trying to hit hard — you'll lose balance instantly.",
      instruction2: "Make ¾ swings focused on rhythm and balance.",
      common_mistake2: "Using full swing without control.",
      instruction3: "Don't overswing — the goal is to strike the center of the face repeatedly.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Track your strike location on the face. If you can hit it pure with feet together, you're golden with a full stance."
    })
  },
  {
    "title": "No Backswing Driver",
    "overview": "Build a better downswing path and train your transition.",
    "difficulty": "Beginner",
    "category": "Driving",
    "duration": "10 minutes",
    "focus": ["Transition", "Downswing", "Path"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Start with the club already set at the top of the backswing.",
      common_mistake1: "Lifting the club higher before swinging.",
      instruction2: "From this position, swing down and hit the ball.",
      common_mistake2: "Getting stuck — keep it fluid.",
      instruction3: "Focus on body rotation and shallow club delivery.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "This is great for people who swing over the top. Feel the club drop instead of cast."
    })
  },
  {
    "title": "Tee Height Test",
    "overview": "Find the optimal launch angle and spin for your swing.",
    "difficulty": "Advanced",
    "category": "Driving",
    "duration": "20 minutes",
    "focus": ["Launch", "Optimization", "Ball Flight"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Hit 5 drives with a low tee, 5 with a mid tee, 5 with a high tee.",
      common_mistake1: "Ignoring launch conditions.",
      instruction2: "Track which ones you strike best and how they fly (low bullet, high spinny, etc).",
      common_mistake2: "Only focusing on feel — watch the ball flight.",
      instruction3: "Choose the tee height that gives consistent center face contact and optimal trajectory.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Use foot spray or impact tape to verify your strike position on the face."
    })
  },
  {
    "title": "Split Grip Driver",
    "overview": "Train the wrists and hands to work properly through the ball.",
    "difficulty": "Beginner",
    "category": "Driving",
    "duration": "10 minutes",
    "focus": ["Release", "Lag", "Hands"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Place your top hand at the top of the grip and your bottom hand halfway down the shaft.",
      common_mistake1: "Gripping too tightly.",
      instruction2: "Make controlled swings focusing on wrist hinge and a late release.",
      common_mistake2: "Casting the club — it should trail, then release naturally.",
      instruction3: "Feel how the clubhead lags and whips through the ball.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "You should hear a strong 'whoosh' at the bottom of your swing arc, not early."
    })
  },
  {
    "title": "Towel Under Arm",
    "overview": "Improve body-arm connection during takeaway and downswing.",
    "difficulty": "Beginner",
    "category": "Driving",
    "duration": "10 minutes",
    "focus": ["Connection", "Takeaway", "Body Rotation"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Tuck a towel under both arms (or just trail arm).",
      common_mistake1: "Letting elbows fly out.",
      instruction2: "Make swings trying to keep the towel in place throughout.",
      common_mistake2: "Swinging only with arms.",
      instruction3: "Focus on staying connected and rotating the chest, not swinging arms independently.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "This drill forces your body and arms to work as one unit. Great for inside takeaway and controlling clubface."
    })
  },
  {
    "title": "Lead Hand Only",
    "overview": "Build clubface control and lead side strength.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Clubface Control", "Lead Side", "Wrist Stability"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Hold the driver with only your lead hand (left for right-handed golfers).",
      common_mistake1: "Letting wrist collapse at impact.",
      instruction2: "Take slow, half-speed swings while maintaining control.",
      common_mistake2: "Swinging too fast and losing control.",
      instruction3: "Focus on squaring the face and holding a firm wrist angle.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Start with practice swings only, then move to hitting foam balls or low-tee shots."
    })
  },
  {
    "title": "Back to the Target Drill",
    "overview": "Improve loading and transition by controlling tempo.",
    "difficulty": "Intermediate",
    "category": "Driving",
    "duration": "15 minutes",
    "focus": ["Transition", "Loading", "Tempo"],
    "video_url": null,
    "instructions": formatInstructions({
      instruction1: "Take your normal backswing.",
      common_mistake1: "Rushing the transition.",
      instruction2: "Pause at the top — your back should feel like it's fully facing the target.",
      common_mistake2: "Starting the downswing with the shoulders.",
      instruction3: "Begin your downswing slowly, using your lower body to lead.",
      common_mistake3: "",
      instruction4: "",
      common_mistake4: "",
      instruction5: "",
      common_mistake5: "",
      pro_tip: "Feel like you 'sit into' the downswing. Your arms will naturally follow."
    })
  }
];

// Function to format instructions into markdown
function formatInstructions(data: any) {
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

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );
    
    const { data, error } = await supabaseClient
      .from("drills")
      .insert(drillsData)
      .select();
      
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, message: "Drills added successfully", count: data.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
});

// Helper function to create a Supabase client (required for the edge function)
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      insert: (data: any) => ({
        select: () => {
          const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
            "apikey": supabaseKey
          };
          
          return fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: "POST",
            headers,
            body: JSON.stringify(data),
          }).then(response => response.json());
        }
      })
    })
  };
}
