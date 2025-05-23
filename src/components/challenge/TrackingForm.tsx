
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Trophy } from 'lucide-react-native';

type TrackingFormProps = {
  onSubmit: (values: { score: string }) => Promise<void>;
  isPersisting: boolean;
  totalAttempts?: number;
};

export const TrackingForm = ({ onSubmit, isPersisting, totalAttempts }: TrackingFormProps) => {
  const [score, setScore] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const scoreNum = parseInt(score, 10);
    
    if (isNaN(scoreNum)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (totalAttempts && scoreNum > totalAttempts) {
      setError(`Score cannot be higher than ${totalAttempts}`);
      return;
    }
    
    if (scoreNum < 0) {
      setError('Score cannot be negative');
      return;
    }
    
    setError(null);
    onSubmit({ score });
  };

  const successPercentage = score && !isNaN(parseInt(score, 10)) && totalAttempts 
    ? Math.round((parseInt(score, 10) / totalAttempts) * 100) 
    : null;

  const isDisabled = isPersisting || 
    !score || 
    isNaN(parseInt(score, 10)) || 
    (totalAttempts ? parseInt(score, 10) > totalAttempts : false);

  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Your Score (out of {totalAttempts || '?'})</Text>
        <TextInput 
          style={styles.input}
          value={score}
          onChangeText={setScore}
          keyboardType="numeric"
          placeholder={`Enter score (0-${totalAttempts || '?'})`}
          placeholderTextColor="#64748B"
        />
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>Enter how many successful attempts you had</Text>
          {successPercentage !== null && (
            <Text style={styles.successRate}>
              Success rate: {successPercentage}%
            </Text>
          )}
        </View>
        {error && <Text style={styles.errorMessage}>{error}</Text>}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.submitButton,
          isDisabled ? styles.disabledButton : {}
        ]}
        onPress={handleSubmit}
        disabled={isDisabled}
      >
        {isPersisting ? (
          <Text style={styles.buttonText}>Saving...</Text>
        ) : (
          <View style={styles.buttonContent}>
            <Trophy width={16} height={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>Complete Challenge</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    gap: 24,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1A2234',
    borderWidth: 1,
    borderColor: '#2A3A50',
    borderRadius: 4,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  descriptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  description: {
    color: '#94A3B8',
    fontSize: 12,
  },
  successRate: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '500',
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#1E293B',
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default TrackingForm;
