import React, { useState, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WorkoutTrend() {
  const [weightInput, setWeightInput] = useState("");
  const [workouts, setWorkouts] = useState([]); // Start with empty array

  // 1. Load data from phone memory when app opens
  useEffect(() => {
    const loadData = async () => {
      const saved = await AsyncStorage.getItem("MY_WORKOUTS");
      if (saved) setWorkouts(JSON.parse(saved));
    };
    loadData();
  }, []);

  const addWorkout = async () => {
    if (!weightInput) return;

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: parseInt(weightInput),
    };

    const updatedWorkouts = [...workouts, newEntry];
    setWorkouts(updatedWorkouts);
    setWeightInput(""); // Clear input

    await AsyncStorage.setItem("MY_WORKOUTS", JSON.stringify(updatedWorkouts));
  };

  const clearAllData = async () => {
    try {
      // 1. Wipe the phone's storage for this specific key
      await AsyncStorage.removeItem("MY_WORKOUTS");

      // 2. Reset the UI state back to an empty array
      setWorkouts([]);

      alert("Data cleared successfully!");
    } catch (e) {
      console.error("Failed to clear data", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Progress Tracker</Text>

      {/* Only show chart if we have at least 2 data points */}
      {workouts.length > 1 ? (
        <LineChart
          data={{
            labels: workouts.slice(-5).map((w) => w.date), // Show last 5
            datasets: [{ data: workouts.slice(-5).map((w) => w.weight) }],
          }}
          width={Dimensions.get("window").width - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={{ color: "#888" }}>Add 2 entries to see trend</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Weight (lbs)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={weightInput}
          onChangeText={setWeightInput}
        />
        <TouchableOpacity style={styles.button} onPress={addWorkout}>
          <Text style={styles.buttonText}>Log Lift</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllData}>
          <Text style={styles.clearButtonText}>R</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#1f1f1f",
  backgroundGradientTo: "#1f1f1f",
  color: (opacity = 1) => `rgba(255, 167, 38, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  decimalPlaces: 0,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    paddingTop: 60,
  },
  title: { color: "white", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  chart: { marginVertical: 8, borderRadius: 16 },
  placeholder: { height: 220, justifyContent: "center" },
  inputContainer: {
    flexDirection: "row",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#ffa726",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: { fontWeight: "bold" },
  clearButton: {
    marginTop: 40,
    padding: 10,
  },
  clearButtonText: {
    color: "#ff4444", // Red for danger
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
