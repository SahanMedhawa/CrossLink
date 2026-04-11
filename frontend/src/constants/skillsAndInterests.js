/**
 * ═══════════════════════════════════════════════════════════════
 *  Single source of truth for skills, interests, focus areas
 *  and availability options used across the entire application.
 *
 *  Import from here in every component that needs these lists.
 *  Custom (user-typed) skills are still supported everywhere —
 *  the matchmaking engine does fuzzy string matching, so any
 *  skill string works regardless of whether it's in this list.
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Skills (volunteers pick these, NGOs assign them to projects) ───
export const SKILL_OPTIONS = [
  // Tech & Development
  "JavaScript",
  "Python",
  "React",
  "Node.js",
  "Java",
  "HTML/CSS",
  "Web Development",
  "Data Analysis",
  "Machine Learning",

  // Creative & Media
  "Graphic Design",
  "Content Writing",
  "Photography",
  "Video Editing",
  "Social Media",

  // Soft & Professional
  "Project Management",
  "Communication",
  "Leadership",
  "Public Speaking",
  "Event Planning",
  "Fundraising",
  "Counseling",
  "Mentoring",
  "Teaching",

  // Domain-specific
  "Healthcare",
  "Legal",
  "Finance",
  "Marketing",
  "Environmental Science",
  "Community Outreach",
];

// ─── Interests (volunteers pick during signup / profile edit) ───
export const INTEREST_OPTIONS = [
  "Education",
  "Healthcare",
  "Environment",
  "Poverty Alleviation",
  "Animal Welfare",
  "Human Rights",
  "Technology",
  "Arts & Culture",
  "Disaster Relief",
  "Community Development",
  "Youth Empowerment",
  "Women Empowerment",
  "Clean Water",
  "Food Security",
];

// ─── Focus Areas (NGOs pick during project creation) ───
export const FOCUS_AREA_OPTIONS = [
  "Education",
  "Healthcare",
  "Environment",
  "Youth",
  "Women Empowerment",
  "Poverty Alleviation",
  "Animal Welfare",
  "Disaster Relief",
  "Arts & Culture",
  "Technology",
];

// ─── Availability (volunteer profile) ───
export const AVAILABILITY_OPTIONS = [
  "Full-time",
  "Part-time",
  "Weekends only",
  "Evenings only",
  "Flexible",
];
