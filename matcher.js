/**
 * matcher.js — 30 Minute Tomorrow activity scorer
 * Client-side, no dependencies.
 */

(function (global) {
  'use strict';

  /**
   * Score a single activity against the parent's inputs.
   * Returns a numeric score. Higher = better match.
   */
  function scoreActivity(activity, params) {
    const { age, interests, vibe, duration } = params;
    let score = 0;

    // Age fit (+3)
    if (age >= activity.age_min && age <= activity.age_max) {
      score += 3;
    } else {
      // Distance penalty so we can still fall back to near-age activities
      const dist = Math.min(
        Math.abs(age - activity.age_min),
        Math.abs(age - activity.age_max)
      );
      score -= dist * 0.5;
    }

    // Interest match (+2 per matching tag, case-insensitive substring)
    if (interests && interests.trim()) {
      const tokens = interests.toLowerCase().split(/[\s,]+/).filter(Boolean);
      const actInterests = (activity.interests || []).map(s => s.toLowerCase());
      tokens.forEach(token => {
        if (actInterests.some(ai => ai.includes(token) || token.includes(ai))) {
          score += 2;
        }
      });
    }

    // Vibe match (+2)
    if (vibe && (activity.vibe || []).some(v => v.toLowerCase() === vibe.toLowerCase())) {
      score += 2;
    }

    // Duration match (+1)
    if (duration) {
      const durNum = parseInt(duration, 10);
      if (activity.duration_min <= durNum) {
        score += 1;
      }
    }

    // Home setting bonus (+1)
    if ((activity.setting || []).includes('home')) {
      score += 1;
    }

    // No special materials bonus (+0.5)
    if (activity.no_special_materials) {
      score += 0.5;
    }

    return score;
  }

  /**
   * Fisher-Yates shuffle (in-place).
   */
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Return top N activities for the given params.
   * Tie-breaks with random shuffle so repeated queries vary.
   *
   * @param {Array}  activities  - full activities array
   * @param {Object} params      - { age, interests, vibe, duration }
   * @param {number} n           - how many to return (default 3)
   * @returns {{ results: Array, stretched: boolean }}
   */
  function match(activities, params, n) {
    n = n || 3;

    // Score everything
    const scored = activities.map(a => ({ activity: a, score: scoreActivity(a, params) }));

    // Shuffle first so ties resolve randomly
    shuffle(scored);

    // Sort descending
    scored.sort((a, b) => b.score - a.score);

    // Check if any in-age-band results exist
    const age = parseInt(params.age, 10);
    const inBand = scored.filter(s => age >= s.activity.age_min && age <= s.activity.age_max);

    let results;
    let stretched = false;

    if (inBand.length >= n) {
      results = inBand.slice(0, n).map(s => s.activity);
    } else if (inBand.length > 0) {
      // Fill with out-of-band
      const outBand = scored.filter(s => !(age >= s.activity.age_min && age <= s.activity.age_max));
      results = [
        ...inBand.map(s => s.activity),
        ...outBand.slice(0, n - inBand.length).map(s => s.activity)
      ];
      stretched = true;
    } else {
      // Fully out-of-band fallback
      results = scored.slice(0, n).map(s => s.activity);
      stretched = true;
    }

    return { results, stretched };
  }

  global.Matcher = { match };
})(window);
