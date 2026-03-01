import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Alert, View } from 'react-native';
import { useState, useEffect } from 'react';
import { TouchableOpacity, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';



type Entry = {
  date: string;
  weight: number;
  reps: number;
  sets: number;
};

type Lift = {
  id: number;
  name: string;
  entries: Entry[];
};

export default function TabTwoScreen() {
  const [loaded, setLoaded] = useState(false);
  const [lifts, setLifts] = useState<Lift[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [liftName, setLiftName] = useState('');
  const [liftDate, setLiftDate] = useState('');
  const [liftWeight, setLiftWeight] = useState('');
  const [liftReps, setLiftReps] = useState('');
  const [liftSets, setLiftSets] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const loadLifts = async () => {
      const stored = await AsyncStorage.getItem('lifts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // ensure every lift has an entries array
        const fixed = parsed.map((lift: Lift) => ({
          ...lift,
          entries: lift.entries ?? [],
        }));
        setLifts(fixed);
      }
      setLoaded(true);
    };
    loadLifts();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem('lifts', JSON.stringify(lifts));
  }, [lifts, loaded]);

  const handleAddLift = () => {
    if (!liftName.trim()) return;
    const newLift: Lift = {
      id: Date.now(),
      name: liftName,
      entries: [],
    };
    setLifts(prev => [...prev, newLift]);
    setLiftName('');
  };

  const handleAddEntry = (liftId: number) => {
    if(liftDate && liftWeight && liftReps && liftSets){
    const newEntry: Entry = {
      date: liftDate,
      weight: Number(liftWeight),
      reps: Number(liftReps),
      sets: Number(liftSets),
    };
    setLifts(prev => prev.map(lift =>
      lift.id === liftId
        ? { ...lift, entries: [...lift.entries, newEntry] }
        : lift
    ));
    setLiftDate('');
    setLiftWeight('');
    setLiftReps('');
    setLiftSets('');}
  };

  const handleDeleteLift = (liftId: number) => {
    Alert.alert(
      'Delete',
      'What would you like to delete?',
      [
        {
          text: 'Last Entry',
          onPress: () => {
            setLifts(prev => prev.map(lift =>
              lift.id === liftId
                ? { ...lift, entries: lift.entries.slice(0, -1) }
                : lift
            ));
          },
        },
        {
          text: 'Entire Exercise',
          style: 'destructive',
          onPress: () => {
            setLifts(prev => prev.filter(lift => lift.id !== liftId));
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="square.and.pencil"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Tracking
        </ThemedText>
      </ThemedView>

      <ThemedText>Create and track progress of your lifts!</ThemedText>

      <TextInput
        style={styles.input}
        placeholder="Enter exercise name..."
        placeholderTextColor="grey"
        value={liftName}
        onChangeText={setLiftName}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddLift}>
        <Text style={styles.buttonText}>+ Add Exercise</Text>
      </TouchableOpacity>

      {lifts.map(lift => (
        <ThemedView key={lift.id} style={styles.liftCard}>
          <TouchableOpacity
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            onPress={() => setExpanded(expanded === lift.id ? null : lift.id)}
          >
            <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{lift.name}</ThemedText>
            <TouchableOpacity onPress={() => handleDeleteLift(lift.id)}>
              <Ionicons name="trash-outline" size={20} color="red" />
            </TouchableOpacity>
          </TouchableOpacity>

          {expanded === lift.id && (
            <View style={{ marginTop: 10 }}>
              {lift.entries.map((entry, index) => (
                <View key={index} style={styles.entryRow}>
                  <ThemedText>{entry.date} — {entry.weight}kg x {entry.reps} reps x {entry.sets} sets</ThemedText>
                </View>
              ))}

              <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                <Text style={{ color: 'white' }}>{liftDate || 'Select Date'}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                      setLiftDate(selectedDate.toLocaleDateString()); // e.g. "2/28/2026"
                    }
                  }}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder="Weight"
                placeholderTextColor="grey"
                value={liftWeight}
                onChangeText={setLiftWeight}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Reps"
                placeholderTextColor="grey"
                value={liftReps}
                onChangeText={setLiftReps}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Sets"
                placeholderTextColor="grey"
                value={liftSets}
                onChangeText={setLiftSets}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={() => handleAddEntry(lift.id)}>
                <Text style={styles.buttonText}>+ Add Entry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      ))}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  liftCard: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  entryRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    fontSize: 16,
    color: 'white',
  },
});