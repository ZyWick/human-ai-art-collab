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

function jitterBox(box, amount = 0.01) {
  return box.map(coord => {
    const noise = (Math.random() - 0.5) * 2 * amount; // range [-amount, amount]
    let jittered = coord + noise;
    // Clamp to [0, 1]
    return Math.min(1, Math.max(0, jittered));
  });
}

export function getTopFusedBoxes(data, N, iouThreshold = 0.5) {
  const weightedBoxes = [];
  const EPSILON = 0.1;

  for (const entry of data) {
      const netVotes = entry.votes;
      let weight = netVotes > 0 ? netVotes : EPSILON;

    for (const box of entry.boundingBoxes) {
      weightedBoxes.push({ box, weight });
    }
  }

  // Cluster boxes by IoU
  const clusters = [];
  const used = new Array(weightedBoxes.length).fill(false);

  for (let i = 0; i < weightedBoxes.length; i++) {
    if (used[i]) continue;
    const cluster = [weightedBoxes[i]];
    used[i] = true;

    for (let j = i + 1; j < weightedBoxes.length; j++) {
      if (used[j]) continue;
      const iou = computeIoU(weightedBoxes[i].box, weightedBoxes[j].box);
      if (iou >= iouThreshold) {
        cluster.push(weightedBoxes[j]);
        used[j] = true;
      }
    }

    clusters.push(cluster);
  }

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

  // Pad with jittered copies if fewer than N
  while (finalBoxes.length < N && finalBoxes.length > 0) {
    const lastBox = finalBoxes[finalBoxes.length - 1];
    finalBoxes.push(jitterBox(lastBox));
  }

  return finalBoxes;
}
