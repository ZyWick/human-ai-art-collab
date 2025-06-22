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

function jitterBox(box, relativeAmount = 0.05) {
  const [x1, y1, x2, y2] = box;
  const width = x2 - x1;
  const height = y2 - y1;

  const jittered = [
    x1 + (Math.random() - 0.5) * 2 * width * relativeAmount,
    y1 + (Math.random() - 0.5) * 2 * height * relativeAmount,
    x2 + (Math.random() - 0.5) * 2 * width * relativeAmount,
    y2 + (Math.random() - 0.5) * 2 * height * relativeAmount
  ];

  // Ensure box remains within [0, 1] and valid (x1 <= x2, y1 <= y2)
  const [jx1, jy1, jx2, jy2] = jittered.map(v => Math.min(1, Math.max(0, v)));
  return [
    Math.min(jx1, jx2),
    Math.min(jy1, jy2),
    Math.max(jx1, jx2),
    Math.max(jy1, jy2)
  ];
}


export function getTopFusedBoxes(data, N, iouThreshold = 0.3) {
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

  const totalScore = scoredFusedBoxes.reduce((sum, b) => sum + b.score, 0);
  const probs = scoredFusedBoxes.map(b => b.score / totalScore);

  // Get weighted random indices
  const selectedIndices = weightedChoice(probs, Math.min(N, scoredFusedBoxes.length));

  // Select boxes based on indices
  let final = selectedIndices.map(i => scoredFusedBoxes[i].box);

  // Pad with jittered versions if needed
  while (final.length < N && final.length > 0) {
    final.push(jitterBox(final[final.length - 1]));
  }

  console.log(final)

  return final;
}

// Helper: Random weighted selection without replacement
function weightedChoice(probabilities, count) {
  const indices = [];
  const taken = new Set();

  while (indices.length < count) {
    const r = Math.random();
    let acc = 0;

    for (let i = 0; i < probabilities.length; i++) {
      if (taken.has(i)) continue;

      acc += probabilities[i];
      if (r <= acc) {
        indices.push(i);
        taken.add(i);
        break;
      }
    }
  }

  return indices;
}