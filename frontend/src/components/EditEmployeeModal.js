import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function EditEmployeeModal({ visible, employee, onClose, onUpdateEmployee }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState("Active");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setName(employee.name || "");
      setPosition(employee.position || "");
      setSalary(String(employee.salary || ""));
      setStatus(employee.status || "Active");
      setErrorMessage("");
    }
  }, [employee]);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedPosition = position.trim();
    const parsedSalary = Number(salary);

    if (!trimmedName) {
      setErrorMessage("Please enter employee name.");
      return;
    }

    if (!trimmedPosition) {
      setErrorMessage("Please enter employee position.");
      return;
    }

    if (!salary.trim() || isNaN(parsedSalary) || parsedSalary <= 0) {
      setErrorMessage("Please enter a valid positive salary amount.");
      return;
    }

    setErrorMessage("");
    setSubmitting(true);

    try {
      await onUpdateEmployee(employee.id, {
        name: trimmedName,
        position: trimmedPosition,
        salary: parsedSalary,
        status
      });
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update employee.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.headerIconBadge}>
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.modalTitle}>Edit Employee Details</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Error Alert Banner */}
              {errorMessage ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* Input Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errorMessage) setErrorMessage("");
                    }}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Position / Role *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Position"
                    placeholderTextColor={colors.textMuted}
                    value={position}
                    onChangeText={(val) => {
                      setPosition(val);
                      if (errorMessage) setErrorMessage("");
                    }}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Monthly Salary (THB) *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="cash-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Salary"
                    placeholderTextColor={colors.textMuted}
                    value={salary}
                    onChangeText={(val) => {
                      setSalary(val);
                      if (errorMessage) setErrorMessage("");
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Status Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Employment Status</Text>
                <View style={styles.statusButtonsRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusSelectBtn,
                      status === "Active" && styles.statusSelectBtnActive
                    ]}
                    onPress={() => setStatus("Active")}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: status === "Active" ? colors.active : colors.textMuted }
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusSelectText,
                        status === "Active" && styles.statusSelectTextActive
                      ]}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusSelectBtn,
                      status === "On Leave" && styles.statusSelectBtnOnLeave
                    ]}
                    onPress={() => setStatus("On Leave")}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: status === "On Leave" ? colors.onLeave : colors.textMuted }
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusSelectText,
                        status === "On Leave" && styles.statusSelectTextOnLeave
                      ]}
                    >
                      On Leave
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={submitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Update Employee</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  keyboardView: {
    width: "100%",
    maxWidth: 480
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  headerIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary
  },
  closeBtn: {
    padding: 6
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: "500",
    flex: 1
  },
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.textPrimary
  },
  statusButtonsRow: {
    flexDirection: "row",
    gap: 10
  },
  statusSelectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  statusSelectBtnActive: {
    backgroundColor: colors.activeBg,
    borderColor: colors.active
  },
  statusSelectBtnOnLeave: {
    backgroundColor: colors.onLeaveBg,
    borderColor: colors.onLeave
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusSelectText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary
  },
  statusSelectTextActive: {
    color: colors.active,
    fontWeight: "700"
  },
  statusSelectTextOnLeave: {
    color: colors.onLeave,
    fontWeight: "700"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF"
  }
});
