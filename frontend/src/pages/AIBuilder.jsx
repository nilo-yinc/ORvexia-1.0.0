import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, Loader2, Zap } from 'lucide-react';

export const AIBuilder = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput('');

    setTimeout(() => {
      const aiMsg = {
        role: 'assistant',
        content: `I'll help you build that workflow. Based on your description: "${input}", I've created a workflow with the following steps:\n\n1. Trigger: Monitor for the specified event\n2. Process: Extract and transform data\n3. Action: Execute the desired outcome\n\nYou can now view and edit this workflow in the builder.`
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 2000);
  };

  const suggestions = [
    'Send Slack notification when new email arrives',
    'Create Airtable record from form submission',
    'Update Salesforce when deal closes',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Workflow Builder
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Describe your workflow in plain English and let AI create it for you
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/30 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-orange-600 dark:text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to build
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  Tell me what workflow you want to create, and I'll help you build it.
                </p>
                <div className="space-y-2 w-full max-w-md">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Try these examples:
                  </p>
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-left px-4 py-3 border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222222] rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-orange-500 hover:bg-white dark:hover:bg-[#1a1a1a] transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-lg ${
                        m.role === 'user'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-50 dark:bg-[#222222] text-gray-900 dark:text-white border border-gray-200 dark:border-[#2a2a2a]'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {m.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3 justify-start"
                  >
                    <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950/30 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-orange-600 dark:text-orange-500 animate-spin" />
                    </div>
                    <div className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-[#222222] border border-gray-200 dark:border-[#2a2a2a]">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222222]">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your workflow..."
                className="flex-1 px-4 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};