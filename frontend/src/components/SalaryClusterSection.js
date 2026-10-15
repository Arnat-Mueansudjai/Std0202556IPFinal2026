import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function SalaryClusterSection({
  clusters,
  loading,
  onAnalyze,
  hasAnalyzed
}) {
  const getTierTheme = (tierName) => {
    switch (tierName) {
      case "Tier 1":
        return {
          color: colors.tier1,
          bg: colors.tier1Bg,
          label: "Entry / Base Level",
          icon: "cellular-outline"
        };
      case "Tier 2":
        return {
          color: colors.tier2,
          bg: colors.tier2Bg,
          label: "Mid-Career Level",
          icon: "trending-up-outline"
        };
      case "Tier 3":
        return {
          color: colors.tier3,
          bg: colors.tier3Bg,
          label: "Senior / Leadership",
          icon: "ribbon-outline"
        };
      default:
        return {
          color: colors.primary,
          bg: colors.primaryLight,
          label: "Salary Group",
          icon: "stats-chart-outline"
        };
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  return (
    <View style={styles.container}>
      {/* Action Button: Analyze Salary Structure */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]}
          onPress={onAnalyze}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text style={styles.analyzeButtonText}>
            {hasAnalyzed ? "Re-Analyze Salary Structure" : "Analyze Salary Structure (K-Means)"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator State (Meets Phase 2 requirement) */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Running 1D K-Means clustering algorithm on salaries...
          </Text>
        </View>
      )}

      {/* Cluster Summary Cards */}
      {!loading && hasAnalyzed && clusters && clusters.length > 0 && (
        <View style={styles.resultsContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="pie-chart" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Salary Clusters (k = 3)</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              K-Means Centroid Analytics
            </Text>
          </View>

          <View style={styles.cardsRow}>
            {clusters.map((cluster, index) => {
              const theme = getTierTheme(cluster.group);
              return (
                <View
                  key={index}
                  style={[
                    styles.clusterCard,
                    { borderTopColor: theme.color, borderTopWidth: 4 }
                  ]}
                >
                  <View style={styles.cardTop}>
                    <View
                      style={[styles.tierBadge, { backgroundColor: theme.bg }]}
                    >
                      <Ionicons
                        name={theme.icon}
                        size={14}
                        color={theme.color}
                      />
                      <Text
                        style={[styles.tierBadgeText, { color: theme.color }]}
                      >
                        {cluster.group}
                      </Text>
                    </View>

                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>
                        {cluster.count} {cluster.count === 1 ? "Employee" : "Employees"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.tierSubLabel}>{theme.label}</Text>

                  <View style={styles.centroidWrapper}>
                    <Text style={styles.centroidLabel}>Average Base Salary:</Text>
                    <Text style={[styles.centroidValue, { color: theme.color }]}>
                      {formatCurrency(cluster.centroid)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  actionRow: {
    marginBottom: 10
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  analyzeButtonDisabled: {
    opacity: 0.7
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2
  },
  loadingContainer: {
    padding: 24,
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 8
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  resultsContainer: {
    marginTop: 10,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  cardsRow: {
    gap: 10
  },
  clusterCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4
  },
  tierBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  tierBadgeText: {
    fontSize: 12,
    fontWeight: "700"
  },
  countBadge: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary
  },
  tierSubLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8
  },
  centroidWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8
  },
  centroidLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  centroidValue: {
    fontSize: 16,
    fontWeight: "800"
  }
});
