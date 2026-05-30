import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Apple,
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Download,
  Droplets,
  Dumbbell,
  Flame,
  Home,
  Moon,
  Pause,
  Play,
  Plus,
  Timer,
  Trophy,
  Utensils,
  X
} from "lucide-react";
import * as XLSX from "xlsx";
import "./styles.css";

const today = new Date();
const dateLabel = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric"
});

const quotes = [
  "Small wins compound into remarkable days.",
  "You do not need perfect. You need present.",
  "Momentum starts with the next honest checkmark.",
  "The day gets lighter when you keep promises to yourself.",
  "Progress loves consistency more than intensity."
];

const tabs = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "diet", label: "Diet", icon: Apple },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "summary", label: "Summary", icon: Check },
  { id: "export", label: "Export", icon: Download }
];

const badgeLevels = [
  { min: 0, label: "Beginner" },
  { min: 250, label: "Warrior" },
  { min: 650, label: "Legend" }
];

const weekly = [
  { day: "Mon", steps: 7200, calories: 1780, study: 2.5, gym: 1 },
  { day: "Tue", steps: 9400, calories: 1910, study: 3.2, gym: 1 },
  { day: "Wed", steps: 8400, calories: 2050, study: 1.4, gym: 0 },
  { day: "Thu", steps: 11200, calories: 1880, study: 4.1, gym: 1 },
  { day: "Fri", steps: 9900, calories: 2130, study: 2.8, gym: 1 },
  { day: "Sat", steps: 6300, calories: 1690, study: 3.6, gym: 0 },
  { day: "Sun", steps: 10400, calories: 1980, study: 2.1, gym: 1 }
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function ProgressRing({ icon: Icon, label, value, goal, unit, color }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const percent = clamp(value / goal, 0, 1);

  return (
    <article className="metric-card lift">
      <div className="ring-shell" style={{ "--ring-color": color }}>
        <svg viewBox="0 0 112 112" aria-hidden="true">
          <circle className="ring-track" cx="56" cy="56" r={radius} />
          <circle
            className="ring-fill"
            cx="56"
            cy="56"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - percent)}
          />
        </svg>
        <div className="ring-center">
          <Icon size={22} />
          <span>{Math.round(percent * 100)}%</span>
        </div>
      </div>
      <div>
        <p>{label}</p>
        <strong>
          {value.toLocaleString()} <span>{unit}</span>
        </strong>
      </div>
    </article>
  );
}

function TogglePill({ active, onClick, activeText, inactiveText }) {
  return (
    <button className={`toggle-pill ${active ? "is-active" : ""}`} onClick={onClick} type="button">
      <span>{active ? <Check size={16} /> : <X size={16} />}</span>
      {active ? activeText : inactiveText}
    </button>
  );
}

