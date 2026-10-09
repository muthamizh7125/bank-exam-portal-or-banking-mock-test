# BankExamPro — Banking Exam Simulation & Diagnostic Analytics Platform

An authentic, standalone **TCS iON-style** online mock examination and diagnostic coaching engine designed for **IBPS PO, SBI PO, IBPS Clerk, and RRB** aspirants.

## 1. Quick Start & Execution

This application is delivered as a modular, standalone web application located in this directory:

* **Entry Point:** Open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

* **Zero Dependencies:** Works directly offline via `file://` or hosted on any static hosting service like GitHub Pages, Vercel, or Netlify.

* **Component Architecture:**

  * `index.html`: Main user interface with TCS iON structure, navigation, and modals.

  * `styles.css`: Complete styling rules for the TCS iON theme, 5-color palette, timer, and diagnostic dashboard.

  * `app.js`: Application logic handling timer controllers, 20-min auto-locks, radio state machine, and 4-quadrant analytics calculations.

  * `questions_bank.json`: Structured database containing multiple full-length mock papers with questions, options, benchmarks, and solutions.

## 2. Platform Architecture & Features

### Authentic TCS iON Examination Interface

* **5-Color Interactive Palette:**

  * 🟩 **Answered:** Evaluated in final score.

  * 🟥 **Not Answered:** Visited but skipped.

  * ⬜ **Not Visited:** Not yet viewed.

  * 🟪 **Marked for Review:** Marked for reconsideration (not evaluated).

  * 🟪🟩 **Answered & Marked for Review:** Answered and flagged (evaluated in final score).

* **Strict Sectional Timing Engine:**

  * Strict 20-minute timer lock per section (English $\rightarrow$ Quant $\rightarrow$ Reasoning).

  * Auto-submits and transitions to the next section when the 20 minutes expire.

  * Option to toggle **Practice Mode** for flexible revision across sections.

* **Standard Marking Scheme:** $+1.00$ for correct answers, $-0.25$ negative marking for wrong answers.

## 3. Deep Diagnostic & Time-Analytics Engine

The platform does not merely display a raw score; it diagnoses **time efficiency and tactical decision-making**:

### The 4-Quadrant Matrix

1. 🚨 **Fatal Time Traps (**$>90\text{s}$ **& Incorrect):** Identifies questions where you sank excessive time AND incurred negative penalties. (The #1 reason aspirants miss cut-offs).

2. ⏳ **Inefficient Solves (**$>90\text{s}$ **& Correct):** Questions where your concept was sound, but your method was too slow. Flags areas needing shortcut formulas or approximation.

3. ⚠️ **Careless Mistakes (**$<30\text{s}$ **& Incorrect):** Rushed reading or arithmetic slips. Highlights where calm reading prevents point loss.

4. 🎯 **The Sweet Spot (**$<45\text{s}$ **& Correct):** Your core strength zones demonstrating high velocity and precision.

### Performance Analytics

* **Cutoff Comparison:** Direct benchmark comparison against expected category and sectional cutoffs.

* **Topic-Wise Strength Heatmap:** Tracks accuracy, average solve time, and proficiency rank across Arithmetic, Puzzles, DI, Syllogisms, Reading Comprehension, and more.

* **Filterable Solution Review:** Step-by-step mathematical working, grammatical explanations, and logical puzzle solutions filterable by *All*, *Incorrect*, *Traps*, *Correct*, and *Unattempted*.

## 4. Question Bank Structure & Scaling to 50+ Papers

The platform currently includes full-length, non-repeating 100-question prelims papers with distinct questions:

1. **Paper 1:** IBPS PO Prelims Live Mock 1 (Moderate standard difficulty).

2. **Paper 2:** SBI PO Prelims Live Challenger Mock 2 (High-difficulty arithmetic, complex circular & box puzzles, ESG banking RC).

### Adding Papers (Up to 50+ Papers)

All papers follow a standardized JSON schema stored in `questions_bank.json`. To add **Paper 3 through Paper 50**, add a new entry to the dictionary:

```
"paper_03": {
  "id": "paper_03",
  "title": "IBPS Clerk Prelims Live Speed Drill 3",
  "exam": "IBPS Clerk",
  "difficulty": "Easy to Moderate",
  "cutoff": 74.0,
  "sectional_cutoffs": { "english": 18.0, "quant": 26.0, "reasoning": 28.0 },
  "questions": [
    {
      "id": "Q_01",
      "section": "english",
      "section_name": "English Language",
      "topic": "Reading Comprehension",
      "difficulty": "Moderate",
      "benchmark_seconds": 45,
      "question": "Question text with HTML formatting...",
      "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
      "correct_index": 0,
      "explanation": "Step-by-step solution and reasoning..."
    }
  ]
}

```

The dropdown selector on the top bar automatically detects all registered papers.