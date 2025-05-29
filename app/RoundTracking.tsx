import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';
import DateTimePicker from '@react-native-community/datetimepicker';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export default function RoundTracking() {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [roundDate, setRoundDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [courseInfo, setCourseInfo] = useState({
    name: '',
    city: '',
    state: '',
  });
  const [holes, setHoles] = useState(
    Array.from({ length: 18 }, () => ({ par: '4', score: '', putts: '', fir: false, gir: false }))
  );
  const [suggestions, setSuggestions] = useState<Array<{ name: string; city: string; state: string }>>([]);
  const [allowSuggestions, setAllowSuggestions] = useState(true);

  useEffect(() => {
    if (!courseInfo.name || !allowSuggestions) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('name, city, state')
        .ilike('name', `%${courseInfo.name}%`)
        .limit(5);
      if (!error && data) setSuggestions(data);
    }, 300);
    return () => clearTimeout(handler);
  }, [courseInfo.name, allowSuggestions]);
  
  const handleHoleChange = (idx: number, field: 'par'|'score'|'putts', val: string) => {
    setHoles(h =>
      h.map((hole, i) =>
        i === idx ? { ...hole, [field]: val } : hole
      )
    );
  }

  const onSelectSuggestion = async (c: { name: string; city: string; state: string }) => {
    setCourseInfo({ name: c.name, city: c.city, state: c.state });
    setAllowSuggestions(false);
    setSuggestions([]);

    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .select('id')
      .eq('name', c.name)
      .eq('city', c.city)
      .eq('state', c.state)
      .single();
    if (courseErr) return Alert.alert("Couldn't find course");
    setCourseId(course.id);

    const { data: pars } = await supabase
      .from('course_holes')
      .select('hole_number, par')
      .eq('course_id', course.id);

    if (pars && pars.length > 0) {
      const newHoles = Array.from({ length: 18 }, (_, i) => {
        const p = pars.find(x => x.hole_number === i + 1);
        return {
          par: p ? String(p.par) : '4',
          score: '',
          putts: '',
          fir: false,
          gir: false,
        };
      });
      setHoles(newHoles);
    }
  };

  const handleCheckboxChange = (
    idx: number,
    field: 'fir' | 'gir',
    val: boolean
  ) => {
    setHoles((h) => 
      h.map((hole, i) =>
        i === idx ? { ...hole, [field]: val } : hole
      )
    );
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
    } else {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        Alert.alert('Not signed in');
        return;
      }
      let { data: course, error: findErr } = await supabase
        .from('courses')
        .select('id')
        .eq('name', courseInfo.name)
        .eq('city', courseInfo.city)
        .eq('state', courseInfo.state)
        .single();

      if (findErr || !course) {
        const { data: newCourse, error: insErr } = await supabase
          .from('courses')
          .insert({
            name:  courseInfo.name,
            city:  courseInfo.city,
            state: courseInfo.state,
          })
          .select('id')
          .single();
        if (insErr) {
          Alert.alert('Error saving course', insErr.message);
          return;
        }
        course = newCourse!;
      }
      const courseId = course.id;

      const totalScore = holes.reduce((sum, h) => sum + Number(h.score || 0), 0);
      const holeCount = holes.length;
      const date = roundDate.toISOString().split('T')[0];

      const { data: round, error: roundErr } = await supabase
        .from('rounds')
        .insert({
          course_id:   courseId,
          user_id:     user.id,
          date,
          hole_count:  holeCount,
          total_score: totalScore,
        })
        .select('id')
        .single();
      if (roundErr) {
        Alert.alert('Error saving round', roundErr.message);
        return;
      }

      const { data: existing } = await supabase
        .from('course_holes')
        .select('hole_number')
        .eq('course_id', courseId);
      if (!existing?.length) {
        const coursePars = holes.map((h, i) => ({
          course_id: courseId,
          hole_number: i + 1,
          par: Number(h.par),
        }));
        await supabase.from('course_holes').insert(coursePars);
      }
      
      const holeRows = holes.map((h, i) => ({
        round_id:    round.id,
        hole_number: i + 1,
        par:         Number(h.par),
        score:       Number(h.score),
        putts:       Number(h.putts),
        fir: h.fir,
        gir: h.gir,
      }));
      const { error: holesErr } = await supabase
        .from('round_holes')
        .insert(holeRows);
      if (holesErr) {
        Alert.alert('Error saving holes', holesErr.message);
        return
      }
      router.push({
        pathname: '/RoundDetail',
        params: { roundId: round.id },
      });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    } else {
      router.back();
    }
  };

  const summary = useMemo(() => {
      const totalScore = holes.reduce(
        (sum, h) => sum + (parseInt(h.score, 0)),
        0
      );
      const totalPutts = holes.reduce(
        (sum, h) => sum + (parseInt(h.putts, 0)),
        0
      );

      const nonPar3Count = holes.filter(
        (h) => parseInt(h.par, 0) !== 3
      ).length;

      const fairwayHits = holes.reduce(
        (sum, h) => sum + (h.fir ? 1 : 0),
        0
      );
      const girHits = holes.reduce(
        (sum, h) => sum + (h.gir ? 1 : 0),
        0
      );

      const fairwayPct =
        nonPar3Count > 0
          ? Math.round((fairwayHits / nonPar3Count) * 100)
          : 0;
      const girPct =
        holes.length > 0 ? Math.round((girHits / holes.length) * 100) : 0;

      return {
        totalScore,
        totalPutts,
        nonPar3Count,
        holeCount: holes.length,
        fairwayHits,
        fairwayPct,
        girHits,
        girPct,
      };
    }, [holes]);

  
  const renderCourseSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Golf Course</Text>
      <Text style={styles.stepDescription}>
        Enter details about the course you played
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Round Date</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: '#FFFFFF' }}>
            {roundDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={roundDate}
            mode="date"
            display="default"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setRoundDate(selected);
            }}
          />
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Pine Valley Golf Club"
          placeholderTextColor="#64748B"
          value={courseInfo.name}
          onChangeText={text => {
            setAllowSuggestions(true);
            setCourseInfo(ci => ({ ...ci, name: text }));
          }}
        />
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((c, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestionItem}
                onPress={() => onSelectSuggestion(c)}
              >
                <Text style={styles.suggestionText}>{c.name} — {c.city}, {c.state}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Pine Valley"
          placeholderTextColor="#64748B"
          value={courseInfo.city}
          onChangeText={(text) => setCourseInfo({...courseInfo, city: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>State</Text>
        <View style={styles.input}>
          <Picker
            mode="dropdown"
            style={styles.picker}
            dropdownIconColor="#FFFFFF"
            itemStyle={styles.pickerItem}
            selectedValue={courseInfo.state}
            onValueChange={(val) => setCourseInfo({ ...courseInfo, state: val })}
          >
            <Picker.Item label="Select state..." value="" />
            {US_STATES.map((st) => (
              <Picker.Item key={st} label={st} value={st} />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
  
  const renderScoreTracking = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Track Your Score</Text>
      <Text style={styles.stepDescription}>
        Enter your score for each hole
      </Text>
      
      <ScrollView style={styles.holesList}>
        {holes.map((hole, index) => (
          <View key={index} style={styles.holeRow}>
            <View style={styles.holeNumber}>
              <Text style={styles.holeNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.holeInputs}>
              <View style={styles.holeInputGroup}>
                <Text style={styles.holeInputLabel}>Par</Text>
                <TextInput
                  style={styles.holeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={holes[index].par}
                  onChangeText={text => handleHoleChange(index, 'par', text)}
                />
              </View>
              <View style={styles.holeInputGroup}>
                <Text style={styles.holeInputLabel}>Score</Text>
                <TextInput
                  style={styles.holeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={holes[index].score}
                  onChangeText={text => handleHoleChange(index, 'score', text)}
                />
              </View>
              <View style={styles.holeInputGroup}>
                <Text style={styles.holeInputLabel}>Putts</Text>
                <TextInput
                  style={styles.holeInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={holes[index].putts}
                  onChangeText={text => handleHoleChange(index, 'putts', text)}
                />
              </View>
              <View style={styles.checkboxGroup}>
                <Text style={styles.holeInputLabel}>FIR</Text>
                <Switch
                  value={hole.fir}
                  onValueChange={(val: boolean) => handleCheckboxChange(index, 'fir', val)}
                />
              </View>
              <View style={styles.checkboxGroup}>
                <Text style={styles.holeInputLabel}>GIR</Text>
                <Switch
                  value={hole.gir}
                  onValueChange={(val: boolean) => handleCheckboxChange(index, 'gir', val)}
                />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
  
  const renderReview = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Round Summary</Text>
      <Text style={styles.stepDescription}>
        Review your round details before saving
      </Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Course Information</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Course:</Text>
          <Text style={styles.summaryValue}>{courseInfo.name || 'Not specified'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location:</Text>
          <Text style={styles.summaryValue}>{courseInfo.city}, {courseInfo.state}</Text>
        </View>
      </View>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Round Statistics</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Score:</Text>
          <Text style={styles.summaryValue}>{summary.totalScore}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Putts:</Text>
          <Text style={styles.summaryValue}>{summary.totalPutts}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fairways Hit:</Text>
          <Text style={styles.summaryValue}>
            {summary.fairwayHits}/{summary.nonPar3Count} ({summary.fairwayPct}%)
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Greens in Regulation:</Text>
          <Text style={styles.summaryValue}>
            {summary.girHits}/{summary.holeCount} ({summary.girPct}%)
          </Text>
        </View>
      </View>
    </View>
  );
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderCourseSelection();
      case 2:
        return renderScoreTracking();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressBar}>
        {[1, 2, 3].map((step) => (
          <View 
            key={step} 
            style={[
              styles.progressStep, 
              currentStep >= step && styles.progressStepActive,
              { flex: step === 2 ? 1.5 : 1 }
            ]}
          />
        ))}
      </View>
      
      {renderStepContent()}
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => handleNext()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep < 3 ? 'Next' : 'Save Round'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  progressBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
  },
  progressStep: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  progressStepActive: {
    backgroundColor: '#10B981',
  },
  stepContent: {
    flex: 1,
    padding: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
  },
  holesList: {
    flex: 1,
  },
  holeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  holeNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  holeNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  holeInputs: {
    flexDirection: 'row',
    flex: 1,
  },
  holeInputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  holeInputLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  holeInput: {
    backgroundColor: '#1E293B',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  picker: {
    backgroundColor: "#1E293B",
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
    color: '#FFFFFF',
  },
  pickerItem: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    height: 48,
    fontSize: 14,
  },
    suggestionsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  suggestionText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});