function Field({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SectionHeader({ icon: Icon, title, detail }) {
  return (
    <div className="section-header">
      <div className="section-title">
        <span className="section-icon">
          <Icon size={18} />
        </span>
        <h2>{title}</h2>
      </div>
      <p>{detail}</p>
    </div>
  );
}

function Dashboard({ data, score }) {
  const quote = quotes[today.getDate() % quotes.length];
  const currentLevel = badgeLevels.filter((level) => data.xp >= level.min).at(-1);
  const xpTarget = currentLevel.label === "Legend" ? 1000 : badgeLevels[badgeLevels.indexOf(currentLevel) + 1].min;
  const xpPercent = clamp(data.xp / xpTarget, 0, 1) * 100;

  return (
    <main className="view dashboard-view">
      <section className="hero-panel">
        <div>
          <span className="soft-label">Daily Progress</span>
          <h1>Good day, Achiever</h1>
          <p>{dateLabel}</p>
        </div>
        <div className="streak-badge">
          <Flame size={20} />
          <strong>{data.streak}</strong>
          <span>day streak</span>
        </div>
      </section>

      <section className="metric-grid stagger">
        <ProgressRing icon={Activity} label="Steps" value={data.steps} goal={10000} unit="steps" color="#82b7ff" />
        <ProgressRing icon={Droplets} label="Water" value={data.water} goal={8} unit="glasses" color="#83d8d2" />
        <ProgressRing icon={Moon} label="Sleep" value={data.sleep} goal={8} unit="hours" color="#b8a6ff" />
        <ProgressRing icon={Utensils} label="Calories" value={data.calories} goal={2000} unit="kcal" color="#f4b3bd" />
      </section>

      <section className="split-grid">
        <article className="card quote-card lift">
          <Circle size={12} />
          <p>{quote}</p>
        </article>
        <article className="card xp-card lift">
          <div className="xp-top">
            <div>
              <span className="soft-label">Level</span>
              <h3>{currentLevel.label}</h3>
            </div>
            <span className="level-chip">
              <Trophy size={16} />
              {score}/100
            </span>
          </div>
          <div className="progress-bar">
            <span style={{ width: `${xpPercent}%` }} />
          </div>
          <p>{data.xp} XP collected today</p>
        </article>
      </section>
    </main>
  );
}

function Gym({ data, setData }) {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [duration, setDuration] = useState(35);
  const [running, setRunning] = useState(false);

  const addExercise = () => {
    if (!exercise.trim()) return;
    setData((prev) => ({
      ...prev,
      gym: {
        ...prev.gym,
        exercises: [...prev.gym.exercises, { name: exercise.trim(), sets, reps }]
      }
    }));
    setExercise("");
  };

  const saveSession = () => {
    setData((prev) => ({
      ...prev,
      gym: {
        ...prev.gym,
        history: [
          { date: dateLabel, duration, status: prev.gym.done ? "Done" : "Skipped", count: prev.gym.exercises.length },
          ...prev.gym.history
        ]
      }
    }));
  };

  return (
    <main className="view">
      <SectionHeader icon={Dumbbell} title="Gym / Workout" detail="Track today’s session with lightweight controls." />
      <section className="two-column">
        <article className="card lift">
          <div className="toolbar">
            <TogglePill
              active={data.gym.done}
              activeText="Workout done"
              inactiveText="Workout skipped"
              onClick={() => setData((prev) => ({ ...prev, gym: { ...prev.gym, done: !prev.gym.done } }))}
            />
            <button className="icon-button" onClick={() => setRunning(!running)} type="button" aria-label="Toggle timer">
              {running ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
          <div className="timer-card">
            <Timer size={22} />
            <strong>{duration} min</strong>
            <input
              type="range"
              min="5"
              max="120"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </div>
          <div className="input-row">
            <Field value={exercise} onChange={setExercise} placeholder="Exercise" />
            <Field value={sets} onChange={setSets} placeholder="Sets" type="number" />
            <Field value={reps} onChange={setReps} placeholder="Reps" type="number" />
            <button className="primary-button" onClick={addExercise} type="button">
              <Plus size={17} />
              Add
            </button>
          </div>
          <div className="list">
            {data.gym.exercises.map((item, index) => (
              <div className="list-item" key={`${item.name}-${index}`}>
                <span>{item.name}</span>
                <strong>
                  {item.sets} x {item.reps}
                </strong>
              </div>
            ))}
          </div>
        </article>
        <article className="card lift">
          <div className="card-title">
            <h3>Session History</h3>
            <button className="text-button" onClick={saveSession} type="button">
              Save <ChevronRight size={16} />
            </button>
          </div>
          <div className="timeline">
            {data.gym.history.map((session, index) => (
              <div className="timeline-item" key={`${session.date}-${index}`}>
                <span />
                <div>
                  <strong>{session.status}</strong>
                  <p>
                    {session.duration} min · {session.count} exercises
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function Study({ data, setData }) {
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("1");
  const colors = ["#82b7ff", "#a9dfbf", "#c7b8ff", "#f5c1cc", "#f7d784"];
  const total = data.study.reduce((sum, item) => sum + Number(item.hours), 0);

  const addStudy = () => {
    if (!subject.trim()) return;
    setData((prev) => ({
      ...prev,
      study: [...prev.study, { subject: subject.trim(), hours: Number(hours), color: colors[prev.study.length % colors.length] }]
    }));
    setSubject("");
    setHours("1");
  };

  return (
    <main className="view">
      <SectionHeader icon={BookOpen} title="Study" detail="Log focus blocks and keep subjects balanced." />
      <section className="two-column">
        <article className="card stat-card lift">
          <span className="soft-label">Focus Today</span>
          <strong>{total.toFixed(1)}h</strong>
          <p>Daily total focus hours</p>
          <div className="input-row">
            <Field value={subject} onChange={setSubject} placeholder="Subject" />
            <Field value={hours} onChange={setHours} placeholder="Hours" type="number" />
            <button className="primary-button study" onClick={addStudy} type="button">
              <Plus size={17} />
              Add
            </button>
          </div>
        </article>
        <article className="card lift">
          <div className="card-title">
            <h3>Subject Breakdown</h3>
          </div>
          <div className="list">
            {data.study.map((item, index) => (
              <div className="list-item" key={`${item.subject}-${index}`}>
                <span className="tag" style={{ "--tag-color": item.color }}>
                  {item.subject}
                </span>
                <strong>{item.hours}h</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function Diet({ data, setData }) {
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("350");
  const [mealType, setMealType] = useState("Breakfast");
  const sections = ["Breakfast", "Lunch", "Dinner", "Snacks"];
  const total = data.meals.reduce((sum, meal) => sum + Number(meal.calories), 0);

  const addMeal = () => {
    if (!mealName.trim()) return;
    setData((prev) => ({
      ...prev,
      meals: [...prev.meals, { name: mealName.trim(), calories: Number(mealCalories), type: mealType }],
      calories: prev.calories + Number(mealCalories)
    }));
    setMealName("");
  };

  return (
    <main className="view">
      <SectionHeader icon={Apple} title="Diet" detail="Count calories and sort meals by daypart." />
      <section className="card lift">
        <div className="calorie-top">
          <div>
            <span className="soft-label">Calories</span>
            <h2>{total} / 2000 kcal</h2>
          </div>
          <Utensils size={28} />
        </div>
        <div className="progress-bar calories">
          <span style={{ width: `${clamp(total / 2000, 0, 1) * 100}%` }} />
        </div>
        <div className="input-row">
          <Field value={mealName} onChange={setMealName} placeholder="Meal name" />
          <Field value={mealCalories} onChange={setMealCalories} placeholder="Calories" type="number" />
          <select value={mealType} onChange={(event) => setMealType(event.target.value)}>
            {sections.map((section) => (
              <option key={section}>{section}</option>
            ))}
          </select>
          <button className="primary-button diet" onClick={addMeal} type="button">
            <Plus size={17} />
            Add
          </button>
        </div>
      </section>
      <section className="meal-grid">
        {sections.map((section) => (
          <article className="card meal-card lift" key={section}>
            <h3>{section}</h3>
            {data.meals
              .filter((meal) => meal.type === section)
              .map((meal, index) => (
                <div className="list-item" key={`${meal.name}-${index}`}>
                  <span>{meal.name}</span>
                  <strong>{meal.calories} kcal</strong>
                </div>
              ))}
          </article>
        ))}
      </section>
    </main>
  );
}

function MiniBars({ label, metric, max, color }) {
  return (
    <article className="card chart-card lift">
      <h3>{label}</h3>
      <div className="bars">
        {weekly.map((day) => (
          <div className="bar-slot" key={`${label}-${day.day}`}>
            <span style={{ height: `${clamp(day[metric] / max, 0, 1) * 100}%`, background: color }} />
            <small>{day.day}</small>
          </div>
        ))}
      </div>
    </article>
  );
}

function Insights({ data }) {
  const heat = Array.from({ length: 35 }, (_, index) => (index + data.streak) % 5);

  return (
    <main className="view">
      <SectionHeader icon={BarChart3} title="Insights" detail="Weekly activity, rhythm, and streak history." />
      <section className="chart-grid">
        <MiniBars label="Steps" metric="steps" max={12000} color="#82b7ff" />
        <MiniBars label="Calories" metric="calories" max={2300} color="#f5b6c4" />
        <MiniBars label="Study Hours" metric="study" max={5} color="#b9a8ff" />
        <MiniBars label="Gym Sessions" metric="gym" max={1} color="#94d7a4" />
      </section>
      <section className="two-column">
        <article className="card lift">
          <div className="card-title">
            <h3>Habit Heatmap</h3>
          </div>
          <div className="heatmap">
            {heat.map((value, index) => (
              <span className={`heat heat-${value}`} key={index} />
            ))}
          </div>
        </article>
        <article className="card lift">
          <div className="card-title">
            <h3>Streak History</h3>
          </div>
          <div className="streak-line">
            {[3, 5, 8, 9, 12, data.streak].map((value, index) => (
              <span style={{ height: `${value * 7}px` }} key={`${value}-${index}`} />
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

function Summary({ data, score }) {
  const checks = [
    { label: "Reached 10,000 steps", done: data.steps >= 10000 },
    { label: "Logged workout", done: data.gym.done },
    { label: "Studied for 2+ hours", done: data.study.reduce((sum, item) => sum + Number(item.hours), 0) >= 2 },
    { label: "Stayed within calorie goal", done: data.meals.reduce((sum, meal) => sum + Number(meal.calories), 0) <= 2000 },
    { label: "Slept 7+ hours", done: data.sleep >= 7 }
  ];

  return (
    <main className="view">
      <SectionHeader icon={Check} title="Daily Summary" detail="Auto-generated score from today’s completion." />
      <section className="summary-layout">
        <article className="card score-card lift">
          <span className="soft-label">Today’s Score</span>
          <strong>{score}</strong>
          <p>out of 100</p>
        </article>
        <article className="card reveal-list lift">
          {checks.map((item, index) => (
            <div className="check-row" style={{ animationDelay: `${index * 90}ms` }} key={item.label}>
              <span className={item.done ? "done" : "missed"}>{item.done ? <Check size={16} /> : <X size={16} />}</span>
              <p>{item.label}</p>
              <strong>{item.done ? "Done" : "Missed"}</strong>
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}

function ExportPanel({ data, score }) {
  const exportWorkbook = () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet([
        {
          date: dateLabel,
          steps: data.steps,
          water_glasses: data.water,
          sleep_hours: data.sleep,
          calories: data.calories,
          xp: data.xp,
          streak: data.streak,
          score
        }
      ]),
      "Daily Summary"
    );
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.gym.exercises), "Workout");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.study), "Study");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data.meals), "Meals");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(weekly), "Weekly Insights");
    XLSX.writeFile(workbook, "daily-progress-tracker.xlsx");
  };

  return (
    <main className="view">
      <SectionHeader icon={Download} title="Excel Export" detail="Download today’s tracker data as an XLSX workbook." />
      <section className="export-panel card lift">
        <Download size={44} />
        <h2>Ready for your spreadsheet</h2>
        <p>Includes daily summary, exercises, study logs, meals, and weekly insight data.</p>
        <button className="primary-button export" onClick={exportWorkbook} type="button">
          <Download size={18} />
          Export .xlsx
        </button>
        <div className="auto-export">
          <CalendarDays size={17} />
          Auto-export trigger available at end of day
        </div>
      </section>
    </main>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState({
    steps: 8200,
    water: 6,
    sleep: 7.5,
    calories: 1260,
    xp: 420,
    streak: 12,
    gym: {
      done: true,
      exercises: [
        { name: "Bench Press", sets: 4, reps: 8 },
        { name: "Squat", sets: 3, reps: 10 }
      ],
      history: [{ date: "Yesterday", duration: 42, status: "Done", count: 5 }]
    },
    study: [
      { subject: "Math", hours: 1.5, color: "#82b7ff" },
      { subject: "Physics", hours: 1, color: "#c7b8ff" }
    ],
    meals: [
      { name: "Oats and fruit", calories: 390, type: "Breakfast" },
      { name: "Rice bowl", calories: 520, type: "Lunch" },
      { name: "Greek yogurt", calories: 180, type: "Snacks" }
    ]
  });

  const score = useMemo(() => {
    const studyHours = data.study.reduce((sum, item) => sum + Number(item.hours), 0);
    const mealCalories = data.meals.reduce((sum, meal) => sum + Number(meal.calories), 0);
    const pieces = [
      clamp(data.steps / 10000, 0, 1) * 20,
      clamp(data.water / 8, 0, 1) * 15,
      clamp(data.sleep / 8, 0, 1) * 15,
      data.gym.done ? 20 : 0,
      clamp(studyHours / 3, 0, 1) * 15,
      mealCalories <= 2000 ? 15 : 8
    ];
    return Math.round(pieces.reduce((sum, item) => sum + item, 0));
  }, [data]);

  const screen = {
    dashboard: <Dashboard data={data} score={score} />,
    gym: <Gym data={data} setData={setData} />,
    study: <Study data={data} setData={setData} />,
    diet: <Diet data={data} setData={setData} />,
    insights: <Insights data={data} />,
    summary: <Summary data={data} score={score} />,
    export: <ExportPanel data={data} score={score} />
  }[activeTab];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>
            <Activity size={19} />
          </span>
          <div>
            <strong>Progress</strong>
            <small>Daily tracker</small>
          </div>
        </div>
        <nav aria-label="Tracker sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                className={activeTab === tab.id ? "active" : ""}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <div className="content">{screen}</div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
