/**
 * TRIP//OS Step 5D — Explainable Recommendation & Scoring Engine
 */

const DEFAULT_WEIGHTS = {
    nature: 0.25,
    adventure: 0.20,
    food: 0.10,
    photography: 0.15,
    nightlife: 0.05,
    relaxation: 0.10,
    budget: 0.10,
    walking: 0.03,
    crowd: 0.02
};

/**
 * Calculate Group DNA from approved member preference rows
 */
function calculateGroupDNA(preferences) {
    if (!preferences || preferences.length === 0) {
        return null;
    }

    const totals = {
        adventure: 0,
        nature: 0,
        food: 0,
        photography: 0,
        nightlife: 0,
        relaxation: 0,
        budgetSensitivity: 0,
        walkingTolerance: 0,
        crowdTolerance: 0
    };

    preferences.forEach(p => {
        totals.adventure += Number(p.adventure || 0);
        totals.nature += Number(p.nature || 0);
        totals.food += Number(p.food || 0);
        totals.photography += Number(p.photography || 0);
        totals.nightlife += Number(p.nightlife || 0);
        totals.relaxation += Number(p.relaxation || 0);
        totals.budgetSensitivity += Number(p.budget_sensitivity || 0);
        totals.walkingTolerance += Number(p.walking_tolerance || 0);
        totals.crowdTolerance += Number(p.crowd_tolerance || 0);
    });

    const count = preferences.length;
    const dna = {};
    Object.keys(totals).forEach(key => {
        dna[key] = totals[key] / count;
    });

    return {
        raw: dna,
        rounded: {
            adventure: Math.round(dna.adventure),
            nature: Math.round(dna.nature),
            food: Math.round(dna.food),
            photography: Math.round(dna.photography),
            nightlife: Math.round(dna.nightlife),
            relaxation: Math.round(dna.relaxation),
            budgetSensitivity: Math.round(dna.budgetSensitivity),
            walkingTolerance: Math.round(dna.walkingTolerance),
            crowdTolerance: Math.round(dna.crowdTolerance)
        }
    };
}

/**
 * Score and explain a single destination against Group DNA and Constraints
 */
