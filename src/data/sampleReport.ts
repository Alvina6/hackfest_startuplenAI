import type { AnalysisDocument, AnalyzeIdeaInput } from '../../shared/types';

export const DEMO_IDEA_INPUT: AnalyzeIdeaInput = {
  ideaName: 'ScholarBridge PK',
  ideaDescription:
    'A scholarship-matching platform for Pakistani university students that uses academic profile, field of study, household budget, destination preferences, and eligibility criteria to recommend relevant local and international scholarships and guide step-by-step applications.',
  industry: 'EdTech',
  targetMarket: 'Pakistan (initial launch) + Global study destinations',
  targetAudience:
    'Pakistani undergraduate and graduating university students seeking funded local or international degrees',
  problemStatement:
    'Students miss verified funding opportunities or waste weeks applying to scholarships they are ineligible for because criteria are scattered across outdated forums and PDFs.',
  currentStage: 'idea',
  knownCompetitors: 'Edvision, Scholars4Dev, Facebook scholarship groups',
  budgetConstraints: 'Bootstrapped student team; under $500 initial budget, 6-week MVP target',
  roadmapWeeks: 6,
};

export const DEMO_MENTOR_QUESTIONS: string[] = [
  'What is the biggest assumption I should validate first?',
  'How can I acquire my first 100 users?',
  'What should I remove from the MVP?',
  'What is the strongest differentiation from existing scholarship portals?',
];

