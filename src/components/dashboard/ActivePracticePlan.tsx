
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ListTodo } from 'lucide-react-native';

export const ActivePracticePlan = ({ navigation }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Practice Plan</Text>
        <Text style={styles.description}>
          Continue with your personalized practice plan
        </Text>
      </View>
      <View style={styles.content}>
        <View style={styles.infoContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.planTitle}>Improving Your Golf Game</Text>
            <Text style={styles.planDescription}>
              Follow your custom practice plan to enhance your skills
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.navigate('MyPracticePlans')}
          >
            <ListTodo width={20} height={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>View Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1F2C',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3A50',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 14,
    color: '#94A3B8',
  },
  content: {
    padding: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  button: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ActivePracticePlan;
