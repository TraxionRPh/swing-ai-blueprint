
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react-native';
import { TextInput } from 'react-native';

// Mock drill data
const mockDrills = [
  {
    id: '1',
    title: 'Putting Path Control',
    difficulty: 'Beginner',
    duration: '15 minutes',
    overview: 'This drill helps you develop a consistent putting stroke by focusing on path control.',
    category: 'Putting'
  },
  {
    id: '2',
    title: 'Driver Tempo',
    difficulty: 'Intermediate',
    duration: '20 minutes',
    overview: 'Work on your driver swing tempo to increase consistency off the tee.',
    category: 'Driving'
  },
  {
    id: '3',
    title: 'Bunker Splash Shot',
    difficulty: 'Advanced',
    duration: '30 minutes',
    overview: 'Master the splash shot technique to get out of bunkers consistently.',
    category: 'Short Game'
  },
  {
    id: '4',
    title: 'Draw vs Fade',
    difficulty: 'Advanced',
    duration: '45 minutes',
    overview: 'Learn how to control ball flight by intentionally hitting draws and fades.',
    category: 'Iron Play'
  },
  {
    id: '5',
    title: 'Pitch Shot Distance Control',
    difficulty: 'Intermediate',
    duration: '25 minutes',
    overview: 'Improve your pitch shot distance control for better scoring opportunities.',
    category: 'Short Game'
  }
];

const DrillLibrary = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [drills, setDrills] = useState(mockDrills);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Putting', 'Driving', 'Iron Play', 'Short Game'];
  
  const filteredDrills = drills.filter(drill => {
    const matchesSearch = drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          drill.overview.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || drill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return '#10B981'; // emerald-500
      case 'Intermediate':
        return '#F59E0B'; // amber-500
      case 'Advanced':
        return '#EF4444'; // rose-500
      default:
        return '#6B7280'; // slate-500
    }
  };

  const renderDrillCard = ({ item }: { item: typeof mockDrills[0] }) => (
    <Card style={styles.drillCard}>
      <CardHeader>
        <View style={styles.cardHeaderContent}>
          <CardTitle>{item.title}</CardTitle>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(item.difficulty) }
          ]}>
            <Text style={styles.difficultyText}>{item.difficulty}</Text>
          </View>
        </View>
        <Text style={styles.durationText}>{item.duration}</Text>
      </CardHeader>
      <CardContent>
        <Text style={styles.overviewText} numberOfLines={3}>
          {item.overview}
        </Text>
        <View style={styles.cardFooter}>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => {
              // Show drill details
              console.log('View drill details:', item);
            }}
          >
            View Details
          </Button>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Drill Library</Text>
          <Text style={styles.subtitle}>
            Browse and filter golf drills by category
          </Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search width={20} height={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drills..."
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Category Filter */}
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextActive
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
        
        {/* Drills List */}
        <FlatList
          data={filteredDrills}
          keyExtractor={(item) => item.id}
          renderItem={renderDrillCard}
          contentContainerStyle={styles.drillsList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No drills match your search.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F2C',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2F3C',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0, // Remove padding in TextInput
  },
  categoryList: {
    marginBottom: 16,
    maxHeight: 40,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#1A1F2C',
    borderWidth: 1,
    borderColor: '#2A2F3C',
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  drillsList: {
    paddingBottom: 16,
  },
  drillCard: {
    marginBottom: 16,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  difficultyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  durationText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  overviewText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
});

export default DrillLibrary;
