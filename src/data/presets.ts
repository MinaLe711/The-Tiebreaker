import type { DecisionPreset } from '../types';

export const DECISION_PRESETS: DecisionPreset[] = [
  {
    id: 'startup-vs-corp',
    title: 'Startup vs Corporate',
    category: 'Career',
    decision: 'Should I leave my stable corporate job to join an early-stage AI startup?',
    optionsInput: 'Join the Startup, Stay at Corporate',
    context: 'Want faster career growth, but also value predictable income and sustainable hours',
    analysis: {
      options: ['Join the Startup', 'Stay at Corporate'],
      prosCons: [
        {
          option: 'Join the Startup',
          pros: [
            { text: 'Direct product ownership, rapid skill acquisition, and zero-to-one shipping speed', impact: 'High' },
            { text: 'Meaningful equity upside if the company reaches Series B+ or acquisition', impact: 'Medium' },
            { text: 'Minimal bureaucracy with direct access to founders and customers', impact: 'High' },
          ],
          cons: [
            { text: 'Runway uncertainty and higher probability of intense crunch cycles', impact: 'High' },
            { text: 'Lower base cash compensation and leaner health/retirement benefits', impact: 'High' },
            { text: 'Less structured mentorship or formal promotion ladder', impact: 'Medium' },
          ],
        },
        {
          option: 'Stay at Corporate',
          pros: [
            { text: 'Predictable salary, 401(k) match, and strong financial peace of mind', impact: 'High' },
            { text: 'Clear boundaries on working hours and established team workflows', impact: 'Medium' },
            { text: 'Strong employer brand recognition and cross-functional resources', impact: 'Medium' },
          ],
          cons: [
            { text: 'Slower advancement cycles and limited autonomy over product direction', impact: 'High' },
            { text: 'Risk of technical stagnation inside legacy tooling', impact: 'Medium' },
            { text: 'Consensus-heavy meetings can dilute individual impact', impact: 'Low' },
          ],
        },
      ],
      comparisonTable: {
        headers: ['Criteria', 'Join the Startup', 'Stay at Corporate'],
        rows: [
          ['Financial Predictability', 'Lower cash floor, high equity variance', 'High base salary and reliable bonus'],
          ['Learning Velocity', 'Very high — broad generalist scope', 'Moderate — deep specialist lane'],
          ['Work-Life Balance', 'Variable around product launches', 'Generally stable and predictable'],
          ['2-Year Career Upside', 'Fast title acceleration or founding story', 'Steady savings and incremental promotion'],
        ],
      },
      swot: {
        subject: 'Joining the Startup',
        strengths: [
          'High personal agency from week one',
          'Modern technical stack and short feedback loops',
          'Direct visibility with leadership and investors',
        ],
        weaknesses: [
          'Thinner financial safety net if growth stalls',
          'Undefined onboarding and shifting priorities',
          'Smaller external brand recognition on a resume',
        ],
        opportunities: [
          'Grow into a founding lead role as headcount scales',
          'Build a verifiable portfolio of shipped products',
        ],
        threats: [
          'Tightening venture funding environment affecting runway',
          'Chronic scope creep leading to burnout',
        ],
      },
      priorityScores: [
        {
          option: 'Join the Startup',
          costEfficiency: 5,
          timeFlexibility: 4,
          riskSafety: 3,
          upsideGrowth: 9,
        },
        {
          option: 'Stay at Corporate',
          costEfficiency: 8,
          timeFlexibility: 8,
          riskSafety: 9,
          upsideGrowth: 5,
        },
      ],
      verdict: {
        recommendation: 'Join the Startup',
        decisiveFactor: 'Your financial runway vs. boredom threshold',
        summary:
          'If you hold 6+ months of liquid emergency savings and feel capped in your current role, the startup offers an asymmetric 2-year learning curve. If major upcoming expenses make steady cash flow non-negotiable, stay corporate and negotiate a high-visibility internal stretch project.',
      },
      devilsAdvocate: {
        challengedOption: 'Join the Startup',
        counterThesis:
          'Early-stage startups often mistake motion for progress—90% fail to deliver meaningful equity value, meaning you may trade prime earning years and peace of mind for illiquid paper.',
        blindSpots: [
          'Founder-market fit and actual net burn rate may look healthier in recruiting pitches than in the data room.',
          'You can often capture 70% of the learning upside by building a side project or switching teams inside a big company.',
          'Re-entering top-tier corporate compensation bands after a failed startup can take 12–18 months.',
        ],
        stressTestQuestion:
          'If the equity turns out to be worth $0 in three years, will the experience alone still make this move a clear win for you?',
      },
    },
  },
  {
    id: 'buy-vs-rent',
    title: 'Buy vs Rent a Home',
    category: 'Finance',
    decision: 'Should I buy a home now or keep renting and investing the difference?',
    optionsInput: 'Buy a Home, Keep Renting',
    context: 'Planning to stay in the city for 3 to 5 years while preserving liquidity',
    analysis: {
      options: ['Buy a Home', 'Keep Renting'],
      prosCons: [
        {
          option: 'Buy a Home',
          pros: [
            { text: 'Builds long-term home equity instead of paying non-recoverable rent', impact: 'High' },
            { text: 'Fixed principal-and-interest payments plus full control to renovate', impact: 'Medium' },
            { text: 'Hedges against local rent inflation over a multi-year stay', impact: 'Medium' },
          ],
          cons: [
            { text: 'Locks significant cash into down payment and 3–5% closing costs', impact: 'High' },
            { text: 'High friction and transaction fees if you relocate within 3–4 years', impact: 'High' },
            { text: 'Unpredictable repair bills for roof, plumbing, HVAC, and property tax hikes', impact: 'Medium' },
          ],
        },
        {
          option: 'Keep Renting',
          pros: [
            { text: 'Maximum geographic and career mobility without selling delays', impact: 'High' },
            { text: 'Predictable monthly housing ceiling with maintenance covered by landlord', impact: 'High' },
            { text: 'Down payment capital remains liquid and invested in diversified index assets', impact: 'Medium' },
          ],
          cons: [
            { text: 'Zero forced equity accumulation from monthly payments', impact: 'High' },
            { text: 'Exposure to annual lease renewals or landlord sale decisions', impact: 'Medium' },
            { text: 'Restricted ability to customize layout or finishes', impact: 'Low' },
          ],
        },
      ],
      comparisonTable: {
        headers: ['Factor', 'Buy a Home', 'Keep Renting'],
        rows: [
          ['Upfront Cash Required', 'High (Down payment + closing + reserve)', 'Low (Security deposit + first month)'],
          ['3–4 Year Net Outcome', 'Often trails due to round-trip transaction fees', 'Usually ahead if spread is invested consistently'],
          ['Monthly Cash Flow Variance', 'Medium-High (maintenance & tax adjustments)', 'Fixed for the duration of the lease'],
          ['Lifestyle Flexibility', 'Anchored to one neighborhood', 'Easy to move for career or family changes'],
        ],
      },
      swot: {
        subject: 'Buying on a 3–5 Year Horizon',
        strengths: [
          'Disciplined forced savings through principal paydown',
          'Stability and creative control over your living space',
        ],
        weaknesses: [
          'Concentrates net worth into a single illiquid local asset',
          'High buy-and-sell transaction drag over short holds',
        ],
        opportunities: [
          'Refinance mortgage later if interest rates decline',
          'Convert property into a long-term rental if you move',
        ],
        threats: [
          'Local price dip coinciding with a forced relocation window',
          'Major structural maintenance appearing in year one',
        ],
      },
      priorityScores: [
        {
          option: 'Buy a Home',
          costEfficiency: 5,
          timeFlexibility: 4,
          riskSafety: 6,
          upsideGrowth: 7,
        },
        {
          option: 'Keep Renting',
          costEfficiency: 8,
          timeFlexibility: 9,
          riskSafety: 8,
          upsideGrowth: 7,
        },
      ],
      verdict: {
        recommendation: 'Keep Renting',
        decisiveFactor: 'Holding horizon under 5 years',
        summary:
          'On a 3–5 year horizon, round-trip closing and agent fees typically erase early mortgage equity—especially when renting lets you keep capital compounding in liquid markets. Buy now only if you are confident you will hold the property for 6+ years.',
      },
      devilsAdvocate: {
        challengedOption: 'Keep Renting',
        counterThesis:
          'Most renters never actually invest the monthly difference with discipline, whereas a mortgage forces savings and locks housing costs while rents compound upward every renewal.',
        blindSpots: [
          'Life plans often stretch from 3 years to 7+ years once rooted in a neighborhood.',
          'Renting exposes you to forced moves that carry hidden financial and emotional disruption.',
          'Fixed-rate debt acts as a leveraged inflation hedge you cannot easily replicate in equities.',
        ],
        stressTestQuestion:
          'Have you automated investing your down-payment savings every month, or is that capital sitting idle in low-yield cash?',
      },
    },
  },
  {
    id: 'grad-school-vs-work',
    title: 'Grad School vs Work',
    category: 'Education',
    decision: 'Should I attend graduate school full-time or keep working and pivot on the job?',
    optionsInput: 'Full-Time Grad School, Keep Working',
    context: 'Aiming to transition into a product leadership role without heavy student debt',
    analysis: {
      options: ['Full-Time Grad School', 'Keep Working'],
      prosCons: [
        {
          option: 'Full-Time Grad School',
          pros: [
            { text: 'Structured credential for competitive or regulated career transitions', impact: 'High' },
            { text: 'Concentrated alumni network and campus internship pipelines', impact: 'High' },
            { text: 'Dedicated sabbatical to step back, research, and reset trajectory', impact: 'Medium' },
          ],
          cons: [
            { text: 'Tuition plus two years of forgone salary creates steep opportunity cost', impact: 'High' },
            { text: 'Classroom frameworks can lag behind fast-moving industry workflows', impact: 'Medium' },
            { text: 'Debt load narrows post-graduation job choices', impact: 'High' },
          ],
        },
        {
          option: 'Keep Working',
          pros: [
            { text: 'Zero tuition debt plus continuous salary and retirement compounding', impact: 'High' },
            { text: 'Real-world shipped outcomes often outweigh degrees in product & tech', impact: 'High' },
            { text: 'Option to pursue part-time certificates or employer-sponsored tuition', impact: 'Medium' },
          ],
          cons: [
            { text: 'Harder to bypass automated resume filters for totally new functions', impact: 'Medium' },
            { text: 'Less structured peer cohort outside immediate coworkers', impact: 'Low' },
          ],
        },
      ],
      comparisonTable: {
        headers: ['Dimension', 'Full-Time Grad School', 'Keep Working'],
        rows: [
          ['2-Year Net Financial Cost', 'High (Tuition + lost compensation)', 'Positive (Net earnings saved)'],
          ['Career Pivot Leverage', 'Strong for structured recruiting tracks', 'Strong via internal mobility & portfolio'],
          ['Debt Exposure', 'Moderate to high unless scholarship-funded', 'Zero'],
          ['Time to ROI', '3–5 years post-graduation', 'Immediate'],
        ],
      },
      swot: {
        subject: 'Full-Time Grad School',
        strengths: [
          'Credential credibility with top recruiters',
          'Access to structured internship pipelines',
          'Lifelong alumni peer group',
        ],
        weaknesses: [
          'Substantial tuition and opportunity cost',
          'Two years out of fast-evolving industry cycles',
        ],
        opportunities: [
          'Negotiate merit fellowships or employer sponsorship',
          'Use summer internships to test target roles risk-free',
        ],
        threats: [
          'Graduating into a tight hiring market while servicing debt',
        ],
      },
      priorityScores: [
        {
          option: 'Full-Time Grad School',
          costEfficiency: 3,
          timeFlexibility: 5,
          riskSafety: 5,
          upsideGrowth: 8,
        },
        {
          option: 'Keep Working',
          costEfficiency: 9,
          timeFlexibility: 7,
          riskSafety: 9,
          upsideGrowth: 7,
        },
      ],
      verdict: {
        recommendation: 'Keep Working',
        decisiveFactor: 'Debt avoidance for a non-licensed field',
        summary:
          'Because product leadership rarely requires an advanced degree and avoiding debt is a core constraint, keep working while engineering an internal transfer or hybrid product role. Revisit grad school only if you win substantial scholarship funding.',
      },
      devilsAdvocate: {
        challengedOption: 'Keep Working',
        counterThesis:
          'Trying to pivot on the job often traps high performers in their existing specialty because managers reward what you already do well rather than letting you learn a new craft.',
        blindSpots: [
          'Internal transfers can stall for years under hiring freezes or team reorganizations.',
          'Top graduate cohorts create peer velocity and executive access that evening courses rarely match.',
          'Ten years out, the lifetime network effect often dwarfs the two-year tuition cost.',
        ],
        stressTestQuestion:
          'Have you given yourself a strict 6-month deadline to test an internal pivot—and if it stalls, are you ready to apply?',
      },
    },
  },
];
