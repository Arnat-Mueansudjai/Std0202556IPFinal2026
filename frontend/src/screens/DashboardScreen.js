import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import Header from "../components/Header";
import EmployeeCard from "../components/EmployeeCard";
import AddEmployeeModal from "../components/AddEmployeeModal";
import EditEmployeeModal from "../components/EditEmployeeModal";
import SalaryClusterSection from "../components/SalaryClusterSection";
import { useAuth } from "../context/AuthContext";
import {
  getEmployeesApi,
  addEmployeeApi,
  updateEmployeeApi,
  toggleEmployeeStatusApi,
  deleteEmployeeApi,
  getSalaryClustersApi
} from "../services/api";

export default function DashboardScreen() {
  const { isAdmin, isStaff } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Phase 2: Salary Clusters State
  const [clusters, setClusters] = useState([]);
  const [clustersLoading, setClustersLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Fetch all employees from API
  const fetchEmployees = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getEmployeesApi();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (error) {
      console.error("Fetch employees error:", error);
      Alert.alert("Error", error.message || "Failed to load employees list.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Live filter employees based on search query (Name or Position)
  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter(
      (emp) =>
        (emp.name && emp.name.toLowerCase().includes(query)) ||
        (emp.position && emp.position.toLowerCase().includes(query))
    );
  }, [employees, searchQuery]);

  // Phase 1: Toggle Employee Status (Active <-> On Leave)
  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      const updated = await toggleEmployeeStatusApi(id);
      setEmployees((prev) =>
        prev.map((emp) => (String(emp.id) === String(id) ? updated : emp))
      );
    } catch (error) {
      Alert.alert("Update Failed", error.message || "Could not toggle employee status.");
    } finally {
      setTogglingId(null);
    }
  };

  // Phase 1: Edit Employee
  const handleOpenEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditModalVisible(true);
  };

  const handleUpdateEmployee = async (id, updatedData) => {
    const updated = await updateEmployeeApi(id, updatedData);
    setEmployees((prev) =>
      prev.map((emp) => (String(emp.id) === String(id) ? updated : emp))
    );
    Alert.alert("Success", `${updated.name} has been updated successfully.`);
  };

  // Phase 1: Delete Confirmation Alert & Deletion
  const handleDeleteEmployee = (employee) => {
    if (!isAdmin) {
      Alert.alert("Permission Denied", "Only administrators can delete employee records.");
      return;
    }

    const confirmationMessage = `Are you sure you want to remove ${employee.name}?`;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(confirmationMessage);
      if (confirmed) {
        executeDelete(employee.id);
      }
    } else {
      Alert.alert(
        "Confirm Deletion",
        confirmationMessage,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => executeDelete(employee.id)
          }
        ],
        { cancelable: true }
      );
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteEmployeeApi(id);
      setEmployees((prev) => prev.filter((emp) => String(emp.id) !== String(id)));
      Alert.alert("Success", "Employee removed successfully.");
    } catch (error) {
      Alert.alert("Delete Failed", error.message || "Could not delete employee.");
    }
  };

  // Phase 1: Add New Employee
  const handleAddEmployee = async (newEmployeeData) => {
    const created = await addEmployeeApi(newEmployeeData);
    setEmployees((prev) => [...prev, created]);
    Alert.alert("Success", `${created.name} has been added successfully.`);
  };

  // Phase 2: K-Means Salary Analytics
  const handleAnalyzeSalary = async () => {
    setClustersLoading(true);
    setHasAnalyzed(true);

    try {
      const response = await getSalaryClustersApi();
      if (response && response.success && Array.isArray(response.clusters)) {
        setClusters(response.clusters);
      } else {
        throw new Error("Invalid cluster response from server.");
      }
    } catch (error) {
      console.error("Cluster analysis error:", error);
      Alert.alert("Analytics Error", error.message || "Failed to calculate salary clusters.");
    } finally {
      setClustersLoading(false);
    }
  };

  // Header Component for FlatList
  const renderListHeader = () => {
    const activeCount = employees.filter((e) => e.status === "Active").length;
    const onLeaveCount = employees.filter((e) => e.status === "On Leave").length;

    return (
      <View style={styles.listHeaderContainer}>
        {/* Top Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{employees.length}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: colors.active, borderLeftWidth: 3 }]}>
            <Text style={[styles.statValue, { color: colors.active }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: colors.onLeave, borderLeftWidth: 3 }]}>
            <Text style={[styles.statValue, { color: colors.onLeave }]}>{onLeaveCount}</Text>
            <Text style={styles.statLabel}>On Leave</Text>
          </View>
        </View>

        {/* Phase 2: K-Means Salary Analytics Section (Visible for HR & Admin) */}
        {!isStaff && (
          <SalaryClusterSection
            clusters={clusters}
            loading={clustersLoading}
            onAnalyze={handleAnalyzeSalary}
            hasAnalyzed={hasAnalyzed}
            employees={employees}
          />
        )}

        {/* Employees Section Title + Add Button */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionHeading}>Employee Directory</Text>
            <Text style={styles.sectionSubheading}>
              {isStaff ? "Attendance status overview" : "Manage active and on-leave records"}
            </Text>
          </View>

          {!isStaff && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add Employee</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Bar with Live Filter */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee by name or position..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearchBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.trim().length > 0 && (
          <View style={styles.searchResultBadge}>
            <Text style={styles.searchResultText}>
              Found {filteredEmployees.length} of {employees.length} employees matching "{searchQuery}"
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.cardBg} />
      <Header />

      <View style={styles.body}>
        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Fetching employee records...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredEmployees}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <EmployeeCard
                employee={item}
                onToggleStatus={handleToggleStatus}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteEmployee}
                isToggling={togglingId === item.id}
              />
            )}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>
                  {searchQuery ? "No Matching Employees" : "No Employees Found"}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? `No employee found matching "${searchQuery}". Try a different name or position.`
                    : isStaff
                    ? "No employee records currently available."
                    : "Click the + Add Employee button above to add the first record."}
                </Text>
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.resetSearchBtn}
                    onPress={() => setSearchQuery("")}
                  >
                    <Text style={styles.resetSearchBtnText}>Clear Search</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchEmployees(true)}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>

      {/* Add Employee Form Modal */}
      {!isStaff && (
        <AddEmployeeModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onAddEmployee={handleAddEmployee}
        />
      )}

      {/* Edit Employee Form Modal */}
      {!isStaff && (
        <EditEmployeeModal
          visible={editModalVisible}
          employee={selectedEmployee}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedEmployee(null);
          }}
          onUpdateEmployee={handleUpdateEmployee}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  body: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40
  },
  listHeaderContainer: {
    paddingVertical: 14
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 2
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionSubheading: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700"
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.textPrimary
  },
  clearSearchBtn: {
    padding: 6
  },
  searchResultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 10
  },
  searchResultText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600"
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
    maxWidth: 280
  },
  resetSearchBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  resetSearchBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary
  }
});
