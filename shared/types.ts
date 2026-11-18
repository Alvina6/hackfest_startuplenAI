export type IdeaStage = 'idea' | 'research' | 'prototype' | 'launched';

export type VerdictLabel = 'Promising' | 'Needs Validation' | 'High Risk';

export type CompetitorType = 'direct' | 'indirect' | 'alternative' | 'candidate';

export type VerificationStatus = 'verified' | 'unverified' | 'user-provided';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type ComplexityLevel = 'low' | 'medium' | 'high';

export type RiskCategory =
  | 'Product'
  | 'Market'
  | 'Competition'
  | 'Technical'
  | 'Operational'
  | 'Data & Privacy';

export type ResearchMode = 'ai_only' | 'web_grounded';

export interface AnalyzeIdeaInput {
  ideaName?: string;
  ideaDescription: string;
  industry?: string;
  targetMarket?: string;
  targetAudience?: string;
  problemStatement?: string;
  currentStage?: IdeaStage;
  knownCompetitors?: string;
  budgetConstraints?: string;
  roadmapWeeks?: 4 | 6 | 8;
}

export interface ScoreBreakdownItem {
  category: string;
  weight: number;
  score: number;
  reason: string;
}

export interface ValidationExperiment {
  assumption: string;
  experiment: string;
  successSignal: string;
}

export interface MarketAnalysis {
  targetSegments: string[];
  secondarySegments: string[];
  painPoints: string[];
  opportunities: string[];
  barriers: string[];
  hypotheses: string[];
  interviewQuestions: string[];
  validationExperiments: ValidationExperiment[];
}

export interface CompetitorEntry {
  name: string;
  type: CompetitorType;
  targetAudience: string;
  offering: string;
  strengths: string[];
  weaknesses: string[];
  differentiation: string;
  pricingNote: string;
  sourceUrls: string[];
  verificationStatus: VerificationStatus;
}

export interface BusinessModelOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  implementationComplexity: ComplexityLevel;
  riskLevel: ComplexityLevel;
  pricingHypothesis: string;
  revenueStreams: string[];
  costDrivers: string[];
  fitScore: number;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface MvpFeatureItem {
  feature: string;
  reason: string;
}

export interface MvpPlan {
  recommendedScope: string;
  coreUserJourney: string[];
  mustHave: MvpFeatureItem[];
  shouldHave: MvpFeatureItem[];
  couldHave: MvpFeatureItem[];
  outOfScope: string[];
  successMetrics: string[];
}

export interface RoadmapTask {
  title: string;
  description: string;
  priority: PriorityLevel;
  durationEstimate: string;
  deliverable: string;
  dependency?: string;
}

export interface RoadmapPhase {
  phase: string;
  duration: string;
  tasks: RoadmapTask[];
}

export interface RiskItem {
  risk: string;
  category: RiskCategory;
  severity: PriorityLevel;
  likelihood: PriorityLevel;
  mitigation: string;
  earlyWarning: string;
}

export interface PitchDeckSlide {
  slideNumber: number;
  title: string;
  keyPoints: string[];
  speakerNote: string;
}

export interface StartupReport {
  analysisId: string;
  ideaName: string;
  generatedAt: string;
  overallScore: number;
  verdict: VerdictLabel;
  executiveSummary: string;
  topStrengths: string[];
  topConcerns: string[];
  assumptions: string[];
  validationStatus: string;
  scoreBreakdown: ScoreBreakdownItem[];
  market: MarketAnalysis;
  competitors: CompetitorEntry[];
  differentiationOpportunities: string[];
  competitiveRisks: string[];
  businessModels: BusinessModelOption[];
  recommendedBusinessModel: string;
  recommendedBusinessModelReason: string;
  swot: SwotAnalysis;
  mvp: MvpPlan;
  roadmap: RoadmapPhase[];
  risks: RiskItem[];
  nextActions: string[];
  pitchDeckOutline: PitchDeckSlide[];
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AnalysisDocument {
  id: string;
  userId: string;
  ideaName: string;
  ideaDescription: string;
  industry: string;
  targetMarket: string;
  targetAudience: string;
  problemStatement: string;
  currentStage: IdeaStage;
  knownCompetitors: string;
  budgetConstraints: string;
  roadmapWeeks: 4 | 6 | 8;
  reportJson: StartupReport;
  promptVersion: string;
  modelName: string;
  researchMode: ResearchMode;
  chatHistory: MentorMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: {
    code: string;
    details?: string;
  };
}
