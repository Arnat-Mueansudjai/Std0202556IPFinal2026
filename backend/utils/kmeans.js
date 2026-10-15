/**
 * 1D K-Means Clustering Algorithm (k = 3)
 * Analyzes employee salaries into 3 distinct tiers:
 * Tier 1 (Entry/Base), Tier 2 (Mid-Level), Tier 3 (Senior/Executive)
 * 
 * Robust against edge cases (few records, duplicate salaries, empty list)
 * to ensure the backend never crashes.
 */

function runKMeans1D(salaries, k = 3) {
  // Convert all items to valid positive numbers
  const validSalaries = salaries
    .map(s => Number(s))
    .filter(s => !isNaN(s) && isFinite(s));

  // Edge case: Empty salaries
  if (validSalaries.length === 0) {
    return [
      { group: "Tier 1", centroid: 0, count: 0 },
      { group: "Tier 2", centroid: 0, count: 0 },
      { group: "Tier 3", centroid: 0, count: 0 }
    ];
  }

  // Edge case: Fewer records than k
  if (validSalaries.length < k) {
    const sorted = [...validSalaries].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < k; i++) {
      if (i < sorted.length) {
        result.push({
          group: `Tier ${i + 1}`,
          centroid: Math.round(sorted[i]),
          count: 1
        });
      } else {
        result.push({
          group: `Tier ${i + 1}`,
          centroid: 0,
          count: 0
        });
      }
    }
    return result;
  }

  // Sort salaries ascending
  const sorted = [...validSalaries].sort((a, b) => a - b);
  const minVal = sorted[0];
  const maxVal = sorted[sorted.length - 1];

  // If all salaries are identical
  if (minVal === maxVal) {
    return [
      { group: "Tier 1", centroid: Math.round(minVal), count: validSalaries.length },
      { group: "Tier 2", centroid: 0, count: 0 },
      { group: "Tier 3", centroid: 0, count: 0 }
    ];
  }

  // Initialize 3 centroids spread across the data distribution
  let centroids = [
    sorted[0],
    sorted[Math.floor(sorted.length / 2)],
    sorted[sorted.length - 1]
  ];

  // Ensure initial centroids are distinct
  if (centroids[0] === centroids[1]) {
    centroids[1] = centroids[0] + (maxVal - minVal) / 3;
  }
  if (centroids[1] === centroids[2]) {
    centroids[2] = centroids[1] + (maxVal - minVal) / 3;
  }

  const maxIterations = 50;
  let clusters = [[], [], []];

  for (let iter = 0; iter < maxIterations; iter++) {
    // Reset clusters
    clusters = [[], [], []];

    // Assign each salary to the closest centroid
    for (const val of validSalaries) {
      let minDistance = Infinity;
      let closestClusterIndex = 0;

      for (let c = 0; c < k; c++) {
        const dist = Math.abs(val - centroids[c]);
        if (dist < minDistance) {
          minDistance = dist;
          closestClusterIndex = c;
        }
      }

      clusters[closestClusterIndex].push(val);
    }

    // Calculate new centroids
    let converged = true;
    const newCentroids = [];

    for (let c = 0; c < k; c++) {
      if (clusters[c].length === 0) {
        // Keep old centroid if cluster is empty
        newCentroids.push(centroids[c]);
      } else {
        const sum = clusters[c].reduce((acc, curr) => acc + curr, 0);
        const mean = sum / clusters[c].length;
        if (Math.abs(mean - centroids[c]) > 0.01) {
          converged = false;
        }
        newCentroids.push(mean);
      }
    }

    centroids = newCentroids;
    if (converged) break;
  }

  // Format clusters and sort ascending by centroid value
  const clusterData = centroids.map((centroid, idx) => ({
    centroid: Math.round(centroid),
    count: clusters[idx].length
  }));

  clusterData.sort((a, b) => a.centroid - b.centroid);

  return clusterData.map((c, idx) => ({
    group: `Tier ${idx + 1}`,
    centroid: c.centroid,
    count: c.count
  }));
}

module.exports = { runKMeans1D };