export const SAMPLE_REPORT_DOC: AnalysisDocument = {
  id: 'sample-scholarbridge-preview',
  userId: 'sample',
  ideaName: 'ScholarBridge PK',
  ideaDescription: DEMO_IDEA_INPUT.ideaDescription,
  industry: 'EdTech',
  targetMarket: 'Pakistan (initial launch) + Global study destinations',
  targetAudience: DEMO_IDEA_INPUT.targetAudience || '',
  problemStatement: DEMO_IDEA_INPUT.problemStatement || '',
  currentStage: 'idea',
  knownCompetitors: DEMO_IDEA_INPUT.knownCompetitors || '',
  budgetConstraints: DEMO_IDEA_INPUT.budgetConstraints || '',
  roadmapWeeks: 6,
  promptVersion: 'sample-preview',
  modelName: 'Sample Reference Preview',
  researchMode: 'ai_only',
  chatHistory: [],
  createdAt: '2026-11-17T10:00:00.000Z',
  updatedAt: '2026-11-17T10:00:00.000Z',
  reportJson: {
    analysisId: 'sample-scholarbridge-preview',
    ideaName: 'ScholarBridge PK',
    generatedAt: '2026-11-17T10:00:00.000Z',
    overallScore: 71,
    verdict: 'Needs Validation',
    executiveSummary:
      'ScholarBridge PK addresses a genuine discovery and eligibility-filtering pain point for Pakistani university students. The problem is concrete and testable on campuses at near-zero cost, while long-term defensibility depends on maintaining accurate scholarship deadlines and proving a sustainable revenue model without gating core student access behind high upfront paywalls.',
    topStrengths: [
      'Concrete, recurring student pain point around fragmented eligibility criteria and missed deadlines.',
      'Strong campus distribution potential through university societies and WhatsApp/peer referrals.',
      'Simple initial matching workflow can be prototyped and tested manually before heavy engineering.',
    ],
    topConcerns: [
      'Data freshness risk: stale deadlines or incorrect eligibility rules quickly erode student trust.',
      'Monetization tension: students seeking financial aid are price-sensitive, requiring careful B2B or freemium design.',
      'High competition from free scholarship aggregators and informal peer communities.',
    ],
    assumptions: [
      'Hypothesis: Students will complete a 6–8 field academic profile if it immediately filters out ineligible scholarships.',
      'Assumption: Initial curation focuses on top 40–60 high-demand scholarships (HEC, Fulbright, Chevening, DAAD, Erasmus) rather than thousands.',
      'Needs validation: Education consultancies or test-prep partners will pay for qualified student leads.',
    ],
    validationStatus:
      'Sample Preview Report (Illustrative reference derived from the hackathon demo prompt; run a live analysis to evaluate your own idea with Gemini).',
    scoreBreakdown: [
      {
        category: 'Problem Clarity',
        weight: 20,
        score: 82,
        reason:
          'Eligibility confusion and deadline fragmentation are concrete, observable friction points; severity relative to peer advice needs user interviews.',
      },
      {
        category: 'Customer Clarity',
        weight: 15,
        score: 78,
        reason:
          'Final-year undergraduates and fresh graduates in Pakistan are clearly reachable, though local vs. abroad segments have distinct needs.',
      },
      {
        category: 'Feasibility',
        weight: 20,
        score: 76,
        reason:
          'A structured profile + rule-based eligibility filter can be built quickly within a 6-week lean MVP budget; ongoing data curation is the bottleneck.',
      },
      {
        category: 'Differentiation',
        weight: 15,
        score: 62,
        reason:
          'Personalized eligibility filtering and guided checklists beat static blogs, but portals can copy basic filters unless guidance depth stands out.',
      },
      {
        category: 'Business Potential',
        weight: 20,
        score: 58,
        reason:
          'Direct student subscriptions face willingness-to-pay resistance; B2B university/consultancy partnerships or paid essay review tiers need validation.',
      },
      {
        category: 'Validation Readiness',
        weight: 10,
        score: 80,
        reason:
          'Can be tested within 10 days using a curated spreadsheet/form concierge prototype across two university campuses.',
      },
    ],
    market: {
      targetSegments: [
        'Final-year Pakistani STEM and business undergraduates targeting fully funded Master’s programs abroad.',
        'Need-based local university applicants navigating HEC and provincial merit/need scholarships.',
      ],
      secondarySegments: [
        'Recent graduates working 1–2 years while preparing IELTS/GRE and scholarship dossiers.',
        'University career offices seeking structured funding directories for students.',
      ],
      painPoints: [
        'Reading 10+ pages of requirements only to discover GPA, age, or domicile disqualifications.',
        'Missing staggered document deadlines (transcripts, reference letters, language tests) due to lack of timeline tracking.',
        'Confusion over whether partial scholarships still exceed household budget.',
      ],
      opportunities: [
        'Hypothesis: Hard-filter matching based on CGPA, budget ceiling, and English test status saves hours per application cycle.',
        'Hypothesis: Structured application checklists and deadline reminders drive repeat weekly engagement.',
      ],
      barriers: [
        'Trust skepticism if students suspect scholarship links are sponsored or outdated.',
        'Low conversion on paid tiers if users expect scholarship information to be completely free.',
      ],
      hypotheses: [
        'Hypothesis: Over 60% of interviewed students abandoned at least one application in the past year due to unclear eligibility or missed prep milestones.',
        'Needs validation: A verified "total out-of-pocket cost" indicator increases student trust more than raw scholarship count.',
      ],
      interviewQuestions: [
        'Walk me through the last scholarship you researched or applied for—where did you first hear about it?',
        'How did you check whether you were actually eligible before spending time on the form?',
        'What caused you to drop or postpone an application you considered?',
        'Which tools, spreadsheets, or WhatsApp groups do you currently rely on to track deadlines?',
        'Have you ever paid for SOP review, IELTS prep, or consultancy guidance? Why or why not?',
        'If a tool matched you to 5 scholarships today, what proof would you need to trust the match?',
      ],
      validationExperiments: [
        {
          assumption: 'Students value personalized eligibility filtering over browsing long lists.',
          experiment:
            'Run a 7-day concierge test: collect 30 student profiles via a short form and deliver a tailored 5-scholarship PDF checklist within 24 hours.',
          successSignal:
            'At least 65% of participants open the checklist and report finding at least 1 eligible option they had not tracked.',
        },
        {
          assumption: 'Students will pay a micro-fee for structured application milestone tracking or SOP feedback.',
          experiment:
            'Offer an optional paid review / priority checklist upgrade at the end of the concierge flow to test real conversion intent.',
          successSignal:
            'At least 10% of active concierge users commit to a paid pilot slot or referral invite.',
        },
      ],
    },
    competitors: [
      {
        name: 'Edvision',
        type: 'direct',
        targetAudience: 'Pakistani students exploring local and international degrees',
        offering: 'Directory of scholarships, universities, and career guidance articles.',
        strengths: ['Strong local brand recognition', 'Broad Pakistani degree coverage'],
        weaknesses: ['Static directory browsing rather than personalized hard-filtering', 'Limited step-by-step workflow tracking'],
        differentiation: 'Eligibility-first matching + personalized application timeline checklists.',
        pricingNote: 'User-provided competitor — verify current monetization directly.',
        sourceUrls: [],
        verificationStatus: 'user-provided',
      },
      {
        name: 'Scholars4Dev',
        type: 'direct',
        targetAudience: 'International students from developing countries',
        offering: 'Curated global scholarship listings categorized by country and level.',
        strengths: ['Long-standing global archive', 'High search engine visibility'],
        weaknesses: ['Not tailored to Pakistani CGPA scales or local HEC rules', 'No personal eligibility profile or tracker'],
        differentiation: 'Pakistan-specific GPA/budget normalization and actionable task checklists.',
        pricingNote: 'User-provided competitor — verify ad/portal model directly.',
        sourceUrls: [],
        verificationStatus: 'user-provided',
      },
      {
        name: 'Facebook & WhatsApp Scholarship Groups',
        type: 'alternative',
        targetAudience: 'Peer-driven Pakistani student applicants',
        offering: 'Informal crowd-sourced deadline alerts, peer Q&A, and shared drive folders.',
        strengths: ['Zero cost and fast peer answers', 'High daily social engagement'],
        weaknesses: ['Noisy feeds, unverified rumors, and buried deadlines', 'Zero personalization'],
        differentiation: 'Verified single source of truth with structured eligibility filters.',
        pricingNote: 'User-provided alternative — free community channels.',
        sourceUrls: [],
        verificationStatus: 'user-provided',
      },
      {
        name: 'AI Candidate: Study Abroad Aggregators (e.g., MastersPortal / ScholarshipPortal)',
        type: 'candidate',
        targetAudience: 'Global prospective Master’s and PhD applicants',
        offering: 'Searchable database of international programs and tuition/scholarship filters.',
        strengths: ['Large international program catalog'],
        weaknesses: ['Less focused on fully funded local/regional Pakistani grants'],
        differentiation: 'Focused depth on verified high-fit funding rather than breadth.',
        pricingNote: 'Unverified AI candidate — verify coverage and pricing directly.',
        sourceUrls: [],
        verificationStatus: 'unverified',
      },
    ],
    differentiationOpportunities: [
      'Hard-filter eligibility engine calibrated to Pakistani CGPA/percentage grading and local domicile quotas.',
      'Transparent "True Cost Gap" indicator showing whether flights, visa fees, or living stipends are covered.',
      'Backward-planned application checklist starting 12 weeks before each scholarship deadline.',
    ],
    competitiveRisks: [
      'Incumbent portals can add basic dropdown filters quickly if traction becomes visible.',
      'Free student WhatsApp communities remain hard to displace unless checklists save clear hours.',
    ],
    businessModels: [
      {
        name: 'Freemium Discovery + Paid Application Toolkit',
        description:
          'Keep scholarship matching free for all students; charge a modest one-time seasonal pass for deadline reminders, document checklists, and structured SOP templates.',
        pros: ['Preserves viral student growth', 'Aligns revenue with committed applicants'],
        cons: ['Lower ARPU in student markets', 'Requires clear value gap between free and paid tiers'],
        implementationComplexity: 'low',
        riskLevel: 'medium',
        pricingHypothesis: 'Hypothesis: PKR 1,000–2,000 seasonal application pass (needs willingness-to-pay validation).',
        revenueStreams: ['Seasonal applicant toolkit passes', 'Optional structured essay review add-on'],
        costDrivers: ['Scholarship verification & curation labor', 'SMS/email notification delivery'],
        fitScore: 76,
      },
      {
        name: 'Verified Partner Lead & Prep Marketplace',
        description:
          'Free for students; vetted IELTS prep providers, test centers, or ethical admissions mentors pay per qualified student inquiry.',
        pros: ['Removes paywall friction for financially constrained students', 'Higher B2B ticket sizes'],
        cons: ['Risk of perceived bias if partner placements crowd organic matches', 'Requires partner vetting'],
        implementationComplexity: 'medium',
        riskLevel: 'medium',
        pricingHypothesis: 'Hypothesis: Opt-in partner referral fee or monthly featured mentor listing.',
        revenueStreams: ['Verified test-prep referrals', 'University/bootcamp partner sponsorships'],
        costDrivers: ['Partner onboarding & quality auditing', 'Compliance and student trust protection'],
        fitScore: 72,
      },
      {
        name: 'University & Career-Center SaaS License',
        description:
          'License a branded scholarship tracking portal to Pakistani universities and student counseling offices.',
        pros: ['Predictable annual contract revenue', 'Built-in campus distribution'],
        cons: ['Long university procurement cycles', 'Not viable for fast 6-week initial traction'],
        implementationComplexity: 'high',
        riskLevel: 'high',
        pricingHypothesis: 'Hypothesis: Annual institutional license per campus (later-stage expansion).',
        revenueStreams: ['Annual campus subscriptions'],
        costDrivers: ['Institutional sales & onboarding support'],
        fitScore: 54,
      },
    ],
    recommendedBusinessModel: 'Freemium Discovery + Paid Application Toolkit',
    recommendedBusinessModelReason:
      'Best fits a bootstrapped 6-week launch: free matching removes adoption friction, while a low-cost seasonal checklist/review pass can be tested directly with active applicants without lengthy B2B sales cycles.',
    swot: {
      strengths: [
        'Clear problem-solution fit for eligibility filtering and deadline planning.',
        'Low initial technical complexity using structured rules before needing complex AI.',
        'Natural campus word-of-mouth loop among peer applicants.',
      ],
      weaknesses: [
        'High ongoing curation burden to keep deadlines and eligibility rules accurate.',
        'Price-sensitive primary user base limits aggressive subscription pricing.',
      ],
      opportunities: [
        'Underserved local + international hybrid filtering tailored to Pakistani grading systems.',
        'Partnering with university student societies for zero-CAC cohort launches.',
      ],
      threats: [
        'Inaccurate deadline data causing student rejections and rapid reputational loss.',
        'Established portals or AI chat tools copying basic Q&A matching.',
      ],
    },
    mvp: {
      recommendedScope:
        'Launch a lean, verified 50-scholarship database with a 6-field student profile matcher and a single-scholarship checklist view—avoid building a full community forum or AI essay writer in v1.',
      coreUserJourney: [
        'Student selects current degree level, CGPA/percentage, field, target countries, and budget tier.',
        'Platform filters out ineligible scholarships and displays ranked matches with clear "Why you qualify" tags.',
        'Student opens a match to view official criteria summary, uncovered cost flags, and source checklist.',
        'Student saves up to 5 target scholarships and checks off weekly preparation milestones.',
      ],
      mustHave: [
        {
          feature: 'Structured 6-Field Eligibility Matcher',
          reason: 'Directly solves the primary pain point of wasting time on ineligible programs.',
        },
        {
          feature: 'Verified Criteria & Deadline Card with "Last Checked" Date',
          reason: 'Builds immediate trust and differentiates from stale blog posts.',
        },
        {
          feature: 'Save & Application Milestone Checklist',
          reason: 'Creates repeat engagement and supports the core guidance promise.',
        },
      ],
      shouldHave: [
        {
          feature: 'Email / Deadline Reminder Alerts (14 days & 3 days prior)',
          reason: 'Prevents missed deadlines without requiring complex mobile apps.',
        },
        {
          feature: 'Uncovered Cost Estimator Tag (Tuition Only vs. Full Stipend)',
          reason: 'Critical for budget-constrained families comparing offers.',
        },
      ],
      couldHave: [
        {
          feature: 'Peer-Reviewed Sample Checklist Templates',
          reason: 'Adds guidance value once core matching retention is proven.',
        },
      ],
      outOfScope: [
        'Automated scholarship form auto-fill or submission bots.',
        'Open student social network / comment forums (high moderation cost).',
        'AI-generated full SOP essays (risks generic rejections and integrity issues).',
      ],
      successMetrics: [
        'Profile completion rate >= 70% among landing-page visitors.',
        'At least 40% of matched users save >= 2 scholarships to their checklist.',
        'Zero dead or expired scholarship listings reported in the first 30 days.',
      ],
    },
    roadmap: [
      {
        phase: 'Phase 1: Problem & Curation Validation',
        duration: 'Weeks 1–2',
        tasks: [
          {
            title: 'Conduct 15 Student Discovery Interviews',
            description: 'Interview final-year students across 2–3 universities on recent scholarship friction.',
            priority: 'high',
            durationEstimate: '5 days',
            deliverable: 'Interview synthesis & top 5 disqualification blockers',
          },
          {
            title: 'Curate & Verify Initial 50 Scholarships',
            description: 'Structure GPA, funding scope, field, and deadline metadata in a clean JSON/DB schema.',
            priority: 'high',
            durationEstimate: '5 days',
            deliverable: 'Verified 50-record scholarship dataset with audit dates',
            dependency: 'Interview synthesis',
          },
        ],
      },
      {
        phase: 'Phase 2: Core Matcher & Checklist MVP',
        duration: 'Weeks 3–4',
        tasks: [
          {
            title: 'Build Profile Intake & Deterministic Eligibility Filter',
            description: 'Implement 6-field intake form and transparent match/mismatch explanations.',
            priority: 'high',
            durationEstimate: '6 days',
            deliverable: 'Working web matcher prototype',
          },
          {
            title: 'Build Saved List & Milestone Checklist View',
            description: 'Allow students to save matches and track transcripts, references, and test dates.',
            priority: 'medium',
            durationEstimate: '5 days',
            deliverable: 'Interactive checklist & deadline view',
          },
        ],
      },
      {
        phase: 'Phase 3: Campus Pilot & Iteration',
        duration: 'Weeks 5–6',
        tasks: [
          {
            title: 'Run 100-Student Closed Campus Pilot',
            description: 'Distribute via 3 university societies and measure profile-to-save conversion.',
            priority: 'high',
            durationEstimate: '7 days',
            deliverable: 'Pilot funnel metrics & bug/data corrections',
          },
          {
            title: 'Test Paid Toolkit / Partner Pilot Intent',
            description: 'Evaluate optional paid checklist/review tier or partner interest with active users.',
            priority: 'medium',
            durationEstimate: '5 days',
            deliverable: 'Monetization validation memo',
          },
        ],
      },
    ],
    risks: [
      {
        risk: 'Outdated scholarship deadlines or changed eligibility rules mislead applicants.',
        category: 'Operational',
        severity: 'high',
        likelihood: 'medium',
        mitigation: 'Display "Last Verified" dates on every listing and restrict v1 to 50 high-priority programs audited bi-weekly.',
        earlyWarning: 'More than 2% of listings flagged by users for date/rule discrepancies.',
      },
      {
        risk: 'Students use free matching once and never return or convert to paid tools.',
        category: 'Market',
        severity: 'high',
        likelihood: 'high',
        mitigation: 'Anchor repeat value in backward deadline reminders and test B2B/partner sponsorship early.',
        earlyWarning: 'Week-2 retention below 15% and <3% interest in paid review add-ons.',
      },
      {
        risk: 'Inconsistent Pakistani university grading conversions (CGPA vs. percentage) cause false negatives.',
        category: 'Product',
        severity: 'medium',
        likelihood: 'high',
        mitigation: 'Show "Borderline / Verify" matches alongside exact matches so eligible students are never hidden.',
        earlyWarning: 'Students reporting valid scholarships missing from their results.',
      },
      {
        risk: 'Handling student academic transcripts or personal contact records insecurely.',
        category: 'Data & Privacy',
        severity: 'medium',
        likelihood: 'low',
        mitigation: 'Collect only minimal non-sensitive profile attributes in MVP; avoid storing uploaded transcripts until needed.',
        earlyWarning: 'Any unencrypted PII storage or unclear privacy consent.',
      },
      {
        risk: 'Incumbent scholarship portals copy basic eligibility filters.',
        category: 'Competition',
        severity: 'medium',
        likelihood: 'medium',
        mitigation: 'Differentiate through local campus trust, transparent cost-gap tags, and guided milestone workflows.',
        earlyWarning: 'Top local portals launching personalized filter tools.',
      },
    ],
    nextActions: [
      'Interview 10–15 Pakistani undergraduates this week to validate which eligibility filters actually save them hours.',
      'Assemble a verified spreadsheet of 50 active scholarships and run a manual concierge match for 20 students before writing full backend automation.',
      'Test willingness-to-pay for a guided application checklist vs. partner-sponsored prep referrals during the pilot.',
    ],
    pitchDeckOutline: [
      {
        slideNumber: 1,
        title: 'Problem: Fragmented Scholarship Discovery',
        keyPoints: [
          'Students spend hours reading scattered PDFs only to hit hidden eligibility disqualifications.',
          'Deadlines for transcripts, IELTS, and references are missed without backward planning.',
        ],
        speakerNote: 'Open with a real student story showing wasted effort on an ineligible scholarship.',
      },
      {
        slideNumber: 2,
        title: 'Solution: ScholarBridge PK',
        keyPoints: [
          '6-field academic & budget profile matched against verified funding rules.',
          'Transparent cost-gap flags and weekly preparation checklists.',
        ],
        speakerNote: 'Emphasize clarity and time saved rather than claiming guaranteed admissions.',
      },
      {
        slideNumber: 3,
        title: 'Target Users & Initial Wedge',
        keyPoints: [
          'Primary wedge: Pakistani final-year STEM/business students seeking funded graduate degrees.',
          'Secondary: Local HEC and provincial need/merit scholarship applicants.',
        ],
        speakerNote: 'Keep the wedge focused on two reachable campus personas.',
      },
      {
        slideNumber: 4,
        title: 'Competitive Landscape & Edge',
        keyPoints: [
          'Directories (Edvision, Scholars4Dev) list everything but lack personal hard-filtering.',
          'WhatsApp/Facebook groups are fast but noisy and unverified.',
        ],
        speakerNote: 'Position as the verified, personalized workflow layer.',
      },
      {
        slideNumber: 5,
        title: 'Business Model Hypotheses',
        keyPoints: [
          'Free matching for broad student adoption.',
          'Hypothesized revenue: seasonal toolkit pass + vetted prep partner referrals.',
        ],
        speakerNote: 'Be transparent that pricing is currently an early hypothesis undergoing pilot tests.',
      },
      {
        slideNumber: 6,
        title: 'Go-To-Market: Campus Society Pilots',
        keyPoints: [
          'Partner with university career clubs and graduating batch ambassadors.',
          'Shareable "Eligibility Snapshot" cards drive organic peer referrals.',
        ],
        speakerNote: 'Highlight low-CAC campus distribution.',
      },
      {
        slideNumber: 7,
        title: '6-Week Execution Roadmap',
        keyPoints: [
          'Weeks 1–2: 15 interviews + 50 verified scholarships.',
          'Weeks 3–6: Matcher MVP + 100-student pilot.',
        ],
        speakerNote: 'Show discipline: curation and validation precede heavy scaling.',
      },
      {
        slideNumber: 8,
        title: 'Key Risks & Next Milestones',
        keyPoints: [
          'Mitigating data staleness via bi-weekly verification dates.',
          'Next goal: 70% profile completion and >= 40% checklist save rate in pilot.',
        ],
        speakerNote: 'Close with measurable 30-day validation targets.',
      },
    ],
  },
};
