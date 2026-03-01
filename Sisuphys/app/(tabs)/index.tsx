import React from "react";
import { StyleSheet, Text, View, StatusBar } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      {/* This makes the phone's clock/battery icons white */}
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>SISUPHYS</Text>
      <Text style={styles.subtitle}>The struggle is the reward.</Text>

      <View style={styles.boulder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark "stone" background
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 5,
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 10,
  },
  boulder: {
    width: 60,
    height: 60,
    backgroundColor: "#444",
    borderRadius: 30, // Makes it a circle
    marginTop: 50,
  },
});
