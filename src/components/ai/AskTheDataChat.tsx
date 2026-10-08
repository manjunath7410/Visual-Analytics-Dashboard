import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Lightbulb, 
  CheckCircle2, 
  ChevronRight,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { AIChatMessage, StructuredAnalyticsContext } from '../../types/gemini';
import { GeminiClient } from '../../services/gemini/geminiClient';

interface AskTheDataChatProps {
  context: StructuredAnalyticsContext;
  className?: string;
}

export const AskTheDataChat: React.FC<AskTheDataChatProps> = ({
  context,
  className = ''
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Business Analyst assistant. Ask me questions about active revenue, profit, regional performance, category trends, or statistical anomalies.',
      timestamp: 'Just now',
      keyTakeaway: 'Ready to interpret active dashboard calculations.'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedQuestions = [
    'What are the top performing categories by sales and margin?',
    'Which region has the highest gross profit and score?',
    'What changed between the latest and prior periods?',
    'Which products are underperforming and need margin review?',
    'Summarize the current active dashboard in three sentences.'
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuery).trim();
    if (!q || loading) return;

    setError(null);
    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const answer = await GeminiClient.askData(q, context);
      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: answer.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        keyTakeaway: answer.keyTakeaway,
        supportingEvidence: answer.supportingEvidence,
        suggestedFollowUps: answer.suggestedFollowUps
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Ask the Data error:', err);
      setError(err.message || 'Failed to interpret question with Gemini AI.');
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I was unable to retrieve an AI interpretation for this query. Your analytical data calculations remain available above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: 'Chat session reset. Ask any question regarding active filtered metrics.',
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800/90 dark:bg-slate-900/90 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Ask the Data (Natural Language Analytics Assistant)
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Conversational queries answered strictly from current filtered calculations without hallucinated numbers
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors shadow-2xs"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Questions Carousel / Chips */}
      <div className="mt-3">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Suggested queries:
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-800 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-200 transition-colors text-left"
            >
              <span>{q}</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Message History */}
      <div className="mt-4 space-y-3.5 max-h-96 overflow-y-auto pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'border border-slate-200/80 bg-slate-50/70 text-slate-800 dark:border-slate-800 dark:bg-slate-850/60 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                <span>{msg.role === 'user' ? 'You' : 'Gemini Business Analyst'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.content}</p>

              {/* Key Takeaway Callout */}
              {msg.keyTakeaway && (
                <div className="mt-2.5 rounded-lg bg-white/90 p-2 text-[11px] dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 font-medium text-slate-900 dark:text-slate-100">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Key Takeaway: </span>
                  <span>{msg.keyTakeaway}</span>
                </div>
              )}

              {/* Supporting Evidence */}
              {msg.supportingEvidence && msg.supportingEvidence.length > 0 && (
                <div className="mt-2 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-[10px] uppercase text-slate-400">Supporting Evidence:</span>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono">
                    {msg.supportingEvidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Followups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 border-t border-slate-200/60 pt-2 text-[11px] dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Follow-up inquiries:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {msg.suggestedFollowUps.map((fu, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(fu)}
                        className="rounded bg-white px-2 py-0.5 text-[10px] font-medium text-indigo-700 hover:bg-indigo-50 dark:bg-slate-900 dark:text-indigo-300 border border-slate-200 dark:border-slate-700"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white shadow-2xs">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 py-2">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Consulting application metrics with Gemini...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={loading}
          placeholder="Ask a question about your data (e.g. Which region leads in sales?)..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-850 dark:text-white dark:focus:border-indigo-600 disabled:opacity-60"
        />

        <button
          onClick={() => handleSend()}
          disabled={!inputQuery.trim() || loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Ask</span>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-2.5 text-[10px] text-slate-400 dark:text-slate-500">
        * AI-generated interpretations are based on the analytical results shown in this dashboard. Verify important business decisions against the underlying data.
      </div>
    </div>
  );
};
