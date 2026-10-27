# SANSHIN NIHON Caregiver Examination App (三振日本 介護特定技能 評価試験)

Official web portal and examination platform for the SANSHIN NIHON Caregiver Examination training curriculum.

---

## 📋 Included Examinations

1. **TEST 01**: 介護特定技能 評価試験 模擬試験 01
   - Total Questions: 45 Japanese questions with full furigana
   - Duration: 60 minutes timed
   - Passing Threshold: 27 / 45 marks (60%)
   - Categories: Dignity & Independence Support, Understanding of Mind and Body, Communication, Caregiving Techniques

2. **TEST 02 (1st lesson)**: 介護特定技能評価試験 第1レッスン確認テスト
   - Total Questions: 46 verified Japanese questions with full furigana
   - Duration: 60 minutes timed
   - Passing Threshold: 40 / 46 marks (86.96% 合格基準)
   - Categories:
     - 介護の基本 (13 questions: 問1～問13)
     - こころとからだのしくみ (13 questions: 問1～問13)
     - 生活支援技術 (12 questions: 問1～問12)
     - 医療的ケア・多職種連携 (8 questions: 問1～問8)

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 + Tailwind CSS 4
- **Backend & Database**: Firebase Authentication + Cloud Firestore
- **Deployment Platform**: Netlify (or any modern static web host)

---

## 🚀 Netlify Deployment Guide

### Option 1: Deploy with Git (Recommended)

1. Extract the ZIP file and push the project to a GitHub, GitLab, or Bitbucket repository.
2. Sign in to [Netlify](https://app.netlify.com/).
3. Click **"Add new site"** > **"Import an existing project"**.
4. Select your Git repository.
5. Netlify will automatically detect the settings from `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**.

### Option 2: Direct Deploy via Drag & Drop

1. Extract the project ZIP to your local computer.
2. Open your terminal in the extracted folder and run:
   ```bash
   npm install
   npm run build
   ```
3. In [Netlify Dashboard](https://app.netlify.com/drop), drag and drop the generated `dist` folder.

---

## 🔐 Firebase Authentication Setup (Authorized Domains)

After deploying to Netlify, your site will receive a URL such as `https://your-site-name.netlify.app`.

To enable Firebase Authentication (Google Sign-In, Email/Password):
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (`gen-lang-client-0518144266`).
3. Navigate to **Authentication** > **Settings** > **Authorized domains**.
4. Click **"Add domain"** and enter your Netlify domain (e.g., `your-site-name.netlify.app`).
5. Save.

---

## 📁 Project Structure

```
├── firebase-applet-config.json  # Firebase client credentials (bundled by Vite)
├── firestore.rules              # Firebase Security Rules reference
├── index.html                   # HTML entry point
├── netlify.toml                 # Netlify build configuration & SPA redirects
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Deterministic dependency lockfile
├── public/
│   └── _redirects              # Netlify SPA fallback redirect rule
├── src/
│   ├── components/              # Student Portal, Admin Portal, Charts, Auth
│   ├── data/                    # Examination datasets (Test 01 & Test 02)
│   ├── lib/                     # Firebase client initialization
│   ├── services/                # Real-time Firestore auth & exam services
│   └── types/                   # TypeScript interfaces & definitions
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration
```
