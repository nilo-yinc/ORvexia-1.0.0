export const workflows = [
  {
    id: 1,
    name: 'Customer Onboarding',
    description: 'Automated workflow for new customer setup',
    status: 'active',
    executions: 1247,
    successRate: 98.5,
    lastRun: '2 hours ago',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Invoice Processing',
    description: 'Extract and process invoice data automatically',
    status: 'active',
    executions: 3421,
    successRate: 99.2,
    lastRun: '5 minutes ago',
    createdAt: '2024-01-10',
  },
  {
    id: 3,
    name: 'Email Campaign Automation',
    description: 'Send personalized emails based on user behavior',
    status: 'paused',
    executions: 856,
    successRate: 97.8,
    lastRun: '1 day ago',
    createdAt: '2024-02-01',
  },
  {
    id: 4,
    name: 'Data Sync Pipeline',
    description: 'Sync data between CRM and analytics platform',
    status: 'active',
    executions: 5234,
    successRate: 99.7,
    lastRun: '1 hour ago',
    createdAt: '2023-12-20',
  },
  {
    id: 5,
    name: 'Support Ticket Triage',
    description: 'Automatically categorize and route support tickets',
    status: 'error',
    executions: 2341,
    successRate: 95.3,
    lastRun: '3 hours ago',
    createdAt: '2024-01-25',
  },
];

export const templates = [
  {
    id: 1,
    name: 'Lead Qualification',
    description: 'Score and qualify incoming leads automatically',
    category: 'Sales',
    icon: 'Target',
    uses: 1234,
  },
  {
    id: 2,
    name: 'Document Processing',
    description: 'Extract data from PDFs and documents',
    category: 'Operations',
    icon: 'FileText',
    uses: 856,
  },
  {
    id: 3,
    name: 'Social Media Monitor',
    description: 'Track brand mentions across social platforms',
    category: 'Marketing',
    icon: 'Smartphone',
    uses: 645,
  },
  {
    id: 4,
    name: 'Expense Approval',
    description: 'Automated expense report approval workflow',
    category: 'Finance',
    icon: 'CreditCard',
    uses: 432,
  },
  {
    id: 5,
    name: 'Code Deployment',
    description: 'CI/CD pipeline with automated testing',
    category: 'DevOps',
    icon: 'Rocket',
    uses: 987,
  },
  {
    id: 6,
    name: 'Customer Feedback Analysis',
    description: 'Analyze and categorize customer feedback',
    category: 'Support',
    icon: 'MessageSquare',
    uses: 765,
  },
];

export const executions = [
  {
    id: 1,
    workflowName: 'Customer Onboarding',
    status: 'success',
    duration: '2.3s',
    timestamp: '2024-03-15 14:30:25',
  },
  {
    id: 2,
    workflowName: 'Invoice Processing',
    status: 'success',
    duration: '1.8s',
    timestamp: '2024-03-15 14:28:15',
  },
  {
    id: 3,
    workflowName: 'Data Sync Pipeline',
    status: 'running',
    duration: '5.2s',
    timestamp: '2024-03-15 14:25:10',
  },
  {
    id: 4,
    workflowName: 'Support Ticket Triage',
    status: 'failed',
    duration: '0.9s',
    timestamp: '2024-03-15 14:20:05',
  },
  {
    id: 5,
    workflowName: 'Email Campaign Automation',
    status: 'success',
    duration: '3.1s',
    timestamp: '2024-03-15 14:15:42',
  },
];

export const chartData = {
  executionsOverTime: [
    { date: 'Mon', executions: 245, success: 240, failed: 5 },
    { date: 'Tue', executions: 312, success: 305, failed: 7 },
    { date: 'Wed', executions: 287, success: 280, failed: 7 },
    { date: 'Thu', executions: 358, success: 352, failed: 6 },
    { date: 'Fri', executions: 421, success: 415, failed: 6 },
    { date: 'Sat', executions: 198, success: 195, failed: 3 },
    { date: 'Sun', executions: 156, success: 153, failed: 3 },
  ],
  workflowPerformance: [
    { name: 'Customer Onboarding', value: 1247 },
    { name: 'Invoice Processing', value: 3421 },
    { name: 'Data Sync Pipeline', value: 5234 },
    { name: 'Support Ticket Triage', value: 2341 },
    { name: 'Email Campaign', value: 856 },
  ],
};

export const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CTO, TechCorp',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    content: 'ORvexia transformed how we handle automation. The AI-powered workflow builder is incredibly intuitive.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Operations Director, DataFlow',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    content: 'We saved 40+ hours per week automating our data pipelines. The self-healing capabilities are game-changing.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Product Manager, InnovateLabs',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    content: 'The prompt-to-workflow feature is pure magic. We went from idea to production in minutes, not days.',
    rating: 5,
  },
];

export const features = [
  {
    icon: 'Sparkles',
    title: 'Prompt → Workflow',
    description: 'Describe what you want in plain English, and watch AI generate production-ready workflows instantly.',
  },
  {
    icon: 'MousePointer2',
    title: 'Visual Builder',
    description: 'Drag-and-drop interface with real-time preview. No code required, infinite possibilities.',
  },
  {
    icon: 'Shield',
    title: 'Self-Healing',
    description: 'AI automatically detects and fixes errors in your workflows. Zero downtime, maximum reliability.',
  },
  {
    icon: 'Cpu',
    title: 'Agentic AI',
    description: 'Autonomous agents that adapt and learn from your workflows, making them smarter over time.',
  },
  {
    icon: 'BarChart',
    title: 'Real-time Analytics',
    description: 'Deep insights into workflow performance with beautiful, actionable dashboards.',
  },
  {
    icon: 'Globe',
    title: 'Universal Integrations',
    description: 'Connect to 500+ apps and services. If it has an API, we can integrate it.',
  },
];

export const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for individuals and small teams',
    features: [
      '10 workflows',
      '1,000 executions/month',
      'Basic analytics',
      'Email support',
      'Community templates',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/month',
    description: 'For growing teams and businesses',
    features: [
      'Unlimited workflows',
      '10,000 executions/month',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'Team collaboration',
      'Self-healing AI',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Everything in Professional',
      'Unlimited executions',
      'Dedicated support',
      'Custom SLA',
      'On-premise deployment',
      'Advanced security',
      'Custom AI training',
    ],
    highlighted: false,
  },
];