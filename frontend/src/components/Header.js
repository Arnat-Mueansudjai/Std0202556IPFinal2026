import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, role, logout } = useAuth();

  const getRoleLabel = () => {
    switch (role) {
      case "admin":
        return "Admin";
      case "hr":
        return "HR Manager";
      case "staff":
        return "Staff";
      default:
        return "User";
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return colors.primary;
      case "hr":
        return "#0284C7"; // Light Blue
      case "staff":
        return colors.textSecondary;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleArea}>
        <View style={styles.iconBadge}>
          <Ionicons name="people" size={22} color={colors.primary} />
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.appName}>HR Analytics System</Text>
            <View style={[styles.roleBadge, { borderColor: getRoleColor() }]}>
              <Text style={[styles.roleText, { color: getRoleColor() }]}>
                {getRoleLabel()}
              </Text>
            </View>
          </View>
          <Text style={styles.studentId}>
            User: {user?.name || user?.username || "Admin"} • ID: 6730202556
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={logout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  titleArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "#F8FAFC"
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  studentId: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder
  },
  logoutText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger
  }
});
