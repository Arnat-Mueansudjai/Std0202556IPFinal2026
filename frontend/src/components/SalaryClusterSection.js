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
  hasAnalyzed,
  employees = []
}) {
  // 'scatter' (default matching reference) | 'chart' (bar) | 'cards' (summary cards)
  const [viewMode, setViewMode] = useState("scatter");
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Cluster Theme Configuration
  const clusterColors = {
    0: {
      color: "#10B981", // Emerald green (Cluster 0 / Budget / Tier 1)
      bg: "#ECFDF5",
      border: "#A7F3D0",
      name: "Cluster 0 (Budget / Tier 1)"
    },
    1: {
      color: "#F59E0B", // Amber orange (Cluster 1 / Mid-Range / Tier 2)
      bg: "#FFFBEB",
      border: "#FDE68A",
      name: "Cluster 1 (Mid-Range / Tier 2)"
    },
    2: {
      color: "#8B5CF6", // Purple violet (Cluster 2 / High-End / Tier 3)
      bg: "#F5F3FF",
      border: "#DDD6FE",
      name: "Cluster 2 (High-End / Tier 3)"
    }
  };

  const getTierTheme = (tierName) => {
    switch (tierName) {
      case "Tier 1":
        return {
          color: clusterColors[0].color,
          bg: clusterColors[0].bg,
          label: "Entry / Base Level",
          icon: "cellular-outline"
        };
      case "Tier 2":
        return {
          color: clusterColors[1].color,
          bg: clusterColors[1].bg,
          label: "Mid-Career Level",
          icon: "trending-up-outline"
        };
      case "Tier 3":
        return {
          color: clusterColors[2].color,
          bg: clusterColors[2].bg,
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

  const formatCompact = (val) => {
    return `${Number(val).toLocaleString()} ฿`;
  };

  const maxCentroid = clusters && clusters.length > 0
    ? Math.max(...clusters.map((c) => c.centroid), 1)
    : 100000;

  const totalEmployees = clusters && clusters.length > 0
    ? clusters.reduce((sum, c) => sum + c.count, 0)
    : employees.length;

  // Sorted Centroids for boundaries and assignment
  const sortedCentroids = clusters && clusters.length > 0
    ? [...clusters].sort((a, b) => a.centroid - b.centroid).map(c => c.centroid)
    : [25000, 55000, 85000];

  const c0 = sortedCentroids[0] || 25000;
  const c1 = sortedCentroids[1] || 55000;
  const c2 = sortedCentroids[2] || 85000;

  // Decision boundaries (midpoints between adjacent centroids)
  const boundary01 = (c0 + c1) / 2;
  const boundary12 = (c1 + c2) / 2;

  // Max X for graph coordinate mapping (e.g. 100,000 THB)
  const allSalaries = employees.map(e => Number(e.salary)).filter(s => !isNaN(s));
  const rawMaxSalary = allSalaries.length > 0 ? Math.max(...allSalaries) : 85000;
  const graphMaxSalary = Math.max(Math.ceil((rawMaxSalary * 1.18) / 10000) * 10000, 100000);

  // Function to determine cluster for any given salary
  const getClusterIndex = (salary) => {
    const s = Number(salary);
    const d0 = Math.abs(s - c0);
    const d1 = Math.abs(s - c1);
    const d2 = Math.abs(s - c2);
    if (d0 <= d1 && d0 <= d2) return 0;
    if (d1 <= d0 && d1 <= d2) return 1;
    return 2;
  };

  // Prepare scatter data points for all employees
  // Y-axis spans 0 to 50 (like in the reference screenshot)
  const sortedEmployees = [...employees].sort((a, b) => Number(a.salary) - Number(b.salary));
  const scatterPoints = sortedEmployees.map((emp, index) => {
    const salary = Number(emp.salary);
    const clusterIdx = getClusterIndex(salary);
    
    // X position percentage (5% to 92% of graph width)
    const xPct = Math.min(Math.max((salary / graphMaxSalary) * 92 + 4, 6), 94);
    
    // Y position calculation (spread across 10 to 48 like in reference curve)
    // Lower salaries have higher Y (units/headcount) and higher salaries have lower Y
    const total = Math.max(sortedEmployees.length - 1, 1);
    const baseCurveY = 47 - (index / total) * 38;
    // Add stable jitter based on employee ID so overlapping points separate cleanly
    const jitter = ((Number(emp.id) * 7) % 7) - 3;
    const yVal = Math.min(Math.max(baseCurveY + jitter, 6), 48);
    // Y percentage from bottom (0 to 50 scale)
    const yPct = (yVal / 50) * 100;

    return {
      id: emp.id,
      name: emp.name,
      position: emp.position,
      status: emp.status,
      salary,
      clusterIdx,
      xPct,
      yPct,
      yVal: Math.round(yVal)
    };
  });

  // Calculate boundary line X percentages
  const b01Pct = Math.min(Math.max((boundary01 / graphMaxSalary) * 92 + 4, 8), 92);
  const b12Pct = Math.min(Math.max((boundary12 / graphMaxSalary) * 92 + 4, 8), 92);

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

      {/* Cluster Analytics & Visual Graphs */}
      {!loading && hasAnalyzed && clusters && clusters.length > 0 && (
        <View style={styles.resultsContainer}>
          {/* Section Header with View Mode Toggles */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Ionicons name="analytics-outline" size={18} color={colors.primary} />
              <Text style={styles.sectionTitle}>Salary Clusters (k = 3)</Text>
            </View>

            <View style={styles.viewToggleGroup}>
              <TouchableOpacity
                style={[styles.toggleTab, viewMode === "scatter" && styles.toggleTabActive]}
                onPress={() => setViewMode("scatter")}
              >
                <Ionicons
                  name="radio-button-on-outline"
                  size={13}
                  color={viewMode === "scatter" ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.toggleTabText, viewMode === "scatter" && styles.toggleTabTextActive]}>
                  Scatter
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleTab, viewMode === "chart" && styles.toggleTabActive]}
                onPress={() => setViewMode("chart")}
              >
                <Ionicons
                  name="bar-chart-outline"
                  size={13}
                  color={viewMode === "chart" ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.toggleTabText, viewMode === "chart" && styles.toggleTabTextActive]}>
                  Bars
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleTab, viewMode === "cards" && styles.toggleTabActive]}
                onPress={() => setViewMode("cards")}
              >
                <Ionicons
                  name="grid-outline"
                  size={13}
                  color={viewMode === "cards" ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.toggleTabText, viewMode === "cards" && styles.toggleTabTextActive]}>
                  Cards
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* VIEW 1: 2D SCATTER PLOT (EXACTLY MATCHING USER REFERENCE IMAGE) */}
          {viewMode === "scatter" && (
            <View style={styles.scatterWrapper}>
              {/* Outer Graph Coordinate Area */}
              <View style={styles.graphLayoutRow}>
                {/* Y-Axis Label & Ticks */}
                <View style={styles.yAxisCol}>
                  <View style={styles.yAxisTitleWrapper}>
                    <Text style={styles.yAxisTitleText}>Units in Stock</Text>
                  </View>
                  <View style={styles.yTicksList}>
                    <Text style={styles.yTickText}>50</Text>
                    <Text style={styles.yTickText}>40</Text>
                    <Text style={styles.yTickText}>30</Text>
                    <Text style={styles.yTickText}>20</Text>
                    <Text style={styles.yTickText}>10</Text>
                    <Text style={styles.yTickText}>0</Text>
                  </View>
                </View>

                {/* Inner Chart Box with Grid and Border */}
                <View style={styles.chartBox}>
                  {/* Horizontal Grid Lines */}
                  <View style={[styles.gridLine, { top: "0%" }]} />
                  <View style={[styles.gridLine, { top: "20%" }]} />
                  <View style={[styles.gridLine, { top: "40%" }]} />
                  <View style={[styles.gridLine, { top: "60%" }]} />
                  <View style={[styles.gridLine, { top: "80%" }]} />
                  <View style={[styles.gridLine, { bottom: 0 }]} />

                  {/* Vertical Cluster Partition Lines */}
                  <View style={[styles.partitionLine, { left: `${b01Pct}%` }]} />
                  <View style={[styles.partitionLine, { left: `${b12Pct}%` }]} />

                  {/* Plotted Scatter Dots */}
                  {scatterPoints.map((pt) => {
                    const theme = clusterColors[pt.clusterIdx];
                    const isSelected = selectedPoint && selectedPoint.id === pt.id;
                    return (
                      <TouchableOpacity
                        key={pt.id}
                        activeOpacity={0.8}
                        onPress={() => setSelectedPoint(isSelected ? null : pt)}
                        style={[
                          styles.scatterDot,
                          {
                            left: `${pt.xPct}%`,
                            bottom: `${pt.yPct}%`,
                            backgroundColor: theme.color,
                            borderColor: isSelected ? "#1E293B" : "#FFFFFF",
                            transform: [{ scale: isSelected ? 1.35 : 1 }]
                          }
                        ]}
                      />
                    );
                  })}
                </View>
              </View>

              {/* X-Axis Ticks & Title */}
              <View style={styles.xAxisSection}>
                <View style={styles.xTicksRow}>
                  <Text style={styles.xTickText}>0 ฿</Text>
                  <Text style={styles.xTickText}>
                    {formatCompact(Math.round(graphMaxSalary * 0.25))}
                  </Text>
                  <Text style={styles.xTickText}>
                    {formatCompact(Math.round(graphMaxSalary * 0.5))}
                  </Text>
                  <Text style={styles.xTickText}>
                    {formatCompact(Math.round(graphMaxSalary * 0.75))}
                  </Text>
                  <Text style={styles.xTickText}>
                    {formatCompact(graphMaxSalary)}
                  </Text>
                </View>
                <Text style={styles.xAxisTitleText}>Product Price (THB) / Salary</Text>
              </View>

              {/* Centered Legend Matching Reference */}
              <View style={styles.referenceLegend}>
                <View style={styles.legendRowItem}>
                  <View style={[styles.legendCircle, { backgroundColor: clusterColors[0].color }]} />
                  <Text style={styles.legendLabelText}>Cluster 0 (Budget)</Text>
                </View>

                <View style={styles.legendRowItem}>
                  <View style={[styles.legendCircle, { backgroundColor: clusterColors[1].color }]} />
                  <Text style={styles.legendLabelText}>Cluster 1 (Mid-Range)</Text>
                </View>

                <View style={styles.legendRowItem}>
                  <View style={[styles.legendCircle, { backgroundColor: clusterColors[2].color }]} />
                  <Text style={styles.legendLabelText}>Cluster 2 (High-End)</Text>
                </View>
              </View>

              {/* Interactive Selected Dot Card */}
              {selectedPoint && (
                <View style={styles.selectedCard}>
                  <View style={styles.selectedCardLeft}>
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: clusterColors[selectedPoint.clusterIdx].color }
                      ]}
                    />
                    <View>
                      <Text style={styles.selectedName}>{selectedPoint.name}</Text>
                      <Text style={styles.selectedSub}>
                        {selectedPoint.position} • {selectedPoint.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.selectedCardRight}>
                    <Text style={styles.selectedSalary}>
                      {formatCurrency(selectedPoint.salary)}
                    </Text>
                    <Text style={styles.selectedCluster}>
                      {clusterColors[selectedPoint.clusterIdx].name}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* VIEW 2: VISUAL BAR & PROPORTION CHART */}
          {viewMode === "chart" && (
            <View style={styles.chartContainer}>
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

          {/* VIEW 3: SUMMARY CARDS */}
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

  // SCATTER PLOT STYLES (MATCHING REFERENCE SCREENSHOT)
  scatterWrapper: {
    paddingVertical: 6
  },
  graphLayoutRow: {
    flexDirection: "row",
    alignItems: "stretch",
    height: 250
  },
  yAxisCol: {
    width: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",
    paddingRight: 6
  },
  yAxisTitleWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 20
  },
  yAxisTitleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    transform: [{ rotate: "-90deg" }],
    width: 100,
    textAlign: "center"
  },
  yTicksList: {
    justifyContent: "space-between",
    alignItems: "flex-end",
    flex: 1,
    paddingVertical: 2
  },
  yTickText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500"
  },
  chartBox: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    overflow: "hidden"
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#EBF1F6"
  },
  partitionLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: "#CBD5E1",
    zIndex: 1
  },
  scatterDot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    marginLeft: -7,
    marginBottom: -7,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2
  },
  xAxisSection: {
    marginTop: 8,
    marginLeft: 60
  },
  xTicksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4
  },
  xTickText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500"
  },
  xAxisTitleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
    marginTop: 6
  },
  referenceLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9"
  },
  legendRowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendCircle: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  legendLabelText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600"
  },
  selectedCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    marginTop: 12
  },
  selectedCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  selectedIndicator: {
    width: 8,
    height: 32,
    borderRadius: 4
  },
  selectedName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B"
  },
  selectedSub: {
    fontSize: 11,
    color: "#64748B"
  },
  selectedCardRight: {
    alignItems: "flex-end"
  },
  selectedSalary: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A"
  },
  selectedCluster: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B"
  },

  // BAR CHART STYLES
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

  // CARDS STYLES
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
