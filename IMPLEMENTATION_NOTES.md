# Tutova frontend workflow updates

The frontend now includes:

- Direct tutor requests whose subject selector is limited to subjects taught by the selected tutor.
- Generic matching where multiple tutors can express interest and the learner selects one.
- Payment handoff after the learner submits the exact booking; the booking ID is passed to the payment page.
- Agreement review for tutors and learners, including proposed revisions, financial breakdown and commission schedule.
- Tutor and learner/parent progress-report submission.
- Admin progress-report review, request/booking/payment oversight, dispute resolution actions and monthly payout preparation.
- Navigation links for agreements, progress reports, requests and admin oversight.

Run locally after extracting:

```powershell
npm ci
npm run build
```
