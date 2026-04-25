import { motion } from 'framer-motion';
import { Search, Clock, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Real-life workflow templates with actual images
const workflowTemplates = [
  {
    id: 1,
    title: 'AI Chat for Lead Generation',
    description: 'Automatically capture and qualify leads through AI-powered chat interactions, then route them to your CRM.',
    category: 'Sales',
    apps: ['AI Chatbot', 'CRM', 'Email'],
    uses: '15.8k',
    time: '5 min',
    difficulty: 'Medium',
    image: 'https://botup.com/images/kp/chatbots-for-lead-generation.png',
  },
  {
    id: 2,
    title: 'AI Email Assistant',
    description: 'Automatically categorize, prioritize, and respond to emails using AI, saving hours of inbox management.',
    category: 'Productivity',
    apps: ['Gmail', 'AI Assistant', 'Calendar'],
    uses: '22.4k',
    time: '4 min',
    difficulty: 'Easy',
    image: 'https://zapier.com/api/templates/v1/media/file/de3421b43a7c5615d3d0d4f2c6596c43-Thumbnail_8__1_.webp',
  },
  {
    id: 3,
    title: 'Applicant Tracker',
    description: 'Automatically track job applicants through the hiring process, from application to onboarding.',
    category: 'HR',
    apps: ['Job Boards', 'ATS', 'Slack'],
    uses: '8.9k',
    time: '6 min',
    difficulty: 'Medium',
    image: 'https://zapier.com/api/templates/v1/media/file/74caf2b80343a6e87d38729743956251-Thumbnail_7.webp',
  },
  {
    id: 4,
    title: 'Auto-capture tool & process updates from Slack',
    description: 'Automatically capture tool and process updates from Slack in a centralized changelog for your team.',
    category: 'Productivity',
    apps: ['Slack', 'Notion', 'Changelog'],
    uses: '6.2k',
    time: '3 min',
    difficulty: 'Easy',
    image: 'https://zapier.com/api/templates/v1/media/file/f43569bf21fa6fc820fdb937953344bd-Changelog-1.webp',
  },
  {
    id: 5,
    title: 'Automate offline conversion tracking',
    description: 'Automatically track offline conversions across multiple platforms and sync them with your analytics.',
    category: 'Marketing',
    apps: ['Google Ads', 'Facebook Ads', 'Analytics'],
    uses: '11.7k',
    time: '5 min',
    difficulty: 'Medium',
    image: 'https://zapier.com/api/templates/v1/media/file/23ff21dfea9d048ee050afc484d512d5-conversions_2.0-1.webp',
  },
  {
    id: 6,
    title: 'Automatic call prep',
    description: 'Automatically prepare call notes, customer history, and talking points before important sales calls.',
    category: 'Sales',
    apps: ['CRM', 'Calendar', 'Documents'],
    uses: '9.5k',
    time: '4 min',
    difficulty: 'Easy',
    image: 'https://zapier.com/api/templates/v1/media/file/59162f0401c11000debd07c11f51f004-Sales_Prep_Guide-1.webp',
  },
  {
    id: 7,
    title: 'Brand mention and sentiment tracker',
    description: 'Get insight into when and how your brand is mentioned across social media and news platforms.',
    category: 'Marketing',
    apps: ['Twitter', 'Reddit', 'News APIs'],
    uses: '13.1k',
    time: '6 min',
    difficulty: 'Medium',
    image: 'https://zapier.com/api/templates/v1/media/file/6f7ae2578810593b8fa26ceed22398af-0001-8078811053208899000.webp',
  },
  {
    id: 8,
    title: 'Contact List Manager',
    description: 'Automatically sync and manage contact lists across multiple platforms and keep them up-to-date.',
    category: 'CRM',
    apps: ['Google Contacts', 'HubSpot', 'Mailchimp'],
    uses: '7.3k',
    time: '3 min',
    difficulty: 'Easy',
    image: 'https://zapier.com/api/templates/v1/media/file/117c860ee71ad7016e6db6ee4a309f3c-Thumbnail_10__4_.webp',
  },
  {
    id: 9,
    title: 'Create GitHub issues from Slack',
    description: 'Instantly create GitHub issues from Slack messages, keeping development and communication in sync.',
    category: 'Development',
    apps: ['Slack', 'GitHub', 'Jira'],
    uses: '18.6k',
    time: '2 min',
    difficulty: 'Easy',
    image: 'data:image/jpeg;base64,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',
  },
  {
    id: 10,
    title: 'Exec coach: Turn meeting insights into exec growth feedback',
    description: 'Automatically analyze meeting recordings and turn insights into actionable executive growth feedback.',
    category: 'Productivity',
    apps: ['Zoom', 'AI Transcription', 'Coaching Platform'],
    uses: '4.8k',
    time: '7 min',
    difficulty: 'Advanced',
    image: 'https://zapier.com/api/templates/v1/media/file/fa4ff1f8a18a2e76d1209c4058ee88a6-0001-3184524040711980500.webp',
  },
  {
    id: 11,
    title: 'Increase sales leads from support tickets',
    description: 'Automatically identify potential sales opportunities from support tickets and route them to sales.',
    category: 'Sales',
    apps: ['Support Desk', 'CRM', 'Slack'],
    uses: '12.9k',
    time: '5 min',
    difficulty: 'Medium',
    image: 'https://zapier.com/api/templates/v1/media/file/62e8b5f59857790881a88ca5d60b715d-Potential_Deal_Flag_Zap.webp',
  },
  {
    id: 12,
    title: 'Add new leads to Google Sheets',
    description: 'When a new lead comes in from Facebook Lead Ads, automatically add them to a Google Sheets spreadsheet.',
    category: 'Sales',
    apps: ['Facebook Lead Ads', 'Google Sheets'],
    uses: '12.3k',
    time: '2 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
  },
  {
    id: 13,
    title: 'Create Trello cards from new emails',
    description: 'When you receive an email in Gmail with a specific label, automatically create a Trello card.',
    category: 'Productivity',
    apps: ['Gmail', 'Trello'],
    uses: '8.7k',
    time: '3 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop',
  },
  {
    id: 14,
    title: 'Send Slack notifications for new form responses',
    description: 'When someone submits a Google Form, send a notification to a Slack channel with the response details.',
    category: 'Communication',
    apps: ['Google Forms', 'Slack'],
    uses: '15.2k',
    time: '2 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop',
  },
  {
    id: 15,
    title: 'Save Gmail attachments to Google Drive',
    description: 'Automatically save email attachments from Gmail to a specific Google Drive folder.',
    category: 'Productivity',
    apps: ['Gmail', 'Google Drive'],
    uses: '9.4k',
    time: '2 min',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=250&fit=crop',
  },
];

const categories = ['All', 'Sales', 'Productivity', 'Marketing', 'Communication', 'Finance', 'HR', 'Development', 'CRM', 'E-commerce', 'Data Management'];

export const Templates = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template) => {
    navigate('/workflows/builder');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workflow Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose from thousands of pre-built workflows to automate your work
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            />
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${selectedCategory === category
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-[#2a2a2a] hover:border-orange-300 dark:hover:border-orange-700'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, idx) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleUseTemplate(template)}
              className="group cursor-pointer bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-700 transition-all"
            >
              {/* Real Template Image */}
              <div className="h-48 bg-gray-100 dark:bg-[#222222] relative overflow-hidden">
                <img
                  src={template.image}
                  alt={template.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.className = 'h-48 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10 relative overflow-hidden flex items-center justify-center';
                    e.target.parentElement.innerHTML = `<div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></div>`;
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 rounded shadow-sm">
                    {template.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition line-clamp-2 mb-2">
                  {template.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>

                {/* Apps */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {template.apps.map((app, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-[#222222] text-gray-700 dark:text-gray-300 text-xs font-medium rounded"
                    >
                      {app}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-[#2a2a2a]">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{template.uses} uses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{template.time} setup</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No templates found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
