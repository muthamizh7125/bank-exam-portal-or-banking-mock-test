# BankLab — Banking Exam Simulator

**Live website:** https://muthamizh7125.github.io/bank-exam-portal-or-banking-mock-test/

BankLab is a browser-based practice site for banking exam aspirants. It includes a TCS iON-style test interface, sectional timing, question palette, mock paper selection, and review/analytics screens.

## How it is deployed

- The website files live in `bank-exam-portal/`.
- The GitHub Actions workflow at `.github/workflows/pages.yml` publishes that folder to GitHub Pages on updates.
- Static files and question data are served by Pages; no server or paid API is required.

## Main files

- `bank-exam-portal/index.html` — exam interface and UI
- `bank-exam-portal/app.js` — timer, question navigation, scoring and analysis
- `bank-exam-portal/questions_bank.json` — question bank for practice papers
- `bank-exam-portal/styles.css` — interface styling

BankLab is an independent practice project and is not affiliated with SBI or IBPS. Questions are practice material, not official previous-year papers.
