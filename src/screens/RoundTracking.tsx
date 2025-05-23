
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RoundTracking = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [courseInfo, setCourseInfo] = useState({
    name: '',
    city: '',
    state: '',
  });
  
  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // In a real app, we would save the round data here
      navigation.navigate('RoundDetail', { isNewRound: true });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };
  
  const renderCourseSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Golf Course</Text>
      <Text style={styles.stepDescription}>
        Enter details about the course you played
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Pine Valley Golf Club"
          placeholderTextColor="#64748B"
          value={courseInfo.name}
          onChangeText={(text) => setCourseInfo({...courseInfo, name: text})}
        />
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
        <TextInput
          style={styles.input}
          placeholder="e.g., NJ"
          placeholderTextColor="#64748B"
          value={courseInfo.state}
          onChangeText={(text) => setCourseInfo({...courseInfo, state: text})}
        />
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
        {Array.from({length: 18}).map((_, index) => (
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
                  defaultValue="4"
                />
              </View>
              <View style={styles.holeInputGroup}>
                <Text style={styles.holeInputLabel}>Score</Text>
                <TextInput
                  style={styles.holeInput}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.holeInputGroup}>
                <Text style={styles.holeInputLabel}>Putts</Text>
                <TextInput
                  style={styles.holeInput}
                  keyboardType="number-pad"
                  maxLength={1}
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
          <Text style={styles.summaryValue}>82</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Putts:</Text>
          <Text style={styles.summaryValue}>34</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fairways Hit:</Text>
          <Text style={styles.summaryValue}>9/14 (64%)</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Greens in Regulation:</Text>
          <Text style={styles.summaryValue}>10/18 (56%)</Text>
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
          onPress={handleNext}
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
});

export default RoundTracking;
