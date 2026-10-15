import React, { useState } from "react";
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
  const [viewMode, setViewMode] = useState("chart"); // 'cards' | 'chart'

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

  const maxCentroid = clusters && clusters.length > 0
    ? Math.max(...clusters.map((c) => c.centroid), 1)
    : 100000;

  const totalEmployees = clusters && clusters.length > 0
    ? clusters.reduce((sum, c) => sum + c.count, 0)
    : 0;

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

      {/* Loading Indicator State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Running 1D K-Means clustering algorithm on salaries...
          </Text>
        </View>
      )}

      {/* Cluster Analytics & Visual Graph */}
      {!loading && hasAnalyzed && clusters && clusters.length > 0 && (
        <View style={styles.resultsContainer}>
          {/* Header with View Toggle (Cards vs Chart) */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="analytics-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Salary Clusters (k = 3)</Text>
            </View>

            <View style={styles.viewToggleGroup}>
              <TouchableOpacity
                style={[styles.toggleTab, viewMode === "chart" && styles.toggleTabActive]}
                onPress={() => setViewMode("chart")}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={14}
                  color={viewMode === "chart" ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.toggleTabText, viewMode === "chart" && styles.toggleTabTextActive]}>
                  Graph
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleTab, viewMode === "cards" && styles.toggleTabActive]}
                onPress={() => setViewMode("cards")}
              >
                <Ionicons
                  name="grid-outline"
                  size={14}
                  color={viewMode === "cards" ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.toggleTabText, viewMode === "cards" && styles.toggleTabTextActive]}>
                  Cards
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* VIEW 1: VISUAL BAR CHART */}
          {viewMode === "chart" && (
            <View style={styles.chartContainer}>
              {/* Overall Proportion Segment Bar */}
              <Text style={styles.chartSubtitle}>Staff Proportion by Tier</Text>
              <View style={styles.proportionBar}>
                {clusters.map((cluster, idx) => {
                  const theme = getTierTheme(cluster.group);
                  const pct = totalEmployees > 0 ? (cluster.count / totalEmployees) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.proportionSegment,
                        {
                          width: `${pct}%`,
                          backgroundColor: theme.color
                        }
                      ]}
                    />
                  );
                })}
              </View>

              {/* Legend Row */}
              <View style={styles.legendRow}>
                {clusters.map((cluster, idx) => {
                  const theme = getTierTheme(cluster.group);
                  const pct = totalEmployees > 0 ? Math.round((cluster.count / totalEmployees) * 100) : 0;
                  return (
                    <View key={idx} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: theme.color }]} />
                      <Text style={styles.legendText}>
                        {cluster.group}: {cluster.count} staff ({pct}%)
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.chartDivider} />

              {/* Centroid Salary Bar Chart */}
              <Text style={styles.chartSubtitle}>Average Centroid Salary Comparison</Text>
              <View style={styles.barsList}>
                {clusters.map((cluster, idx) => {
                  const theme = getTierTheme(cluster.group);
                  const barWidthPercent = Math.min(
                    Math.max(Math.round((cluster.centroid / maxCentroid) * 100), 12),
                    100
                  );

                  return (
                    <View key={idx} style={styles.barItemRow}>
                      <View style={styles.barLabelCol}>
                        <Text style={styles.barTierTitle}>{cluster.group}</Text>
                        <Text style={styles.barTierSub}>{theme.label}</Text>
                      </View>

                      <View style={styles.barTrackCol}>
                        <View style={styles.barTrack}>
                          <View
                            style={[
                              styles.barFill,
                              {
                                width: `${barWidthPercent}%`,
                                backgroundColor: theme.color
                              }
                            ]}
                          >
                            <Text style={styles.barInsideText}>
                              {formatCurrency(cluster.centroid)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.barStaffCount}>
                          {cluster.count} staff
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* VIEW 2: SUMMARY CARDS */}
          {viewMode === "cards" && (
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
                      <View style={[styles.tierBadge, { backgroundColor: theme.bg }]}>
                        <Ionicons name={theme.icon} size={14} color={theme.color} />
                        <Text style={[styles.tierBadgeText, { color: theme.color }]}>
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
          )}
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
  viewToggleGroup: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 2
  },
  toggleTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  toggleTabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  toggleTabText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600"
  },
  toggleTabTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },

  // Chart Styles
  chartContainer: {
    paddingVertical: 4
  },
  chartSubtitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  proportionBar: {
    height: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 7,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10
  },
  proportionSegment: {
    height: "100%"
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500"
  },
  chartDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 12
  },
  barsList: {
    gap: 12
  },
  barItemRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  barLabelCol: {
    width: 90
  },
  barTierTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary
  },
  barTierSub: {
    fontSize: 10,
    color: colors.textMuted
  },
  barTrackCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  barTrack: {
    flex: 1,
    height: 28,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    overflow: "hidden",
    justifyContent: "center"
  },
  barFill: {
    height: "100%",
    borderRadius: 8,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  barInsideText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    whiteSpace: "nowrap"
  },
  barStaffCount: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    width: 48,
    textAlign: "right"
  },

  // Cards View Styles
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
