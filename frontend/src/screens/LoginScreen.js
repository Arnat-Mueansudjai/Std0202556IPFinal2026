import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { getBaseUrl, setCustomBaseUrl } from "../services/api";

export default function LoginScreen() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [apiUrl, setApiUrl] = useState(getBaseUrl());
  const [showApiSettings, setShowApiSettings] = useState(false);

  const { login, loading } = useAuth();

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === "admin") {
      setUsername("admin");
      setPassword("password123");
    } else if (roleKey === "hr") {
      setUsername("hr_user");
      setPassword("hr123");
    } else if (roleKey === "staff") {
      setUsername("staff");
      setPassword("staff123");
    }
  };

  const handleLogin = async () => {
    Keyboard.dismiss();

    if (!username.trim() || !password.trim()) {
      Alert.alert("Validation Error", "Please enter both username and password.");
      return;
    }

    const result = await login(username.trim(), password.trim());
    if (!result.success) {
      Alert.alert(
        "Login Failed",
        result.message || "Invalid credentials."
      );
    }
  };

  const handleSaveApiUrl = () => {
    setCustomBaseUrl(apiUrl);
    setShowApiSettings(false);
    Alert.alert("Config Updated", `API Base URL set to: ${apiUrl}`);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Branding Area (No emojis) */}
          <View style={styles.brandArea}>
            <View style={styles.logoBadge}>
              <Ionicons name="analytics" size={42} color={colors.primary} />
            </View>
            <Text style={styles.appTitle}>HR Manager and Salary Analytics</Text>
            <Text style={styles.appSubtitle}>
              Final Exam 2026 • Internet Programming
            </Text>
            <View style={styles.authorBadge}>
              <Text style={styles.authorText}>Student ID: 6730202556</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Sign In to Dashboard</Text>
            <Text style={styles.cardSub}>
              Select role or enter credentials to continue
            </Text>

            {/* Role Preset Selector Chips */}
            <View style={styles.roleChipsContainer}>
              <TouchableOpacity
                style={[
                  styles.roleChip,
                  selectedRole === "admin" && styles.roleChipActive
                ]}
                onPress={() => handleRoleSelect("admin")}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    selectedRole === "admin" && styles.roleChipTextActive
                  ]}
                >
                  Admin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleChip,
                  selectedRole === "hr" && styles.roleChipActive
                ]}
                onPress={() => handleRoleSelect("hr")}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    selectedRole === "hr" && styles.roleChipTextActive
                  ]}
                >
                  HR Manager
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleChip,
                  selectedRole === "staff" && styles.roleChipActive
                ]}
                onPress={() => handleRoleSelect("staff")}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    selectedRole === "staff" && styles.roleChipTextActive
                  ]}
                >
                  Staff
                </Text>
              </TouchableOpacity>
            </View>

            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Username"
                  placeholderTextColor={colors.textMuted}
                  value={username}
                  onChangeText={(val) => {
                    setUsername(val);
                    setSelectedRole("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    setSelectedRole("");
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Role Permissions Hint */}
            <View style={styles.hintBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.hintText}>
                {selectedRole === "admin" && "Admin: Full access (CRUD, Analytics, Status Toggle)"}
                {selectedRole === "hr" && "HR: View Salaries, Status Toggle, K-Means Analytics"}
                {selectedRole === "staff" && "Staff: View attendance status only (Salaries hidden)"}
                {!selectedRole && "Enter administrative or staff credentials"}
              </Text>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* API Endpoint Config Toggle */}
            <TouchableOpacity
              style={styles.configToggle}
              onPress={() => setShowApiSettings(!showApiSettings)}
            >
              <Ionicons name="settings-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.configToggleText}>
                {showApiSettings ? "Hide Server Settings" : "Configure Backend URL"}
              </Text>
            </TouchableOpacity>

            {showApiSettings && (
              <View style={styles.apiSettingsBox}>
                <Text style={styles.apiSettingsLabel}>Backend API URL:</Text>
                <TextInput
                  style={styles.apiInput}
                  value={apiUrl}
                  onChangeText={setApiUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.saveApiBtn}
                  onPress={handleSaveApiUrl}
                >
                  <Text style={styles.saveApiBtnText}>Save URL</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 36
  },
  brandArea: {
    alignItems: "center",
    marginBottom: 24
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4
  },
  appTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: -0.5
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  authorBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  authorText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 16
  },
  roleChipsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18
  },
  roleChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent"
  },
  roleChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14
  },
  inputIcon: {
    marginRight: 10
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary
  },
  eyeIcon: {
    padding: 6
  },
  hintBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 18
  },
  hintText: {
    fontSize: 12,
    color: colors.primaryDark,
    flex: 1,
    fontWeight: "500"
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  loginBtnDisabled: {
    opacity: 0.7
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF"
  },
  configToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 18,
    paddingVertical: 4
  },
  configToggleText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  apiSettingsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  apiSettingsLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 4
  },
  apiInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 8
  },
  saveApiBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center"
  },
  saveApiBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600"
  }
});
