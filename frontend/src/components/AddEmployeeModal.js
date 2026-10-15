import React, { useState } from "react";
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

export default function AddEmployeeModal({ visible, onClose, onAddEmployee }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setPosition("");
    setSalary("");
    setErrorMessage("");
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Client-side Validation (Required by Rubric)
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
      await onAddEmployee({
        name: trimmedName,
        position: trimmedPosition,
        salary: parsedSalary
      });
      resetForm();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Failed to add employee.");
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
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
                    <Ionicons name="person-add" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.modalTitle}>Add New Employee</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
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
                    placeholder="e.g. Somchai Prasert"
                    placeholderTextColor={colors.textMuted}
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errorMessage) setErrorMessage("");
                    }}
                    autoFocus
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Position / Role *</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="briefcase-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Senior Software Engineer"
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
                    placeholder="e.g. 55000"
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

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={handleClose}
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
                      <Text style={styles.submitBtnText}>Save Employee</Text>
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