function scoreDestination(destination, dna, constraints = [], weights = DEFAULT_WEIGHTS) {
    let rejected = false;
    const rejectionReasons = [];
    const matchedConstraints = [];
    const warnings = [];
    const why = [];

    // 1. Process group constraints
    constraints.forEach(constraint => {
        const item = (constraint.item || "").toLowerCase();
        const category = (constraint.category || "").toLowerCase();
        const type = constraint.constraint_type;
        const destText = `${destination.name || ""} ${destination.state || ""} ${destination.description || ""} ${destination.tags || ""}`.toLowerCase();

        let matches = destText.includes(item);

        // Structured constraint check
        if (!matches) {
            if (category === "crowd" && item.includes("crowd") && destination.crowd_level >= 75) matches = true;
            if (category === "walking" && (item.includes("walk") || item.includes("trek")) && destination.walking_requirement >= 75) matches = true;
            if (category === "budget" && item.includes("expensive") && destination.budget_score < 40) matches = true;
        }

        if (matches) {
            if (type === "DEAL_BREAKER") {
                rejected = true;
                rejectionReasons.push(`Deal-breaker conflict: ${constraint.item}`);
            } else if (type === "MUST_GO") {
                matchedConstraints.push(`Matches MUST_GO: ${constraint.item}`);
            } else if (type === "DONT_WANT") {
                matchedConstraints.push(`Matches DON'T_WANT: ${constraint.item}`);
                warnings.push(`Group preference avoids: ${constraint.item}`);
            }
        }
    });

    if (rejectionReasons.length > 0) {
        warnings.push("This destination conflicts with one or more group deal-breakers");
    }

    // 2. Walking & Crowd compatibility
    const walkingDiff = Math.abs(dna.walkingTolerance - (destination.walking_requirement ?? 50));
    const walkingFit = Math.max(0, 100 - walkingDiff);

    const crowdDiff = Math.abs(dna.crowdTolerance - (destination.crowd_level ?? 50));
    const crowdFit = Math.max(0, 100 - crowdDiff);

    // 3. Component Scores (Step 5D)
    const componentScores = {
        nature: Number(((dna.nature * (destination.nature_score ?? 50)) / 100).toFixed(2)),
        adventure: Number(((dna.adventure * (destination.adventure_score ?? 50)) / 100).toFixed(2)),
        food: Number(((dna.food * (destination.food_score ?? 50)) / 100).toFixed(2)),
        photography: Number(((dna.photography * (destination.photography_score ?? 50)) / 100).toFixed(2)),
        nightlife: Number(((dna.nightlife * (destination.nightlife_score ?? 50)) / 100).toFixed(2)),
        relaxation: Number(((dna.relaxation * (destination.relaxation_score ?? 50)) / 100).toFixed(2)),
        budget: Number(((dna.budgetSensitivity * (destination.budget_score ?? 50)) / 100).toFixed(2)),
        walking: Number(walkingFit.toFixed(2)),
        crowd: Number(crowdFit.toFixed(2))
    };

    // 4. Final Weighted Score
    const rawScore =
        (dna.nature * (destination.nature_score ?? 50) * weights.nature / 100) +
        (dna.adventure * (destination.adventure_score ?? 50) * weights.adventure / 100) +
        (dna.food * (destination.food_score ?? 50) * weights.food / 100) +
        (dna.photography * (destination.photography_score ?? 50) * weights.photography / 100) +
        (dna.nightlife * (destination.nightlife_score ?? 50) * weights.nightlife / 100) +
        (dna.relaxation * (destination.relaxation_score ?? 50) * weights.relaxation / 100) +
        (dna.budgetSensitivity * (destination.budget_score ?? 50) * weights.budget / 100) +
        (walkingFit * weights.walking) +
        (crowdFit * weights.crowd);

    const score = Number(rawScore.toFixed(2));

    // 5. Why explanations (Step 5D)
    if ((destination.nature_score ?? 0) >= 75 && dna.nature >= 60) {
        why.push("Strong match for your group's Nature preference");
    }
    if ((destination.adventure_score ?? 0) >= 75 && dna.adventure >= 60) {
        why.push("Strong match for your group's Adventure preference");
    }
    if ((destination.food_score ?? 0) >= 75 && dna.food >= 60) {
        why.push("Good food compatibility");
    }
    if ((destination.photography_score ?? 0) >= 75 && dna.photography >= 60) {
        why.push("Good photography potential");
    }
    if ((destination.relaxation_score ?? 0) >= 75 && dna.relaxation >= 60) {
        why.push("Good fit for relaxation");
    }
    if ((destination.nightlife_score ?? 0) >= 75 && dna.nightlife >= 60) {
        why.push("Vibrant nightlife matches group preference");
    }

    if (walkingFit >= 75) {
        why.push("Walking requirement fits your group");
    } else if (walkingFit < 50) {
        warnings.push("Walking requirements may not suit everyone");
    }

    if (crowdFit >= 75) {
        why.push("Crowd level fits your group's preference");
    } else if (crowdFit < 50) {
        warnings.push("Crowd level may not suit your group");
    }

    if (matchedConstraints.some(m => m.includes("MUST_GO"))) {
        why.push("Satisfies one or more MUST_GO member preferences");
    }

    if (why.length === 0) {
        why.push("Moderate overall compatibility with your group");
    }

    return {
        id: destination.id,
        name: destination.name,
        state: destination.state,
        country: destination.country || "India",
        latitude: destination.latitude,
        longitude: destination.longitude,
        score: score,
        status: rejected ? "REJECTED" : "RECOMMENDED",
        componentScores,
        why,
        warnings,
        rejectionReasons,
        matchedConstraints,
        description: destination.description
    };
}

/**
 * Score all destinations and rank them
 */
function rankDestinations(destinations, dna, constraints = [], weights = DEFAULT_WEIGHTS) {
    const recommendations = destinations.map(dest => scoreDestination(dest, dna, constraints, weights));

    // Sort: RECOMMENDED first (by score descending), then REJECTED (by score descending)
    recommendations.sort((a, b) => {
        if (a.status === "REJECTED" && b.status !== "REJECTED") return 1;
        if (a.status !== "REJECTED" && b.status === "REJECTED") return -1;
        return b.score - a.score;
    });

    return recommendations;
}

module.exports = {
    calculateGroupDNA,
    scoreDestination,
    rankDestinations,
    DEFAULT_WEIGHTS
};
