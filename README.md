# AwasSahaay 🏢  "Community Accountability & Tracking Platform"

AwasSahaay is a responsive, gamified, and accountability driven community platform designed for housing society residents, workers, and committee admins (Secretaries, Treasurers). It replaces slow, friction-filled processes with a live updating workspace.

---

## 🌟 Core Features

### 1. 🔒 Anonymous Issue Raising & Details Tracking
* **Anonymous complaints**: Residents can file tickets with a single checkbox toggle (**"Raise this complaint anonymously"**).
* **Identity Guards**: The raiser's profile details and flat number are replaced with `"Anonymous Resident"` and `"Hidden Flat"` across the public feed and logs.
* **Administrative verification**: Committee admins (Secretaries) can view raiser details for verification and coordinating plumber/electrician visits.
* **Detailed complaints card**: A dedicated detail view card displays category, description, and attached photos.

### 2. ⚠️ Role-Based Issue Lifecycle & SLA Control
* **Residents** raise complaints under categories (Water, Electrical, Security, Plumbing, Civil, Other).
* **Committee Admins** assign tickets to specific maintenance staff.
* **Workers** claim tickets, update progress, and upload photo proof of resolution.
* **SLA Threshold Monitoring**: Left unaddressed, issues trigger warning banners based on SLA parameters.
* **Original Raiser Verification**: Closed tickets are reviewed by the raiser to verify satisfaction or dispute/reopen.

### 3. 🏆 Wing/Block Wars Leaderboard
* Dynamic, wing level standings calculated by:
  * Maintenance payment rates (50% weight).
  * SLA complaint resolution speed (30% weight).
  * Neighbor Vibe Score (20% weight).
* Drives cooperative accountability top blocks receive rewards like clubhouse discount rates.

### 4. 🚗 Anonymous Neighbor Nudges
* Allows dispatching template based alerts (Noise 🎵, Parking 🚗, Pets 🐕, Litter 🧹) anonymously.
* Resolving a nudge with an apology restores the target flat's **Vibe Score**, while receiving a nudge decreases it.

### 5. 🛠️ Maintenance Heroes & Gratitude Tipping
* Service workers directory with cumulative ratings, Hero scores, and active claims.
* Verification triggers the option to tip the worker (₹10, ₹20, ₹50) with a simulated **UPI sandbox overlay** containing QR codes.

---

## 📂 Project Structure

To push this repository to GitHub, configure your repository with the exact files present in this directory:

```text
Society App/                    <-- Root Git Folder (Push this folder to GitHub)
├── frontend/                   <-- Next.js Application
│   ├── src/                    <-- App source code (Components, Pages, MockDB)
│   ├── next.config.ts          <-- Next.js Config (App rules, devIndicators)
│   └── package.json            <-- Frontend dependencies
├── backend/                    <-- Database Schema & Migrations folder
│   └── supabase/               
│       └── migrations/         <-- Database migrations SQL file
└── README.md                   <-- Setup & guides document (This file)
```

---

## 🚀 How to Run Locally

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or above)

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if port 3000 is occupied) in your browser.

*Note: In local development, the app utilizes localStorage (`MockDb`). You can swap between Aarav Sharma (Resident), Rajesh Malhotra (Secretary), Ramesh (Plumber), and others instantly using the **Switch Perspective** selector dropdown in the sidebar footer.*

---

## 🔗 Live Database Integration (Supabase)

To connect the application to a live database:
1. Create a free account on [Supabase](https://supabase.com/).
2. Execute the migrations script found in `backend/supabase/migrations/20260705000000_init_schema.sql` inside the SQL Editor.
3. Create a `.env.local` file inside the `frontend/` directory with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_api_key
   ```
   *The application will automatically swap from localStorage to your live Supabase database.*

---




