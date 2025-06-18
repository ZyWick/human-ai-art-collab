function computeIoU(boxA, boxB) {
  const [xA1, yA1, xA2, yA2] = boxA;
  const [xB1, yB1, xB2, yB2] = boxB;

  const x1 = Math.max(xA1, xB1);
  const y1 = Math.max(yA1, yB1);
  const x2 = Math.min(xA2, xB2);
  const y2 = Math.min(yA2, yB2);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const areaA = (xA2 - xA1) * (yA2 - yA1);
  const areaB = (xB2 - xB1) * (yB2 - yB1);
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

// Helper to merge overlapping indices using BFS (connected components)
function findClusters(weightedBoxes, iouThreshold) {
  const n = weightedBoxes.length;
  const clusters = [];
  const visited = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const cluster = [weightedBoxes[i]];
    visited[i] = true;
    const queue = [i];
    while (queue.length) {
      const idx = queue.shift();
      for (let j = 0; j < n; j++) {
        if (visited[j]) continue;
        // If this box overlaps any box in the cluster
        if (computeIoU(weightedBoxes[idx].box, weightedBoxes[j].box) >= iouThreshold) {
          visited[j] = true;
          cluster.push(weightedBoxes[j]);
          queue.push(j);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function averageBoxes(cluster) {
  const totalWeight = cluster.reduce((sum, item) => sum + item.weight, 0);
  const avgBox = [0, 0, 0, 0];

  for (const { box, weight } of cluster) {
    for (let i = 0; i < 4; i++) {
      avgBox[i] += box[i] * weight;
    }
  }

  return avgBox.map(val => val / totalWeight);
}

function validBox(box) {
  return (
    Array.isArray(box) &&
    box.length === 4 &&
    box.every(n => typeof n === 'number' && !isNaN(n)) &&
    box[0] <= box[2] &&
    box[1] <= box[3] &&
    box.every(n => n >= 0 && n <= 1)
  );
}

function jitterBox(box, amount = 0.01) {
  return box.map(coord => {
    const noise = (Math.random() - 0.5) * 2 * amount; // range [-amount, amount]
    let jittered = coord + noise;
    return Math.min(1, Math.max(0, jittered));
  });
}

export function getTopFusedBoxes(data, N, iouThreshold = 0.5) {
  const weightedBoxes = [];
  const EPSILON = 1e-6;

   for (const entry of data) {
    const netVotes = entry.votes;
    let weight = netVotes > 0 ? netVotes : EPSILON;
    for (const box of entry.boundingBoxes) {
      if (validBox(box))
        weightedBoxes.push({ box, weight });
    }
  }
  if (weightedBoxes.length === 0 || N === 0) return [];

  // Cluster boxes using non-greedy, connected component method
  const clusters = findClusters(weightedBoxes, iouThreshold);

  // Fuse each cluster
  const fusedBoxes = clusters.map(averageBoxes);

   // Sort by total cluster weight (descending)
  const scoredFusedBoxes = clusters.map((cluster, idx) => ({
    box: fusedBoxes[idx],
    score: cluster.reduce((sum, item) => sum + item.weight, 0)
  }));
  scoredFusedBoxes.sort((a, b) => b.score - a.score);

  // Get top-N fused boxes
  const finalBoxes = scoredFusedBoxes.slice(0, N).map(item => item.box);

  // Pad with jittered copies if fewer than N and at least one detection
  while (finalBoxes.length < N && finalBoxes.length > 0) {
    const lastBox = finalBoxes[finalBoxes.length - 1];
    finalBoxes.push(jitterBox(lastBox));
  }

  return finalBoxes;
}
