import type { AnalyzeIdeaInput, AnalysisDocument, MentorMessage } from '../shared/types.ts';

export const PROMPT_VERSION = 'startuplens-v1.2.0';

export const SCORE_RUBRIC = [
  {
    category: 'Problem Clarity',
    weight: 20,
    criteria: 'Is the problem concrete, understandable, and meaningful?',
  },
  {
    category: 'Customer Clarity',
    weight: 15,
    criteria: 'Can a specific target customer be identified?',
  },
  {
    category: 'Feasibility',
    weight: 20,
    criteria: 'Can a plausible prototype be built with available resources?',
  },
  {
    category: 'Differentiation',
    weight: 15,
    criteria: 'Is there a credible reason to choose this over alternatives?',
  },
  {
    category: 'Business Potential',
    weight: 20,
    criteria: 'Is there a plausible route to revenue or sustainable value?',
  },
  {
    category: 'Validation Readiness',
    weight: 10,
    criteria: 'Can key assumptions be tested affordably?',
  },
] as const;

export const ANALYSIS_SYSTEM_INSTRUCTION = `You are StartupLens AI (${PROMPT_VERSION}), a pragmatic startup analyst and product strategist for early-stage founders.

CORE OPERATING RULES:
1. Be concrete and specific to the user's submitted idea. Avoid generic motivational filler or vague startup clichés.
2. Be balanced and analytical: identify real weaknesses, adoption friction, execution uncertainty, and risks alongside opportunities.
3. NEVER guarantee startup success, profitability, demand, funding, or investment readiness.
4. NEVER fabricate external research, market-size numbers (no invented TAM/SAM/SOM dollar figures or CAGR percentages), competitor pricing claims, user testimonials, or URLs.
5. Explicitly distinguish user-provided facts, assumptions, and AI-generated hypotheses. Use framing like "Hypothesis:", "Assumption:", or "Needs validation:" where unverified.
6. Because live web retrieval is NOT enabled in this session (ai_only mode):
   - Set "validationStatus" to: "AI-generated heuristic analysis (no live web retrieval); competitor candidates and market hypotheses require independent founder verification."
   - For every competitor NOT explicitly supplied by the user, set verificationStatus to "unverified", set sourceUrls to [], and keep pricingNote framed as an unverified hypothesis (e.g., "Unverified — verify directly with provider").
   - For competitors explicitly provided by the user in Known Competitors, set verificationStatus to "user-provided" and sourceUrls to [].
7. If optional input fields (such as geography, audience, or budget) are missing, explicitly state reasonable assumptions in the "assumptions" array rather than inventing hidden facts.
8. Score strictly according to the 6-dimension heuristic rubric (integer 0–100 per category):
   - Problem Clarity (weight: 20)
   - Customer Clarity (weight: 15)
   - Feasibility (weight: 20)
   - Differentiation (weight: 15)
   - Business Potential (weight: 20)
   - Validation Readiness (weight: 10)
   Explain both the reasoning and key uncertainty in every score reason.
9. Recommend practical validation experiments that test the riskiest assumptions affordably with real prospective users.
10. Avoid discriminatory, harmful, illegal, or deceptive business advice.
11. Return ONLY valid JSON matching the requested schema.`;

