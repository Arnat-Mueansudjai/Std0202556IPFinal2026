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
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function AddEmployeeModal({ visible, onClose, onAddEmployee }) {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setPosition("");
    setSalary("");
    setError("");
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !position.trim() || !salary.trim() || isNaN(Number(salary)) || Number(salary) <= 0) {
      setError("Please fill all fields with valid data.");
      return;
    }

    setSubmitting(true);
    try {
      await onAddEmployee({
        name: name.trim(),
        position: position.trim(),
        salary: Number(salary)
      });
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to add employee.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.box}>
          <View style={styles.header}>
            <Text style={styles.title}>Add New Employee</Text>
            <TouchableOpacity onPress={handleClose}><Ionicons name="close" size={22} color="#64748B" /></TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Somchai Prasert" />

          <Text style={styles.label}>Position / Role</Text>
          <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="e.g. Senior Software Engineer" />

          <Text style={styles.label}>Monthly Salary (THB)</Text>
          <TextInput style={styles.input} value={salary} onChangeText={setSalary} keyboardType="numeric" placeholder="e.g. 50000" />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={submitting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveText}>Save Employee</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "center", alignItems: "center", padding: 20 },
  box: { width: "100%", maxWidth: 440, backgroundColor: "#FFF", borderRadius: 16, padding: 20, shadowOpacity: 0.15, elevation: 5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 17, fontWeight: "700", color: "#0F172A" },
  errorText: { color: colors.danger, fontSize: 12, marginBottom: 10, fontWeight: "500" },
  label: { fontSize: 12, fontWeight: "600", color: "#475569", marginBottom: 4, marginTop: 8 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, color: "#0F172A" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, paddingVertical: 11, alignItems: "center", borderRadius: 8, backgroundColor: "#F1F5F9" },
  cancelText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  saveBtn: { flex: 1.5, paddingVertical: 11, alignItems: "center", borderRadius: 8, backgroundColor: colors.primary },
  saveText: { fontSize: 13, fontWeight: "700", color: "#FFF" }
});
