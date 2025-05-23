
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Subscription = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Subscription Plans</Text>
          <Text style={styles.subtitle}>
            Unlock premium features to improve your golf game
          </Text>
        </View>

        <View style={styles.planCardWrapper}>
          <Card style={styles.planCard}>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <Text style={styles.planPrice}>$0/month</Text>
            </CardHeader>
            <CardContent style={styles.planContent}>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureText}>Basic round tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureText}>Limited practice drills</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureText}>Basic stats</Text>
                </View>
              </View>
              <Text style={styles.currentPlan}>Your Current Plan</Text>
            </CardContent>
          </Card>
          
          <Card style={[styles.planCard, styles.premiumCard]}>
            <CardHeader>
              <CardTitle style={styles.premiumTitle}>Premium Plan</CardTitle>
              <Text style={styles.premiumPrice}>$9.99/month</Text>
            </CardHeader>
            <CardContent style={styles.planContent}>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.premiumFeatureText}>Unlimited round tracking</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.premiumFeatureText}>Full access to all drills</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.premiumFeatureText}>AI analysis of your performance</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.premiumFeatureText}>Custom practice plans</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.premiumFeatureText}>Advanced statistics</Text>
                </View>
              </View>
              <Button style={styles.upgradeButton}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  planCardWrapper: {
    marginBottom: 24,
  },
  planCard: {
    marginBottom: 16,
    backgroundColor: '#1A1F2C',
    borderColor: '#2A2F3C',
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: '#10B981',
  },
  planPrice: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  premiumTitle: {
    color: '#10B981',
  },
  premiumPrice: {
    fontSize: 24,
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 8,
  },
  planContent: {
    paddingTop: 0,
  },
  featureList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    color: '#E5E7EB',
    fontSize: 16,
  },
  premiumFeatureText: {
    color: '#E5E7EB',
    fontSize: 16,
  },
  currentPlan: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: '#10B981',
  },
});

export default Subscription;