export function buildIdeaAnalysisPrompt(input: AnalyzeIdeaInput): string {
  const weeks = input.roadmapWeeks || 6;
  const projectLabelInstruction = input.ideaName?.trim()
    ? `Use the user-provided project name: "${input.ideaName.trim()}".`
    : 'Generate a concise, neutral, descriptive 2–4 word project label derived from the idea (no hype or buzzwords).';

  return `Analyze the following startup idea and produce a complete, structured validation report.

${projectLabelInstruction}

SUBMITTED IDEA DETAILS:
- Idea Description: ${input.ideaDescription.trim()}
- Industry / Category: ${input.industry?.trim() || 'Not specified (state assumption if inferred)'}
- Target Country / Market: ${input.targetMarket?.trim() || 'Not specified (do not assume geography silently; state assumption)'}
- Target Audience: ${input.targetAudience?.trim() || 'Not specified'}
- Problem Being Solved: ${input.problemStatement?.trim() || 'Not specified beyond description'}
- Current Stage: ${input.currentStage || 'idea'}
- User-Provided Known Competitors: ${input.knownCompetitors?.trim() || 'None listed by user'}
- Budget / Constraints: ${input.budgetConstraints?.trim() || 'Not specified (assume lean early-stage constraints)'}
- Requested Roadmap Horizon: ${weeks} weeks

REQUIREMENTS BY SECTION:
- scoreBreakdown: Must contain all 6 exact categories with exact weights (20, 15, 20, 15, 20, 10).
- topStrengths: 3–4 concrete strengths specific to this idea.
- topConcerns: 3–4 concrete weaknesses or uncertainties.
- nextActions: Exactly 3 highest-priority immediate validation actions.
- market: Include primary targetSegments, secondarySegments, painPoints, opportunities, barriers, hypotheses (explicitly phrased as hypotheses needing validation), interviewQuestions (6–8 non-leading discovery questions), and 3–5 validationExperiments (assumption, experiment, successSignal).
- competitors: Include 3–5 entries mixing direct competitors, indirect alternatives, and user-provided competitors if any were supplied. Set verificationStatus accurately.
- businessModels: Provide 3–4 relevant business models with fitScore (0–100), pros, cons, implementationComplexity, riskLevel, pricingHypothesis (framed as estimate/hypothesis), revenueStreams, and costDrivers. Set recommendedBusinessModel and recommendedBusinessModelReason.
- swot: 3–4 specific points per quadrant (strengths, weaknesses, opportunities, threats).
- mvp: Define recommendedScope, coreUserJourney (4–6 sequential steps), mustHave (3–5), shouldHave (2–4), couldHave (2–3), outOfScope (3–4 explicit exclusions), and successMetrics (3–4 measurable early signals).
- roadmap: Generate a practical ${weeks}-week phased roadmap broken into 3–4 phases. Each task must have title, description, priority, durationEstimate, deliverable, and optional dependency.
- risks: Provide 5–6 risks covering Product, Market, Competition, Technical, Operational, and Data & Privacy (where relevant) with severity, likelihood, mitigation, and earlyWarning.
- pitchDeckOutline: Provide an 8-slide outline (Problem, Solution, Target Market, Competition, Business Model, Go-to-Market, Roadmap, Risks & Ask/Vision) tailored to this idea.`;
}

export const MENTOR_SYSTEM_INSTRUCTION = `You are the StartupLens AI Mentor, a pragmatic, direct startup strategist advising a founder on their specific analyzed idea.

RULES:
- Ground every answer in the provided report context (scores, assumptions, competitors, MVP scope, roadmap, risks).
- Be concise, structured, and actionable. Use bullet points or numbered steps when advising on validation, acquisition, pricing, or scope cuts.
- Clearly flag when advice relies on unverified assumptions and suggest concrete ways to test them.
- Never fabricate market statistics, competitor claims, or guarantee success/funding.
- Do not repeat the entire report back verbatim; focus specifically on answering the founder's question.`;

export function buildMentorContextSummary(doc: AnalysisDocument): string {
  const r = doc.reportJson;
  const scoreSummary = r.scoreBreakdown
    .map((s) => `${s.category}: ${s.score}/100 (${s.reason})`)
    .join('\n  ');

  const competitorSummary = r.competitors
    .map((c) => `${c.name} [${c.type}, ${c.verificationStatus}]: ${c.offering}`)
    .join('\n  ');

  const mvpMust = r.mvp.mustHave.map((m) => m.feature).join(', ');
  const mvpOut = r.mvp.outOfScope.join(', ');
  const risksSummary = r.risks
    .map((rk) => `[${rk.category} | sev:${rk.severity}/lik:${rk.likelihood}] ${rk.risk}`)
    .join('\n  ');

  return `ANALYZED IDEA CONTEXT:
- Project Name: ${doc.ideaName}
- Stage: ${doc.currentStage} | Industry: ${doc.industry || 'Unspecified'} | Market: ${doc.targetMarket || 'Unspecified'}
- Idea Description: ${doc.ideaDescription}
- Overall Heuristic Score: ${r.overallScore}/100 (Verdict: ${r.verdict})
- Executive Summary: ${r.executiveSummary}
- Key Assumptions: ${r.assumptions.join(' | ')}
- Score Breakdown:
  ${scoreSummary}
- Recommended Business Model: ${r.recommendedBusinessModel} — ${r.recommendedBusinessModelReason}
- Competitors:
  ${competitorSummary}
- MVP Must-Have Features: ${mvpMust}
- MVP Out of Scope: ${mvpOut}
- Top Risks:
  ${risksSummary}
- Immediate Next Actions: ${r.nextActions.join(' | ')}`;
}

export function formatChatHistoryForPrompt(history: MentorMessage[]): string {
  if (!history.length) return 'No prior messages in this conversation.';
  return history
    .slice(-10)
    .map((msg) => `${msg.role === 'user' ? 'Founder' : 'Mentor'}: ${msg.content}`)
    .join('\n\n');
}
