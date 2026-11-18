import { z } from 'zod';

export const AnalyzeIdeaInputSchema = z.object({
  ideaName: z
    .string()
    .trim()
    .max(120, 'Project name must be 120 characters or fewer.')
    .optional()
    .default(''),
  ideaDescription: z
    .string()
    .trim()
    .min(20, 'Please describe your startup idea in at least 20 characters so the analysis can be specific.')
    .max(2500, 'Idea description must be 2,500 characters or fewer.'),
  industry: z
    .string()
    .trim()
    .max(80, 'Industry must be 80 characters or fewer.')
    .optional()
    .default(''),
  targetMarket: z
    .string()
    .trim()
    .max(100, 'Target market must be 100 characters or fewer.')
    .optional()
    .default(''),
  targetAudience: z
    .string()
    .trim()
    .max(250, 'Target audience must be 250 characters or fewer.')
    .optional()
    .default(''),
  problemStatement: z
    .string()
    .trim()
    .max(600, 'Problem statement must be 600 characters or fewer.')
    .optional()
    .default(''),
  currentStage: z
    .enum(['idea', 'research', 'prototype', 'launched'])
    .optional()
    .default('idea'),
  knownCompetitors: z
    .string()
    .trim()
    .max(300, 'Known competitors must be 300 characters or fewer.')
    .optional()
    .default(''),
  budgetConstraints: z
    .string()
    .trim()
    .max(300, 'Budget/constraints must be 300 characters or fewer.')
    .optional()
    .default(''),
  roadmapWeeks: z
    .union([z.literal(4), z.literal(6), z.literal(8)])
    .optional()
    .default(6),
});

export const ChatMessageInputSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, 'Please enter a question for the Startup Mentor.')
    .max(1200, 'Question must be 1,200 characters or fewer.'),
});

export const RenameAnalysisInputSchema = z.object({
  ideaName: z
    .string()
    .trim()
    .min(2, 'Project name must be at least 2 characters.')
    .max(120, 'Project name must be 120 characters or fewer.'),
});

export const RegisterInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be 80 characters or fewer.'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .max(160, 'Email must be 160 characters or fewer.')
    .transform((e) => e.toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password must be 128 characters or fewer.'),
});

export const LoginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .transform((e) => e.toLowerCase()),
  password: z.string().min(1, 'Please enter your password.').max(128),
});

const BoundedScoreSchema = z.number().finite().transform((val) => Math.max(0, Math.min(100, Math.round(val))));

const ScoreBreakdownItemSchema = z.object({
  category: z.string().min(1),
  weight: z.number().finite().min(0).max(100),
  score: BoundedScoreSchema,
  reason: z.string().min(1),
});

const ValidationExperimentSchema = z.object({
  assumption: z.string().min(1),
  experiment: z.string().min(1),
  successSignal: z.string().min(1),
});

const MarketAnalysisSchema = z.object({
  targetSegments: z.array(z.string().min(1)).min(1),
  secondarySegments: z.array(z.string().min(1)).default([]),
  painPoints: z.array(z.string().min(1)).min(1),
  opportunities: z.array(z.string().min(1)).min(1),
  barriers: z.array(z.string().min(1)).min(1),
  hypotheses: z.array(z.string().min(1)).min(1),
  interviewQuestions: z.array(z.string().min(1)).min(1),
  validationExperiments: z.array(ValidationExperimentSchema).min(1),
});

const CompetitorEntrySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['direct', 'indirect', 'alternative', 'candidate']),
  targetAudience: z.string().min(1),
  offering: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  weaknesses: z.array(z.string().min(1)).min(1),
  differentiation: z.string().min(1),
  pricingNote: z.string().min(1),
  sourceUrls: z.array(z.string()).default([]),
  verificationStatus: z.enum(['verified', 'unverified', 'user-provided']),
});

const BusinessModelOptionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  pros: z.array(z.string().min(1)).min(1),
  cons: z.array(z.string().min(1)).min(1),
  implementationComplexity: z.enum(['low', 'medium', 'high']),
  riskLevel: z.enum(['low', 'medium', 'high']),
  pricingHypothesis: z.string().min(1),
  revenueStreams: z.array(z.string().min(1)).min(1),
  costDrivers: z.array(z.string().min(1)).min(1),
  fitScore: BoundedScoreSchema,
});

const MvpFeatureItemSchema = z.object({
  feature: z.string().min(1),
  reason: z.string().min(1),
});

const MvpPlanSchema = z.object({
  recommendedScope: z.string().min(1),
  coreUserJourney: z.array(z.string().min(1)).min(1),
  mustHave: z.array(MvpFeatureItemSchema).min(1),
  shouldHave: z.array(MvpFeatureItemSchema).default([]),
  couldHave: z.array(MvpFeatureItemSchema).default([]),
  outOfScope: z.array(z.string().min(1)).min(1),
  successMetrics: z.array(z.string().min(1)).min(1),
});

const RoadmapTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['high', 'medium', 'low']),
  durationEstimate: z.string().min(1),
  deliverable: z.string().min(1),
  dependency: z.string().optional().default(''),
});

const RoadmapPhaseSchema = z.object({
  phase: z.string().min(1),
  duration: z.string().min(1),
  tasks: z.array(RoadmapTaskSchema).min(1),
});

const RiskItemSchema = z.object({
  risk: z.string().min(1),
  category: z.enum([
    'Product',
    'Market',
    'Competition',
    'Technical',
    'Operational',
    'Data & Privacy',
  ]),
  severity: z.enum(['high', 'medium', 'low']),
  likelihood: z.enum(['high', 'medium', 'low']),
  mitigation: z.string().min(1),
  earlyWarning: z.string().min(1),
});

const PitchDeckSlideSchema = z.object({
  slideNumber: z.number().int().min(1),
  title: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
  speakerNote: z.string().min(1),
});

export const GeminiReportPayloadSchema = z.object({
  ideaName: z.string().min(1),
  verdict: z.enum(['Promising', 'Needs Validation', 'High Risk']),
  executiveSummary: z.string().min(1),
  topStrengths: z.array(z.string().min(1)).min(1),
  topConcerns: z.array(z.string().min(1)).min(1),
  assumptions: z.array(z.string().min(1)).min(1),
  validationStatus: z.string().min(1),
  scoreBreakdown: z.array(ScoreBreakdownItemSchema).length(6),
  market: MarketAnalysisSchema,
  competitors: z.array(CompetitorEntrySchema).min(1),
  differentiationOpportunities: z.array(z.string().min(1)).min(1),
  competitiveRisks: z.array(z.string().min(1)).min(1),
  businessModels: z.array(BusinessModelOptionSchema).min(3).max(5),
  recommendedBusinessModel: z.string().min(1),
  recommendedBusinessModelReason: z.string().min(1),
  swot: z.object({
    strengths: z.array(z.string().min(1)).min(1),
    weaknesses: z.array(z.string().min(1)).min(1),
    opportunities: z.array(z.string().min(1)).min(1),
    threats: z.array(z.string().min(1)).min(1),
  }),
  mvp: MvpPlanSchema,
  roadmap: z.array(RoadmapPhaseSchema).min(2),
  risks: z.array(RiskItemSchema).min(4),
  nextActions: z.array(z.string().min(1)).min(3).max(5),
  pitchDeckOutline: z.array(PitchDeckSlideSchema).min(6),
});

export type GeminiReportPayload = z.infer<typeof GeminiReportPayloadSchema>;
