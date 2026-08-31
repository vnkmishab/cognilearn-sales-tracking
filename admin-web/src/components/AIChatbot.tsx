'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchSites, 
  fetchAllSites, 
  fetchEmployees, 
  fetchExpenses, 
  fetchAttendance, 
  fetchMyStatus,
  fetchEmployeeSites,
  updateEmployeeSites,
  createEmployee,
  createSite
} from '@/lib/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export default function AIChatbot({ role }: { role: 'ADMIN' | 'EMPLOYEE' }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggestions based on role
  const suggestions = role === 'ADMIN' ? [
    'Who is checked in today?',
    'Any pending expenses?',
    'What sites are active?',
    'How do I assign sites?'
  ] : [
    'Show my hours this week',
    'Where is my assigned site?',
    'Check my punch status',
    'How to submit an expense'
  ];

  // Initialize greeting
  useEffect(() => {
    const greeting = role === 'ADMIN' 
      ? 'Hello! I am your FieldOps Assistant. I can help you check active sites, list checked-in employees, count pending bills, or guide you with site assignments. What can I do for you today?'
      : 'Hello! I am your FieldOps Assistant. I can check your weekly hours, verify your site punch status, or help you submit expenses. What can I do for you today?';
    
    setMessages([{ sender: 'ai', text: greeting }]);
  }, [role]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput('');
    setIsTyping(true);

    // 2. Resolve response logic
    let reply = '';
    const query = text.toLowerCase();

    try {
      // 1. Semantic command routing for Admin and Employee active database tasks
      if (role === 'ADMIN' && (query.includes('assign') || query.includes('give') || query.includes('add site to') || query.includes('map site to'))) {
        const allSites = await fetchAllSites();
        const allEmployees = await fetchEmployees();
        
        let matchedEmployee = null;
        for (const emp of allEmployees) {
          const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
          const firstName = emp.firstName.toLowerCase();
          const lastName = emp.lastName.toLowerCase();
          const code = emp.employeeCode.toLowerCase();
          if (query.includes(fullName) || query.includes(firstName) || query.includes(lastName) || query.includes(code)) {
            matchedEmployee = emp;
            break;
          }
        }

        let matchedSite = null;
        for (const site of allSites) {
          const name = site.name.toLowerCase();
          const code = site.siteCode.toLowerCase();
          const proj = site.projectId.toLowerCase();
          if (query.includes(name) || query.includes(code) || query.includes(proj)) {
            matchedSite = site;
            break;
          }
        }

        if (matchedEmployee && matchedSite) {
          const currentSites = await fetchEmployeeSites(matchedEmployee.id);
          const currentSiteIds = currentSites.map((s: any) => s.id);
          
          if (currentSiteIds.includes(matchedSite.id)) {
            reply = `Site **${matchedSite.name}** is already assigned to **${matchedEmployee.firstName} ${matchedEmployee.lastName}** (${matchedEmployee.employeeCode}).`;
          } else {
            await updateEmployeeSites(matchedEmployee.id, [...currentSiteIds, matchedSite.id]);
            reply = `I have successfully assigned **${matchedSite.name}** (${matchedSite.siteCode}) to **${matchedEmployee.firstName} ${matchedEmployee.lastName}** (${matchedEmployee.employeeCode})!`;
            router.refresh();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('refresh-employee-sites'));
              window.dispatchEvent(new CustomEvent('select-employee-from-chat', {
                detail: { employeeId: matchedEmployee.id }
              }));
            }
          }
        } else if (matchedEmployee) {
          reply = `I found employee **${matchedEmployee.firstName} ${matchedEmployee.lastName}** (${matchedEmployee.employeeCode}), but I couldn't identify the site you want to assign from your query: "${text}". Please specify the site name or code (e.g., 'assign Brooklyn Navy to ${matchedEmployee.firstName}').`;
        } else if (matchedSite) {
          reply = `I found site **${matchedSite.name}** (${matchedSite.siteCode}), but I couldn't identify the employee you want to assign it to from your query: "${text}". Please specify the employee's name (e.g., 'assign ${matchedSite.name} to Bob').`;
        } else {
          reply = 'To assign sites to an employee:\n1. Open the Admin Dashboard homepage.\n2. Scroll down to the **Employees** list card.\n3. Click the **Assign Sites** action button next to the target employee.\n4. Check the desired construction sites and click **Save** to update their assignments.';
        }
      }
      else if (role === 'ADMIN' && (query.includes('create employee') || query.includes('add employee') || query.includes('new employee'))) {
        const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        const email = emailMatch ? emailMatch[1] : '';
        
        let namePart = text.replace(/create employee|add employee|new employee|with email|email/gi, '').replace(email || '', '').trim();
        namePart = namePart.replace(/\b(to|for|called|name|named)\b/gi, '').trim();
        
        const nameParts = namePart.split(/\s+/);
        const firstName = nameParts[0] || 'New';
        const lastName = nameParts.slice(1).join(' ') || 'Employee';

        if (!email) {
          reply = `To create an employee, please provide their email address (e.g., 'create employee Alice Green with email alice@fieldops.com').`;
        } else {
          const newEmp = await createEmployee({ firstName, lastName, email });
          reply = `I have successfully created employee **${firstName} ${lastName}** with email **${email}** (Code: ${newEmp.employeeCode})!`;
          router.refresh();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('refresh-employees-list'));
          }
        }
      }
      else if (role === 'ADMIN' && (query.includes('create site') || query.includes('add site') || query.includes('new site'))) {
        const codeMatch = text.match(/\b([A-Z0-9-]+-[0-9]+|[A-Z]{3,}-[A-Z0-9]+)\b/i) || text.match(/code\s+([A-Za-z0-9-]+)/i);
        const siteCode = codeMatch ? codeMatch[1].toUpperCase() : `SIT-${Math.floor(100 + Math.random() * 900)}`;

        let namePart = text.replace(/create site|add site|new site|with code|code/gi, '').replace(siteCode, '').trim();
        namePart = namePart.replace(/\b(called|named)\b/gi, '').trim();
        const name = namePart || 'New Construction Site';
        
        const latitude = 11.24 + (Math.random() - 0.5) * 0.05;
        const longitude = 75.83 + (Math.random() - 0.5) * 0.05;

        const newSite = await createSite({
          name,
          siteCode,
          projectId: `PROJ-${Math.floor(100 + Math.random() * 900)}`,
          latitude,
          longitude,
          radius: 100
        });
        reply = `I have successfully created construction site **${newSite.name}** with site code **${newSite.siteCode}**!`;
        router.refresh();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refresh-sites-list'));
        }
      }
      else if (role === 'EMPLOYEE' && (query.includes('check in') || query.includes('punch in') || query.includes('check out') || query.includes('punch out'))) {
        const result = await toggleMyPunch();
        reply = `I have successfully submitted your shift punch! Your check-in status is now: **${result.isCheckedIn ? 'Checked In' : 'Checked Out'}**.`;
        router.refresh();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refresh-punch-status'));
        }
      }
      else {
        // Check if user is referencing a specific site by code, name, or project first
        let matchedSite = null;
        if (query.length > 2) {
          const allSites = await fetchAllSites();
          matchedSite = allSites.find((s: any) => {
            const name = s.name.toLowerCase();
            const code = s.siteCode.toLowerCase();
            const proj = s.projectId.toLowerCase();
            
            return name.includes(query) || query.includes(name) || 
                   code.includes(query) || query.includes(code) ||
                   proj.includes(query) || query.includes(proj);
          });
        }

        if (matchedSite) {
          if (role === 'EMPLOYEE') {
            const mySites = await fetchSites();
            const isAssigned = mySites.some((s: any) => s.id === matchedSite.id);
            
            if (isAssigned) {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('select-site-from-chat', { 
                  detail: { siteId: matchedSite.id } 
                }));
              }
              reply = `I have selected **${matchedSite.name}** in your Site Punch form on the dashboard homepage. You can now click **Punch In** or **Punch Out** to submit your punch.`;
            } else {
              reply = `I found **${matchedSite.name}** (${matchedSite.siteCode}) in the system, but it is not currently assigned to you. You can only select from your assigned sites: ${mySites.map((s: any) => s.name).join(', ')}.`;
            }
          } else {
            reply = `I found site **${matchedSite.name}**:\n- Code: ${matchedSite.siteCode}\n- Project ID: ${matchedSite.projectId}\n- Coordinates: ${matchedSite.latitude}, ${matchedSite.longitude}`;
          }
        }
        else if (role === 'ADMIN') {
          if (query.includes('checked in') || query.includes('present') || query.includes('attendance') || query.includes('who is')) {
            const [attendance, employees] = await Promise.all([fetchAttendance(), fetchEmployees()]);
            const activeEvents = attendance.filter((e: any) => !e.checkOut);
            
            if (activeEvents.length === 0) {
              reply = 'No employees are currently checked in today.';
            } else {
              const names = activeEvents.map((evt: any) => {
                const emp = employees.find((e: any) => e.id === evt.employeeId);
                return emp ? `${emp.firstName} ${emp.lastName} (${emp.employeeCode})` : 'Unknown Employee';
              });
              reply = `There are currently **${activeEvents.length}** employees checked in today:\n- ${names.join('\n- ')}`;
            }
          } 
          else if (query.includes('pending') || query.includes('expense') || query.includes('bill') || query.includes('review')) {
            const expenses = await fetchExpenses();
            const pending = expenses.filter((e: any) => e.approvalStatus === 'PENDING' || e.approvalStatus === 'PENDING_APPROVAL');
            if (pending.length === 0) {
              reply = 'All expense claims have been processed. There are no pending claims!';
            } else {
              reply = `There are currently **${pending.length}** pending expenses awaiting review and approval.`;
            }
          }
          else if (query.includes('site') || query.includes('project') || query.includes('active site')) {
            const sites = await fetchAllSites();
            const siteList = sites.map((s: any) => `${s.name} (${s.siteCode})`);
            reply = `There are **${sites.length}** total sites configured in the system:\n- ${siteList.join('\n- ')}`;
          }
        } 
        else {
          // EMPLOYEE Role queries
          if (query.includes('hours') || query.includes('work') || query.includes('week')) {
            const status = await fetchMyStatus();
            reply = `You have logged **${status.hoursThisWeek} hours** of work during the past 7 days.`;
          }
          else if (query.includes('where') || query.includes('assigned') || query.includes('my site')) {
            const sites = await fetchSites();
            if (sites.length === 0) {
              reply = 'You are not currently assigned to any construction sites. Please contact the admin.';
            } else {
              const list = sites.map((s: any) => `${s.name} (${s.siteCode})`);
              reply = `You are currently assigned to the following sites:\n- ${list.join('\n- ')}`;
            }
          }
          else if (query.includes('punch') || query.includes('status') || query.includes('check')) {
            const status = await fetchMyStatus();
            const sites = await fetchSites();
            const activeSite = status.activeSiteId ? sites.find((s: any) => s.id === status.activeSiteId) : null;
            
            if (status.isSiteCheckedIn) {
              reply = `You are currently **Punched In** at **${activeSite ? activeSite.name : 'your construction site'}**. Remember to click **Punch Out** when your shift ends.`;
            } else {
              reply = 'You are currently **Punched Out** from all sites.';
            }
          }
          else if (query.includes('expense') || query.includes('submit') || query.includes('bill') || query.includes('upload')) {
            reply = 'To submit a new expense claim:\n1. Click the **Submit Expense** Quick Action on your dashboard homepage.\n2. Select the construction site, choose the expense category, and input the bill amount.\n3. Upload a clean image of your receipt/bill proof.\n4. Click **Submit** to send it for review.';
          }
        }
      }

      // General fallback replies
      if (!reply) {
        if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greetings')) {
          reply = 'Hello! How can I help you today?';
        } else if (query.includes('thank') || query.includes('cool') || query.includes('awesome')) {
          reply = "You're welcome! Let me know if there is anything else I can help you with.";
        } else {
          reply = role === 'ADMIN'
            ? "I'm not sure I understand that query. You can ask me about:\n- 'who is checked in'\n- 'pending expenses'\n- 'active sites'\n- 'how to assign sites'"
            : "I'm not sure I understand that query. You can ask me about:\n- 'my hours this week'\n- 'where is my site'\n- 'check my punch status'\n- 'how to submit an expense'";
        }
      }
    } catch (e) {
      console.error('Chatbot error:', e);
      reply = 'Sorry, I encountered an issue querying the database. Please try again in a few moments.';
    }

    // Simulate thinking latency
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* 1. Floating Toggle Chat Bubble FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-amber-500/30"
          aria-label="Open AI Assistant"
        >
          <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping group-hover:animate-none"></span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-950 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* 2. Chat Widget Window Panel */}
      {isOpen && (
        <div className="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl w-[380px] h-[500px] flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-200 text-left">
          {/* Header */}
          <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-zinc-950">
                AI
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">FieldOps AI Assistant</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] text-zinc-400 font-medium">Online & ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded-lg transition-colors outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-zinc-950 rounded-tr-none font-medium'
                      : 'bg-zinc-800/80 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800/80 border border-zinc-800 text-zinc-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm flex items-center gap-1.5 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-4 py-2 bg-zinc-950/20 border-t border-zinc-850 flex gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-2">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 bg-zinc-800/60 border border-zinc-800 hover:border-amber-500/30 text-zinc-300 hover:text-amber-400 rounded-full transition-all flex-shrink-0 outline-none"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-zinc-950/40 border-t border-zinc-800 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 rounded-xl flex items-center justify-center font-bold transition-colors outline-none shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
