import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";

function MainNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {isAuthenticated ? <DashboardScreen /> : <LoginScreen />}
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC"
  }
});
