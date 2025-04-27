
-- Sample golf drills to add to the database

-- Alignment Rod Path Drill
INSERT INTO public.drills (
  id, title, description, overview, category, focus, difficulty, duration,
  instruction1, instruction2, instruction3, common_mistake1, common_mistake2, pro_tip
) VALUES (
  '7c5d6a9e-3b2f-4c1a-8d7e-5f9b6c2a3d8e',
  'Alignment Rod Path Drill',
  'Improve swing path and alignment',
  'Use alignment rods to visualize and correct your swing path',
  'driving',
  ARRAY['swing path', 'alignment', 'driver'],
  'Intermediate',
  '15 minutes',
  'Place one alignment rod on the ground pointing at your target',
  'Place another rod parallel to the first, creating a channel',
  'Practice swinging along the channel to improve your path',
  'Swinging too much from outside-in',
  'Not maintaining proper alignment throughout swing',
  'Focus on shoulder rotation staying parallel to the alignment rods'
) ON CONFLICT (id) DO NOTHING;

-- Towel Under Arms Drill
INSERT INTO public.drills (
  id, title, description, overview, category, focus, difficulty, duration,
  instruction1, instruction2, instruction3, common_mistake1, common_mistake2, pro_tip
) VALUES (
  '9a8b7c6d-5e4f-3g2h-1i0j-6k5l4m3n2o1p',
  'Towel Under Arms Drill',
  'Improve connection and swing plane',
  'Placing a towel under both armpits helps maintain connection during your swing',
  'irons',
  ARRAY['connection', 'swing plane', 'consistency'],
  'Beginner',
  '20 minutes',
  'Place a small towel under both armpits',
  'Take slow, smooth swings while keeping the towel in place',
  'Focus on turning your body without losing the towels',
  'Lifting arms independently of the body turn',
  'Swinging too fast, causing loss of connection',
  'Start with half swings before progressing to full swings'
) ON CONFLICT (id) DO NOTHING;

-- Gate Putting Drill
INSERT INTO public.drills (
  id, title, description, overview, category, focus, difficulty, duration,
  instruction1, instruction2, instruction3, instruction4, common_mistake1, common_mistake2, pro_tip
) VALUES (
  '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
  'Gate Putting Drill',
  'Improve putting accuracy and consistency',
  'Using two tees to create a gate for your putter to pass through',
  'putting',
  ARRAY['accuracy', 'putting path', 'face control'],
  'Beginner',
  '15 minutes',
  'Place two tees in the ground slightly wider than your putter head',
  'Position your ball 2-3 feet from the hole with the tees in between',
  'Practice putting through the gate without hitting the tees',
  'Gradually increase distance as you improve',
  'Opening or closing the putter face',
  'Decelerating through impact',
  'Focus on a consistent tempo throughout the stroke'
) ON CONFLICT (id) DO NOTHING;

-- Clock Chipping Drill
INSERT INTO public.drills (
  id, title, description, overview, category, focus, difficulty, duration,
  instruction1, instruction2, instruction3, instruction4, common_mistake1, common_mistake2, common_mistake3, pro_tip
) VALUES (
  '2c3d4e5f-6g7h-8i9j-0k1l-2m3n4o5p6q',
  'Clock Chipping Drill',
  'Master distance control in your short game',
  'Practice chipping to different positions around the hole like a clock face',
  'chipping',
  ARRAY['distance control', 'touch', 'short game'],
  'Intermediate',
  '25 minutes',
  'Place targets at 1, 3, 5, 7, 9 and 11 o''clock positions around a hole',
  'From the same position, chip to each target in sequence',
  'Focus on varying power while maintaining the same technique',
  'Track your success rate and try to improve each round',
  'Using too much wrist action',
  'Inconsistent low point control',
  'Deceleration through impact',
  'Change clubs rather than drastically changing your technique for different distances'
) ON CONFLICT (id) DO NOTHING;

-- Bunker Splash Drill
INSERT INTO public.drills (
  id, title, description, overview, category, focus, difficulty, duration,
  instruction1, instruction2, instruction3, instruction4, common_mistake1, common_mistake2, common_mistake3, pro_tip
) VALUES (
  '3d4e5f6g-7h8i-9j0k-1l2m-3n4o5p6q7r',
  'Bunker Splash Drill',
  'Improve sand shots with better technique',
  'Practice creating the right amount of splash in bunker shots',
  'bunker',
  ARRAY['sand play', 'bunker technique', 'consistency'],
  'Advanced',
  '20 minutes',
  'Draw a line in the sand about 2 inches behind where you''d place the ball',
  'Practice hitting 2 inches behind the line, focusing on splash',
  'Let the club bounce through the sand rather than digging',
  'Once comfortable, add a ball and continue the same motion',
  'Hitting too close to the ball',
  'Decelerating through the sand',
  'Not opening the club face enough',
  'Open your stance and clubface more for softer landing shots'
) ON CONFLICT (id) DO NOTHING;
