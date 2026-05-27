import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import ForceGraph3D from 'react-force-graph-3d';
import { Browser } from '@capacitor/browser';

// ===================== FIREBASE IMPORTS =====================
import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBk8p3paqINYy3rDrUo8mma97INd5rKGR8",
  authDomain: "upsctracker-6ad40.firebaseapp.com",
  projectId: "upsctracker-6ad40",
  storageBucket: "upsctracker-6ad40.firebasestorage.app",
  messagingSenderId: "60717300756",
  appId: "1:60717300756:web:9215fcd7614d64e2a97b01",
  measurementId: "G-1PV3G3TWQB"
};

const app = initializeApp(firebaseConfig);

// Initializes DB with Local Offline Caching turned ON
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true 
});
const docRef = doc(db, 'tracker_data', 'my_upsc_data');

// ===================== DATA CONSTANTS =====================
const MONTHLY_ROADMAP = [
  { month: 'May 22-31', phase: '1A', focus: 'Internal Security + Ancient/Medieval History', days: 9, topics: ['Internal Security', 'Ancient/Medieval History'], essays: 1 },
  { month: 'June', phase: '1B', focus: 'History (All) + World History', days: 30, topics: ['Ancient/Medieval History', 'Modern History', 'Post-Independence', 'World History'], essays: 4 },
  { month: 'July', phase: '1C', focus: 'Geography + Culture + Society + Environment', days: 31, topics: ['Geography (World & Indian)', 'Art & Culture', 'Indian Society', 'Env. & Disaster Mgmt'], essays: 6 },
  { month: 'August', phase: '2A', focus: 'Polity (Laxmikant) + Science & Tech', days: 31, topics: ['Polity & Constitution', 'Science & Tech'], essays: 30 },
  { month: 'September', phase: '2B', focus: 'Governance + Economy + Ethics', days: 30, topics: ['Governance & Social Justice', 'Economy & Agriculture', 'Ethics & Integrity'], essays: 45 },
  { month: 'October', phase: '3A', focus: 'PSIR Paper 1 (Political Theory)', days: 31, topics: ['PSIR Paper 1'], essays: 4 },
  { month: 'November', phase: '3B', focus: 'PSIR Paper 2 (IR) + Full Revision', days: 30, topics: ['PSIR Paper 2', 'International Relations'], essays: 4 },
  { month: 'December', phase: '4', focus: 'Full Revision + Mains Mock Tests', days: 31, topics: ['CSAT & Aptitude', 'Essay Writing'], essays: 8 },
];

const DAILY_TIMETABLE = [
  { time: '7:00-9:30 AM', activity: 'Primary Core', hours: 2.5, type: 'study' },
  { time: '10:00-1:00 PM', activity: 'Extended Study', hours: 3, type: 'study' },
  { time: '2:00-4:00 PM', activity: 'Secondary Topic', hours: 2, type: 'study' },
  { time: '4:30-6:00 PM', activity: 'Current Affairs', hours: 1.5, type: 'ca' },
  { time: '6:00-7:00 PM', activity: 'Language/Essay', hours: 1, type: 'essay' },
  { time: '8:00-9:30 PM', activity: 'Answer Writing', hours: 1.5, type: 'answers' },
  { time: '9:30-11:00 PM', activity: 'Revision', hours: 1.5, type: 'revision' },
];

const TARGET_SUBJECTS = [
  { id: 1, name: 'PSIR Paper 1', weight: 250, status: 'untouched', roadmapPhase: '3A', confidence: 0 },
  { id: 2, name: 'PSIR Paper 2', weight: 250, status: 'untouched', roadmapPhase: '3B', confidence: 0 },
  { id: 3, name: 'Ethics & Integrity', weight: 200, status: 'untouched', roadmapPhase: '2B', confidence: 0 },
  { id: 4, name: 'Essay Writing', weight: 150, status: 'untouched', roadmapPhase: '4', confidence: 0 },
  { id: 5, name: 'Polity & Constitution', weight: 130, status: 'untouched', roadmapPhase: '2A', confidence: 0 },
  { id: 6, name: 'Economy & Agriculture', weight: 130, status: 'untouched', roadmapPhase: '2B', confidence: 0 },
  { id: 7, name: 'Geography (World & Indian)', weight: 100, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 8, name: 'CSAT & Aptitude', weight: 100, status: 'untouched', roadmapPhase: '4', confidence: 0 },
  { id: 9, name: 'Indian Society', weight: 90, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 10, name: 'Env. & Disaster Mgmt', weight: 80, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 11, name: 'Governance & Social Justice', weight: 75, status: 'untouched', roadmapPhase: '2B', confidence: 0 },
  { id: 12, name: 'International Relations', weight: 50, status: 'untouched', roadmapPhase: '3B', confidence: 0 },
  { id: 13, name: 'Science & Tech', weight: 50, status: 'untouched', roadmapPhase: '2A', confidence: 0 },
  { id: 14, name: 'Internal Security', weight: 50, status: 'untouched', roadmapPhase: '1A', confidence: 0 },
  { id: 15, name: 'Modern History', weight: 45, status: 'untouched', roadmapPhase: '1B', confidence: 0 },
  { id: 16, name: 'Art & Culture', weight: 40, status: 'untouched', roadmapPhase: '1C', confidence: 0 },
  { id: 17, name: 'Ancient/Medieval History', weight: 30, status: 'untouched', roadmapPhase: '1A', confidence: 0 },
  { id: 18, name: 'World History', weight: 15, status: 'untouched', roadmapPhase: '1B', confidence: 0 },
  { id: 19, name: 'Post-Independence', weight: 5, status: 'untouched', roadmapPhase: '1B', confidence: 0 },
];

