import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

export default function EmployeeCard({ employee, onToggleStatus, onDelete, isToggling }) {
  const { isAdmin, isHr, isStaff } = useAuth();
  const isActive = employee.status === "Active";

  // Format currency with commas
  const formattedSalary = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  }).format(employee.salary || 0);

  // Generate initials for avatar
  const initials = employee.name
    ? employee.name
        .split(" ")
        .map(n => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "EM";

  return (
    <View style={styles.card}>
      {/* Top Header: Avatar + Info + Status Badge */}
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {employee.name}
          </Text>
          <Text style={styles.position} numberOfLines={1}>
            {employee.position}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? colors.activeBg : colors.onLeaveBg }
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isActive ? colors.active : colors.onLeave }
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isActive ? colors.active : colors.onLeave }
            ]}
          >
            {employee.status}
          </Text>
        </View>
      </View>

      {/* Salary Display: Hidden for Staff, visible for HR and Admin */}
      <View style={styles.salarySection}>
        <Text style={styles.salaryLabel}>Base Salary:</Text>
        {isStaff ? (
          <View style={styles.maskedSalaryRow}>
            <Ionicons name="lock-closed" size={13} color={colors.textMuted} />
            <Text style={styles.maskedSalaryText}>Confidential (HR Only)</Text>
          </View>
        ) : (
          <Text style={styles.salaryValue}>{formattedSalary}</Text>
        )}
      </View>

      {/* Actions: Toggle Status (HR & Admin) & Delete (Admin Only) */}
      {!isStaff && (
        <View style={styles.actionsRow}>
          {/* Toggle Status (HR & Admin) */}
          <TouchableOpacity
            style={[styles.toggleBtn, isToggling && styles.disabledBtn]}
            onPress={() => onToggleStatus(employee.id)}
            disabled={isToggling}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? "pause-circle-outline" : "play-circle-outline"}
              size={16}
              color={isActive ? colors.onLeave : colors.active}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: isActive ? colors.onLeave : colors.active }
              ]}
            >
              {isActive ? "Set to On Leave" : "Set to Active"}
            </Text>
          </TouchableOpacity>

          {/* Delete Button (Admin Only) */}
          {isAdmin && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => onDelete(employee)}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={colors.danger} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary
  },
  infoCol: {
    flex: 1,
    marginRight: 8
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 2
  },
  position: {
    fontSize: 13,
    color: colors.textSecondary
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600"
  },
  salarySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 12
  },
  salaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  salaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary
  },
  maskedSalaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  maskedSalaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#F1F5F9"
  },
  disabledBtn: {
    opacity: 0.5
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: "600"
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger
  }
});