const UPSCTrackerUltraPro = () => {
  const [isSyncing, setIsSyncing] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // CORE STATE
  const [subjects, setSubjects] = useState(TARGET_SUBJECTS);
  const [sessions, setSessions] = useState([]);
  const [productivity, setProductivity] = useState([]);
  const [journal, setJournal] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // UI STATE
  const [studyMode, setStudyMode] = useState('deep');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studyNotes, setStudyNotes] = useState('');
  const [prodSlider, setProdSlider] = useState(75);
  const [journalInput, setJournalInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [showManualLog, setShowManualLog] = useState(false);
  const [manualTime, setManualTime] = useState({ h: '', m: '' });
  const [weekOffset, setWeekOffset] = useState(0);
  
  // ===================== UNSTOPPABLE TIMER STATE =====================
  // This reads from the device's hard memory on boot so it survives app closures
  const [timerState, setTimerState] = useState(() => {
    try {
      const saved = localStorage.getItem('upsc_timer_state_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading timer state', e);
    }
    return { running: false, startTime: null, accumulatedTime: 0 };
  });

  const [displayTime, setDisplayTime] = useState({ h: 0, m: 0, s: 0 });
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const openDrishtiIAS = async () => {
    await Browser.open({ url: 'https://www.drishtiias.com/current-affairs-news-analysis-editorials' });
  };

  // ===================== FIREBASE CLOUD SYNC =====================
  // 1. Initial Pull
  useEffect(() => {
    const loadData = async () => {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.subjects) {
             setSubjects(TARGET_SUBJECTS.map(ts => {
               const existing = data.subjects.find(s => s.name === ts.name || s.id === ts.id);
               return existing ? { ...ts, status: existing.status, confidence: existing.confidence || 0 } : ts;
             }));
          }
          if (data.sessions) setSessions(data.sessions);
          if (data.productivity) setProductivity(data.productivity);
          if (data.journal) setJournal(data.journal);
          if (data.goals) setGoals(data.goals);
        }
      } catch (e) {
        console.error("Cloud fetch error:", e);
      } finally {
        setIsSyncing(false);
      }
    };
    loadData();
  }, []);

  // 2. Continuous Auto-Push (Captures every change)
  useEffect(() => {
    if (isSyncing) return;
    const saveData = async () => {
      try {
        await setDoc(docRef, { subjects, sessions, productivity, journal, goals });
      } catch (e) {
        console.error('Cloud save error:', e);
      }
    };
    saveData();
  }, [subjects, sessions, productivity, journal, goals, isSyncing]);

  // ===================== COUNTDOWN TIMER =====================
  useEffect(() => {
    const targetDate = new Date('2027-05-24T00:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff > 0) {
        setCountdown({
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff / (1000 * 60 * 60)) % 24),
          m: Math.floor((diff / 1000 / 60) % 60),
          s: Math.floor((diff / 1000) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ===================== CALCULATIONS =====================
  const today = useMemo(() => new Date(), []);
  
  const { progress, totalWeight, completedWeight, MathRoundWorkingWeight } = useMemo(() => {
    if (!subjects.length) return { progress: 0, totalWeight: 1990, completedWeight: 0, workingWeight: 0, MathRoundWorkingWeight: 0 };
    const totalW = subjects.reduce((sum, s) => sum + s.weight, 0); 
    const compW = subjects.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.weight, 0);
    const workW = subjects.filter(s => s.status === 'working').reduce((sum, s) => sum + s.weight * 0.5, 0); 
    const prog = (totalW > 0) ? Math.round(((compW + workW) / totalW) * 100) : 0;
    return { progress: prog, totalWeight: totalW, completedWeight: compW, MathRoundWorkingWeight: Math.round(workW) };
  }, [subjects]);

  const STRATEGY_DAYS = 365;
  const START_DATE = useMemo(() => new Date('2026-05-24T00:00:00'), []);
  const daysElapsed = Math.max(1, Math.floor((today - START_DATE) / (1000 * 60 * 60 * 24)));
  
  const expectedProgress = Math.min(100, (daysElapsed / STRATEGY_DAYS) * 100);
  const paceStatus = progress >= expectedProgress ? 'NOMINAL' : 'DEFICIT DETECTED';
  const paceColor = progress >= expectedProgress ? 'text-green-400' : 'text-red-400';
  const paceBg = progress >= expectedProgress ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20';

  const streak = useMemo(() => {
    if (sessions.length === 0) return 0;
    let currentStreak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(checkDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      if (sessions.some(s => new Date(s.date).toISOString().split('T')[0] === dateStr)) {
        currentStreak++;
      } else if (i > 0) break;
    }
    return currentStreak;
  }, [sessions]);

  const todayStats = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    const todaySessionsList = sessions.filter(s => new Date(s.date).toISOString().split('T')[0] === todayStr);
    const todayHours = todaySessionsList.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
    const todayProd = productivity.find(p => new Date(p.date).toISOString().split('T')[0] === todayStr);
    return {
      sessions: todaySessionsList.length,
      hours: Math.round(todayHours * 10) / 10,
      productivity: todayProd?.score || 0,
      goals: goals.filter(g => !g.completed).length,
    };
  }, [sessions, productivity, goals, today]);

  const weakAreas = useMemo(() => {
    return subjects
      .filter(s => s.status === 'untouched' || s.status === 'working')
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }, [subjects]);

  const monthlyProgress = useMemo(() => {
    return MONTHLY_ROADMAP.map(month => {
      const completed = subjects
        .filter(s => month.topics.includes(s.name) && s.status === 'completed')
        .reduce((sum, s) => sum + s.weight, 0);
      const totalMonthWeight = subjects
        .filter(s => month.topics.includes(s.name))
        .reduce((sum, s) => sum + s.weight, 0);
      const pct = totalMonthWeight > 0 ? Math.round((completed / totalMonthWeight) * 100) : 0;
      return { ...month, progress: pct };
    });
  }, [subjects]);

  // ===================== UNSTOPPABLE TIMER LOGIC =====================
  // Automatically saves state to device hardware to survive app shutdown
  useEffect(() => {
    localStorage.setItem('upsc_timer_state_v1', JSON.stringify(timerState));
  }, [timerState]);

  useEffect(() => {
    let interval;
    const updateDisplay = () => {
      // Magic math: Computes exact duration based on real-world time elapsed
      const elapsedMs = timerState.accumulatedTime + (timerState.running ? Date.now() - timerState.startTime : 0);
      const totalSeconds = Math.floor(elapsedMs / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      setDisplayTime({ h, m, s });
      if (s === 0 && m === 0 && h > 0 && timerState.running) {
        setShowBreakReminder(true);
      }
    };
    updateDisplay();
    if (timerState.running) interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [timerState]);

  const startTimer = () => setTimerState(prev => ({ ...prev, running: true, startTime: Date.now() }));
  const pauseTimer = () => setTimerState(prev => ({ running: false, startTime: null, accumulatedTime: prev.accumulatedTime + (Date.now() - prev.startTime) }));
  const resetTimer = () => setTimerState({ running: false, startTime: null, accumulatedTime: 0 });

  const createAndLogSession = (hours, minutes, seconds) => {
    if (hours === 0 && minutes < 1) {
      alert('Session must be at least 1 minute');
      return;
    }
    const session = {
      id: Date.now(),
      subject: selectedSubject || 'General',
      duration: `${hours}h ${minutes}m`,
      durationSeconds: hours * 3600 + minutes * 60 + seconds,
      mode: studyMode,
      notes: studyNotes,
      date: new Date().toISOString(),
    };
    setSessions([session, ...sessions]);
    if (selectedSubject) {
      setSubjects(subjects.map(s => 
        s.name === selectedSubject ? { ...s, confidence: Math.min(100, s.confidence + 5) } : s
      ));
    }
    setStudyNotes('');
  };

  const logSession = () => {
    createAndLogSession(displayTime.h, displayTime.m, displayTime.s);
    resetTimer();
  };

  const logManualSession = () => {
    const h = Number(manualTime.h) || 0;
    const m = Number(manualTime.m) || 0;
    createAndLogSession(h, m, 0);
    setManualTime({ h: '', m: '' });
    setShowManualLog(false);
  };

  // ===================== OTHER ACTIONS =====================
  const logProductivity = () => {
    const filtered = productivity.filter(p => new Date(p.date).toISOString().split('T')[0] !== today.toISOString().split('T')[0]);
    const entry = { id: Date.now(), score: prodSlider, date: new Date().toISOString() };
    setProductivity([entry, ...filtered]);
    alert('Productivity logged! Chart updated.');
  };

  const updateSubjectStatus = (id, newStatus) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, status: newStatus } : s));
    setSelectedSubjectId(null);
  };

  const addGoal = () => {
    if (!goalInput.trim()) return;
    setGoals([{ id: Date.now(), text: goalInput, completed: false, date: new Date().toISOString() }, ...goals]);
    setGoalInput('');
  };

  const toggleGoal = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const saveJournal = () => {
    if (!journalInput.trim()) return;
    setJournal([{ id: Date.now(), text: journalInput, date: new Date().toISOString() }, ...journal]);
    setJournalInput('');
  };

  // ===================== WEEKLY NAV CHART DATA =====================
  const weeklyData = useMemo(() => {
    const data = [];
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - (weekOffset * 7));

    for (let i = 6; i >= 0; i--) {
      const date = new Date(targetDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySessions = sessions.filter(s => new Date(s.date).toISOString().split('T')[0] === dateStr);
      const dayHours = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 3600;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      data.push({ day: dayName, hours: Math.round(dayHours * 10) / 10, sessions: daySessions.length, fullDate: dateStr });
    }
    return data;
  }, [sessions, today, weekOffset]);

  const prodData = useMemo(() => {
    const data = [];
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - (weekOffset * 7));

    for (let i = 6; i >= 0; i--) {
      const date = new Date(targetDate);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayProd = productivity.find(p => new Date(p.date).toISOString().split('T')[0] === dateStr);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      data.push({ day: dayName, score: dayProd ? dayProd.score : 0, fullDate: dateStr });
    }
    return data;
  }, [productivity, today, weekOffset]);

  const weekDateRange = useMemo(() => {
    if (weeklyData.length === 0) return "";
    const first = new Date(weeklyData[0].fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const last = new Date(weeklyData[6].fullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${first} - ${last}`;
  }, [weeklyData]);

  // ===================== 3D GRAPH DATA =====================
  const subjectTimeData = useMemo(() => {
    const data = {};
    sessions.forEach(s => {
      if (!data[s.subject]) data[s.subject] = 0;
      data[s.subject] += s.durationSeconds / 3600;
    });
    return Object.entries(data)
      .map(([name, hours]) => ({ name: name.length > 12 ? name.substring(0, 12) + '...' : name, hours: Math.round(hours) }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [sessions]);

  const floatingGraphData = useMemo(() => {
    const nodes = [{ id: 'UPSC', name: '🎯 UPSC Goal', val: 15, color: '#ffffff' }];
    const links = [];

    subjectTimeData.forEach((subj, index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#EF4444', '#06B6D4'];
      nodes.push({
        id: subj.name,
        name: `${subj.name} (${subj.hours}h)`,
        val: subj.hours * 2 + 5, 
        color: colors[index % colors.length]
      });
      links.push({ source: 'UPSC', target: subj.name });
    });

    return { nodes, links };
  }, [subjectTimeData]);

  // ===================== SOURCES CONSTANTS =====================
  const sourcesData = {
    'Internal Security': ['Kumar Aniket — Challenges to Internal Security', 'Study IQ — 8 hr marathon', 'Sarrthi IAS — GS3 Module'],
    'Ancient/Medieval History': ['RS Sharma', 'Satish Chandra', 'NCERT 9th-12th', 'Kautilya Academy Notes', 'Samiksha Institute', 'Sainil Nagare Notes'],
    'Modern History': ['Spectrum (Rajiv Ahir)', 'Bipan Chandra', 'NCERTs', 'Sainil Nagare Notes'],
    'World History': ['Himanshu Khatri Notes', 'Vijay Ram Notes', 'Ravi Notes', 'Study IQ 10 hr marathon'],
    'Post-Independence': ['Spectrum', 'Bipan Chandra'],
    'Geography (World & Indian)': ['Kautilya Academy Notes', 'NCERT 11th-12th', 'Majid Husain (Selected)', 'G.C. Leong', 'Vision IAS Notes'],
    'Art & Culture': ['Nitin Singhania'],
    'Env. & Disaster Mgmt': ['Shankar IAS Environment', 'NDMA Guidelines (Summary)', 'NCERT Class 11 Disaster', 'Vision IAS Notes'],
    'Polity & Constitution': ['M. Laxmikant — Indian Polity', 'Sarrthi IAS Notes', 'DD Basu — Intro to Constitution'],
    'Governance & Social Justice': ['M. Laxmikant — Governance in India', 'Sarrthi IAS Notes'],
    'Science & Tech': ['Ravi P Agrahari', 'Kautilya Academy Notes', 'Vision IAS Notes'],
    'Economy & Agriculture': ['NCERTs', 'Sarrthi IAS Notes', 'Ramesh Singh', 'Vivek Singh Economy'],
    'Indian Society': ['NCERT Sociology 11th & 12th', 'Vision IAS GS1 Value Addition Material'],
    'Ethics & Integrity': ['Lexicon for Ethics', '2nd ARC Report', 'Subhra Ranjan / Vision IAS Notes'],
    'PSIR Paper 1': ['Subhra Ranjan Classes', 'IGNOU Notes', 'Andrew Heywood', 'O.P. Gauba', 'Western & Indian Political Thought'],
    'PSIR Paper 2': ['Subhra Ranjan Classes', 'Pavneet Singh — IR', 'Andrew Heywood', 'Does the Elephant Dance', 'Pax Indica', 'Rajiv Sikri'],
    'International Relations': ['(Subsumed largely by PSIR Paper 2)'],
    'Essay Writing': ['Weekly Practice', 'Anecdote Compilation', 'Philosophical Quotes DB'],
    'CSAT & Aptitude': ['Previous Year Questions', 'Basic Numeracy Daily Practice']
  };

  return (
    <div className="bg-[#0a0a0a] text-gray-100 min-h-screen pb-28 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-gray-950/80 border-b border-white/5 px-4 py-4 shadow-2xl backdrop-blur-md">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex justify-between items-center mb-4 transition-all hover:bg-white/10">
            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Prelims '27 (May 24)</span>
            <div className="flex gap-2 font-mono text-xs text-amber-400 font-bold">
              <span>{countdown.d}d</span>
              <span>{String(countdown.h).padStart(2, '0')}h</span>
              <span>{String(countdown.m).padStart(2, '0')}m</span>
              <span className="text-red-400">{String(countdown.s).padStart(2, '0')}s</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-black font-mono tracking-tight text-white flex items-center">
              ⚡ UPSC HQ
              {isSyncing && <span className="text-[10px] text-amber-500 font-sans font-bold uppercase tracking-widest ml-3 animate-pulse">Syncing...</span>}
            </h1>
            <div className="text-right">
              <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">{progress}%</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2 text-center shadow-inner">
              <div className="text-lg font-black text-red-400">🔥{streak}</div>
              <div className="text-[9px] uppercase tracking-widest text-red-400/70 font-semibold mt-1">streak</div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2 text-center shadow-inner">
              <div className="text-lg font-black text-blue-400">{todayStats.hours}h</div>
              <div className="text-[9px] uppercase tracking-widest text-blue-400/70 font-semibold mt-1">today</div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2 text-center shadow-inner">
              <div className="text-lg font-black text-emerald-400">{sessions.length}</div>
              <div className="text-[9px] uppercase tracking-widest text-emerald-400/70 font-semibold mt-1">total</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-2 text-center shadow-inner">
              <div className="text-lg font-black text-purple-400">{todayStats.productivity}%</div>
              <div className="text-[9px] uppercase tracking-widest text-purple-400/70 font-semibold mt-1">focus</div>
            </div>
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-2 text-center shadow-inner">
              <div className="text-lg font-black text-teal-400">{todayStats.goals}</div>
              <div className="text-[9px] uppercase tracking-widest text-teal-400/70 font-semibold mt-1">goals</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500 font-bold">
               <span>Algorithm Progress</span>
               <span>{completedWeight + MathRoundWorkingWeight}/{totalWeight} Wt</span>
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-900 border border-white/5">
              <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${(completedWeight / totalWeight) * 100}%` }} />
              <div className="bg-amber-500 transition-all duration-500" style={{ width: `${(MathRoundWorkingWeight / totalWeight) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {showBreakReminder && (
        <div className="fixed top-36 left-0 right-0 z-40 mx-4 bg-red-500/90 backdrop-blur-md border border-red-400 rounded-2xl p-4 shadow-2xl animate-bounce">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            <span className="text-sm font-bold text-white">⏰ Take a 5-min break! You've studied for 1 hour.</span>
            <button onClick={() => setShowBreakReminder(false)} className="text-sm bg-black/20 text-white px-4 py-1.5 rounded-lg hover:bg-black/40 font-bold transition">Done</button>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            <div>
              <h4 className="text-[10px] font-bold text-gray-500 mb-3 uppercase tracking-widest">Essential Resources</h4>
              <button 
                onClick={openDrishtiIAS}
                className="w-full text-left group block bg-gradient-to-r from-blue-900/40 to-blue-600/20 border border-blue-500/30 hover:border-blue-400/60 rounded-2xl p-4 transition-all hover:scale-[1.01] shadow-lg"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-xl text-xl border border-blue-400/20">📰</div>
                    <div>
                      <h4 className="font-bold text-sm text-blue-100 group-hover:text-white transition">Drishti IAS Current Affairs</h4>
                      <p className="text-[11px] text-blue-300/70 mt-1">Daily News Analysis & Editorials</p>
                    </div>
                  </div>
                  <span className="text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform font-bold">↗</span>
                </div>
              </button>
            </div>

            <div className={`rounded-2xl p-5 border shadow-sm backdrop-blur-md transition-all ${paceBg}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Algorithmic Pace Matrix</span>
                <span className={`font-mono text-xs font-black ${paceColor}`}>{paceStatus}</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
                 <p className="text-[11px] text-gray-400">Expected: <span className="text-gray-100 font-bold ml-1">{expectedProgress.toFixed(1)}%</span></p>
                 <p className="text-[11px] text-gray-400">Actual: <span className="text-gray-100 font-bold ml-1">{progress}%</span></p>
                 <p className="text-[11px] text-gray-400">Day: <span className="text-gray-100 font-bold ml-1">{daysElapsed}/{STRATEGY_DAYS}</span></p>
              </div>
            </div>

            {weakAreas.length > 0 && (
              <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 backdrop-blur-md">
                <h4 className="text-[10px] font-bold text-red-400/80 mb-4 uppercase tracking-widest">Critical Focus Vectors</h4>
                <div className="space-y-2">
                  {weakAreas.map((s, index) => (
                    <div key={s.id} className="flex justify-between items-center text-sm bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-mono text-xs">0{index+1}</span>
                        <span className="text-gray-200 font-semibold">{s.name}</span>
                      </div>
                      <span className="text-red-300 font-mono text-xs font-bold bg-red-500/10 px-2 py-1 rounded-md">{s.weight} Wt</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Next Phases</h4>
              <div className="grid grid-cols-2 gap-3">
                {monthlyProgress.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-white/20 transition">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-amber-400/90">{m.phase}</span>
                      <span className="text-[10px] font-bold text-gray-400">{m.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-400" style={{ width: `${m.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEEKLY CHARTS WITH NAVIGATION */}
            <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Weekly Analytics</h4>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setWeekOffset(weekOffset + 1)} 
                    className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md text-xs transition"
                  >
                    ◀ Past
                  </button>
                  <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/20">
                    {weekOffset === 0 ? "Current Week" : weekDateRange}
                  </span>
                  <button 
                    onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                    disabled={weekOffset === 0} 
                    className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md text-xs transition disabled:opacity-30 disabled:hover:bg-white/10"
                  >
                    Next ▶
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Cognitive Efficiency Trend</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <ComposedChart data={prodData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#333" vertical={false} />
                    <XAxis dataKey="day" stroke="#666" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" style={{ fontSize: '10px' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                    <Bar dataKey="score" fill="#F59E0B" fillOpacity={0.15} radius={[4, 4, 0, 0]} barSize={20} />
                    <Line type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0a', stroke: '#F59E0B', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Weekly Study Hours</h4>
                {weeklyData.some(d => d.hours > 0) ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#333" vertical={false} />
                      <XAxis dataKey="day" stroke="#666" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" style={{ fontSize: '10px' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#222', opacity: 0.4}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="hours" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-600 text-center py-6 border border-dashed border-gray-800 rounded-xl">No sessions recorded for this week</p>
                )}
              </div>
            </div>

            {/* NEW 3D ANTIGRAVITY GRAPH */}
            {subjectTimeData.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md overflow-hidden">
                <h4 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-widest flex justify-between items-center">
                  <span>Time Allocation Universe (3D)</span>
                  <span className="text-[8px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Drag to Spin • Scroll to Zoom</span>
                </h4>
                
                <div className="h-[250px] w-full rounded-xl overflow-hidden bg-black/50 border border-white/5 cursor-move">
                  <ForceGraph3D
                    graphData={floatingGraphData}
                    backgroundColor="#00000000"
                    nodeLabel="name"
                    nodeRelSize={6}
                    linkWidth={1}
                    linkOpacity={0.1}
                    linkColor={() => '#ffffff'}
                    d3VelocityDecay={0.02} 
                    d3AlphaDecay={0.01}
                    width={typeof window !== 'undefined' && window.innerWidth > 768 ? 700 : (typeof window !== 'undefined' ? window.innerWidth - 60 : 300)}
                    height={250}
                  />
                </div>
              </div>
            )}

            <div className="bg-teal-500/5 border border-teal-500/10 rounded-2xl p-5 backdrop-blur-md">
              <h4 className="text-[10px] font-bold text-teal-400 mb-4 uppercase tracking-widest">Micro-Goals ({goals.filter(g => !g.completed).length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {goals.filter(g => !g.completed).map(goal => (
                  <div key={goal.id} className="flex items-center gap-3 text-sm bg-white/5 p-3 rounded-xl hover:bg-white/10 transition border border-transparent hover:border-white/5">
                    <input type="checkbox" checked={false} onChange={() => toggleGoal(goal.id)} className="w-4 h-4 cursor-pointer accent-teal-500 rounded border-gray-600 bg-gray-800" />
                    <span className="text-gray-200 flex-1">{goal.text}</span>
                    <button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-gray-600 hover:text-red-400 font-bold px-2">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Add a daily micro-goal..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 focus:bg-black/60 transition"
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <button onClick={addGoal} className="bg-teal-600/20 text-teal-400 border border-teal-500/30 hover:bg-teal-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">Add</button>
              </div>
            </div>
          </div>
        )}

        {/* TIMER TAB */}
        {activeTab === 'timer' && (
          <div className="space-y-6">
            <div className={`rounded-3xl p-6 md:p-10 text-center border backdrop-blur-md transition-all duration-500 ${focusMode ? 'bg-orange-950/20 border-orange-500/30 shadow-[0_0_40px_rgba(234,88,12,0.15)]' : 'bg-white/5 border-white/10 shadow-lg'}`}>
              <div className={`text-7xl md:text-8xl font-black font-mono mb-8 tracking-tighter ${focusMode ? 'text-orange-400 animate-pulse' : 'text-gray-100 drop-shadow-sm'}`}>
                {String(displayTime.h).padStart(2, '0')}:{String(displayTime.m).padStart(2, '0')}:{String(displayTime.s).padStart(2, '0')}
              </div>

              <div className="space-y-4 mb-8 max-w-sm mx-auto">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500/50 font-semibold appearance-none hover:bg-black/60 transition"
                >
                  <option value="">Tag a Subject...</option>
                  {subjects.map(s => (<option key={s.id} value={s.name}>{s.name}</option>))}
                </select>

                <select
                  value={studyMode}
                  onChange={(e) => setStudyMode(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500/50 font-semibold appearance-none hover:bg-black/60 transition"
                >
                  <option value="deep">🧠 Deep Work (Theory)</option>
                  <option value="revision">🔄 Revision Sprint</option>
                  <option value="mock">📝 Mock Test</option>
                  <option value="ca">📰 Current Affairs</option>
                  <option value="essay">✍️ Essay Writing</option>
                </select>

                <textarea
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  placeholder="Session focus/notes (optional)..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 min-h-24 resize-none hover:bg-black/60 transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8 max-w-sm mx-auto">
                <button onClick={startTimer} disabled={timerState.running} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition disabled:opacity-30 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400">▶ Start</button>
                <button onClick={pauseTimer} disabled={!timerState.running} className="bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition disabled:opacity-30 disabled:hover:bg-amber-500/10 disabled:hover:text-amber-400">⏸ Pause</button>
                <button onClick={resetTimer} className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition">⟲ Reset</button>
              </div>

              <button onClick={logSession} className="w-full max-w-sm mx-auto block bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition mb-4">
                📥 Stop & Log Session
              </button>

              <button 
                onClick={() => setFocusMode(!focusMode)}
                className={`w-full max-w-sm mx-auto block py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition border ${focusMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10'}`}
              >
                {focusMode ? '✕ Exit Focus Mode' : '🎯 Enter Focus Mode'}
              </button>

              <div className="mt-8 pt-6 border-t border-white/10 max-w-sm mx-auto">
                <button 
                  onClick={() => setShowManualLog(!showManualLog)}
                  className="text-[10px] text-gray-500 hover:text-gray-300 uppercase tracking-widest font-bold w-full flex items-center justify-center gap-2 transition"
                >
                  {showManualLog ? '▼ Hide Manual Entry' : '▶ Add time manually'}
                </button>

                {showManualLog && (
                  <div className="flex gap-2 justify-center items-center mt-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                     <input
                       type="number" min="0" placeholder="Hrs"
                       value={manualTime.h}
                       onChange={(e) => setManualTime({...manualTime, h: e.target.value})}
                       className="w-16 bg-black/60 border border-white/10 rounded-xl px-2 py-2.5 text-center text-sm text-white focus:outline-none focus:border-amber-500/50"
                     />
                     <span className="text-gray-600 font-bold">:</span>
                     <input
                       type="number" min="0" max="59" placeholder="Mins"
                       value={manualTime.m}
                       onChange={(e) => setManualTime({...manualTime, m: e.target.value})}
                       className="w-16 bg-black/60 border border-white/10 rounded-xl px-2 py-2.5 text-center text-sm text-white focus:outline-none focus:border-amber-500/50"
                     />
                     <button
                       onClick={logManualSession}
                       className="bg-white/10 hover:bg-white text-gray-300 hover:text-black px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ml-2 transition border border-white/10 hover:border-white"
                     >
                       Log
                     </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <h4 className="text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-widest">Recent Sessions History</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                {sessions.slice(0, 20).map(s => (
                  <div key={s.id} className="flex justify-between items-center text-sm bg-black/40 border border-white/5 p-3.5 rounded-xl hover:bg-black/60 transition group">
                    <div>
                      <span className="text-gray-200 font-semibold">{s.subject}</span>
                      <span className="text-[9px] uppercase font-bold text-gray-500 ml-2.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">{s.mode}</span>
                    </div>
                    {/* WITH DELETE BUTTON */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-gray-400">{s.duration}</span>
                      <button 
                        onClick={() => setSessions(sessions.filter(session => session.id !== s.id))} 
                        className="text-[10px] text-red-500 hover:text-red-400 font-bold px-2 py-1 bg-red-500/10 rounded-md border border-red-500/10 transition opacity-80 hover:opacity-100"
                        title="Delete Session"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && <p className="text-xs text-gray-600 text-center py-6">No sessions recorded yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* MONTHLY ROADMAP */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 backdrop-blur-md mb-6">
              <h3 className="text-sm font-bold text-blue-400">📋 8-Month Roadmap to Success</h3>
              <p className="text-xs text-gray-500 mt-1">Track your macro progress through the required phases.</p>
            </div>

            {monthlyProgress.map((month, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md hover:bg-white/10 transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-3">
                    <h4 className="font-black text-sm text-gray-100">{month.phase} <span className="text-gray-500 font-normal mx-1">/</span> <span className="text-amber-400/90">{month.month}</span></h4>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">{month.focus}</p>
                  </div>
                  <span className={`text-2xl font-black font-mono ${month.progress === 100 ? 'text-emerald-400' : month.progress > 50 ? 'text-amber-400' : 'text-gray-600'}`}>
                    {month.progress}%
                  </span>
                </div>

                <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-gray-900 mb-4 border border-white/5">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500" style={{ width: `${month.progress}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                  <div className="bg-black/40 rounded-xl px-2 py-2 text-center border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Days</span>
                    <span className="text-gray-200 font-bold">{month.days}</span>
                  </div>
                  <div className="bg-black/40 rounded-xl px-2 py-2 text-center border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Topics</span>
                    <span className="text-gray-200 font-bold">{month.topics.length}</span>
                  </div>
                  <div className="bg-black/40 rounded-xl px-2 py-2 text-center border border-white/5">
                    <span className="text-gray-500 block text-[9px] uppercase font-bold tracking-wider mb-0.5">Essays</span>
                    <span className="text-amber-400 font-bold">{month.essays}</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mb-2">Subject Coverage:</p>
                  <div className="space-y-1.5 flex flex-wrap gap-2">
                    {month.topics.map((topic, i) => (
                      <span key={i} className="text-[10px] text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DAILY SCHEDULE */}
        {activeTab === 'schedule' && (
          <div className="space-y-3">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 backdrop-blur-md mb-6">
              <h3 className="text-sm font-bold text-amber-400">📅 Optimal Daily Architecture</h3>
              <p className="text-xs text-gray-500 mt-1">11-hour deep work routine framework.</p>
            </div>

            {DAILY_TIMETABLE.map((slot, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4.5 backdrop-blur-md flex items-center gap-4 hover:bg-white/10 transition shadow-sm">
                <div className="font-mono font-bold text-gray-400 text-xs w-28 shrink-0">{slot.time}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-200">{slot.activity}</div>
                  <div className="text-[9px] uppercase font-bold text-gray-500 mt-1 tracking-widest">{slot.hours}h Block</div>
                </div>
                <div className={`text-[9px] px-2.5 py-1.5 rounded-lg uppercase font-bold tracking-widest ${
                  slot.type === 'study' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  slot.type === 'essay' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                  slot.type === 'ca' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>{slot.type}</div>
              </div>
            ))}
          </div>
        )}

        {/* SUBJECTS MATRIX */}
        {activeTab === 'subjects' && (
          <div className="space-y-4">
            <div className="sticky top-[140px] md:top-32 z-30 bg-[#0a0a0a]/90 py-4 border-b border-white/5 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weighted Subject Matrix</h3>
                <div className="flex gap-2">
                  <button onClick={() => setSubjects(subjects.map(s => ({ ...s, status: 'untouched' })))} className="text-[9px] uppercase font-bold bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg border border-white/10 transition">Reset</button>
                  <button onClick={() => setSubjects(subjects.map(s => ({ ...s, status: 'completed' })))} className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-2 rounded-lg border border-emerald-500/20 transition">Complete All</button>
                </div>
              </div>
              <p className="text-[10px] text-gray-600">Ranked by UPSC Mains weightage. Tap cards to update status.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSubjectId(selectedSubjectId === s.id ? null : s.id)}
                  className={`rounded-2xl p-4 text-left transition-all duration-300 border shadow-sm hover:-translate-y-1 ${
                    s.status === 'completed' ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-100' :
                    s.status === 'working' ? 'bg-amber-500/5 border-amber-500/30 text-amber-100' :
                    'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-sm leading-tight mb-4">{s.name}</div>
                  <div className="flex justify-between items-end">
                     <div className="text-[10px] font-mono text-gray-500 space-y-1">
                        <span className="block">Wt: {s.weight}</span>
                        <span>Phase {s.roadmapPhase}</span>
                     </div>
                     <div className={`text-[8px] uppercase font-bold px-2 py-1 rounded-md tracking-widest ${s.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : s.status === 'working' ? 'bg-amber-500/20 text-amber-400' : 'bg-black/50 text-gray-500 border border-white/5'}`}>
                        {s.status}
                     </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedSubjectId && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm bg-[#111] rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-slide-up">
                  <h4 className="font-black text-center text-lg text-white mb-1">
                    {subjects.find(s => s.id === selectedSubjectId)?.name}
                  </h4>
                  <p className="text-[10px] uppercase font-bold text-gray-500 text-center mb-8 tracking-widest">Update Status</p>
                  
                  <div className="flex flex-col gap-3 mb-6">
                    {['untouched', 'working', 'completed'].map(status => (
                      <button
                        key={status}
                        onClick={() => updateSubjectStatus(selectedSubjectId, status)}
                        className={`py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
                          subjects.find(s => s.id === selectedSubjectId)?.status === status
                            ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-[1.02]'
                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10'
                        }`}
                      >
                        {status === 'untouched' ? '⚪ Untouched' : status === 'working' ? '🟡 In Progress' : '🟢 Completed'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Recommended Sources:</p>
                    <ul className="text-[11px] text-gray-400 space-y-2 mb-6">
                       {(sourcesData[subjects.find(s => s.id === selectedSubjectId)?.name] || ['Refer to Core NCERTs']).map((source, idx) => (
                         <li key={idx} className="flex gap-2.5 items-start"><span className="text-gray-600 mt-0.5">▹</span><span className="leading-relaxed">{source}</span></li>
                       ))}
                    </ul>
                  </div>

                  <button onClick={() => setSelectedSubjectId(null)} className="w-full py-3.5 bg-transparent text-gray-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition border border-white/10 hover:border-white/30 hover:bg-white/5">Close Panel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {activeTab === 'journal' && (
          <div className="space-y-6">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-5">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cognitive Efficiency</h4>
                 <div className="text-sm font-black text-amber-400">{prodSlider}%</div>
              </div>
              
              <input
                type="range" min="0" max="100" value={prodSlider}
                onChange={(e) => setProdSlider(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500 mb-6"
              />
              <button onClick={logProductivity} className="w-full bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition shadow-sm">Log Today's Score</button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Daily Insights & Reflection</label>
              <textarea
                value={journalInput}
                onChange={(e) => setJournalInput(e.target.value)}
                placeholder="Log mistakes, epiphanies, links, or quick notes..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-teal-500/50 min-h-32 resize-none mb-4 hover:bg-black/60 transition"
              />
              <button onClick={saveJournal} className="w-full bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:bg-teal-500 hover:text-black py-3.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition shadow-sm">💾 Save Entry</button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">Journal History ({journal.length})</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {journal.map(entry => (
                  <div key={entry.id} className="bg-black/20 border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-mono font-bold text-gray-500">{new Date(entry.date).toLocaleString()}</span>
                      <button onClick={() => setJournal(journal.filter(e => e.id !== entry.id))} className="text-[9px] font-bold uppercase tracking-widest text-red-500/70 hover:text-red-400 px-2 py-1 bg-red-500/10 rounded-md border border-red-500/10 transition">Delete</button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                  </div>
                ))}
                {journal.length === 0 && <p className="text-xs text-center text-gray-600 py-8">No journal entries yet. Start writing!</p>}
              </div>
            </div>

            <button
              onClick={() => {
                const data = { subjects, sessions, productivity, journal, goals, timestamp: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `upsc_2027_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition mt-6"
            >
              📥 Export JSON Backup
            </button>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-40 pb-safe backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-2 py-2.5 grid grid-cols-6 gap-1 text-[9px]">
          {[
            { id: 'dashboard', icon: '📊', label: 'Stats' },
            { id: 'timer', icon: '⏱️', label: 'Timer' },
            { id: 'roadmap', icon: '🗺️', label: 'Roadmap' },
            { id: 'schedule', icon: '📅', label: 'Daily' },
            { id: 'subjects', icon: '📚', label: 'Subjects' },
            { id: 'journal', icon: '📝', label: 'Journal' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-inner scale-[1.02]'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              <span className={`text-xl mb-1.5 transition-transform ${activeTab === tab.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'opacity-70'}`}>{tab.icon}</span>
              <span className="font-bold uppercase tracking-widest truncate w-full text-center">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UPSCTrackerUltraPro;