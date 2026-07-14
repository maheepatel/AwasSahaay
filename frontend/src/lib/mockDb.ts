// Mock Database Layer for AwasSahaay
// Persisted in localStorage for persistent state across reloads.

export interface Society {
  id: string;
  name: string;
  city: string;
  address: string;
  created_at: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  society_id: string;
  role: 'resident' | 'tenant' | 'secretary' | 'asst_secretary' | 'treasurer' | 'worker';
  flat_number: string;
  is_verified: boolean;
  presence_status: 'online' | 'offline' | 'away';
  last_seen: string;
  vibe_score?: number; // default 100
  hero_points?: number; // default 0 for workers
  cups_of_chai?: number; // default 0 for workers
}

export interface Issue {
  id: string;
  society_id: string;
  raised_by: string; // user_id
  category: 'water' | 'electrical' | 'security' | 'plumbing' | 'civil' | 'other';
  description: string;
  media_urls: string[];
  status: 'raised' | 'assigned' | 'fixing' | 'fixed' | 'verified' | 'reopened';
  assigned_to?: string; // user_id
  escalation_level: number;
  sla_hours: number;
  raised_at: string;
  assigned_at?: string;
  fixed_at?: string;
  verified_at?: string;
  verified_by?: string; // user_id
  proof_media_urls: string[];
  rating?: number; // 1-5 stars
  tip_amount?: number; // UPI micro-tip in Rupees
  is_anonymous?: boolean;
}

export interface IssueActivityLog {
  id: string;
  issue_id: string;
  actor_id: string; // user_id
  action: string;
  note?: string;
  created_at: string;
}

export interface Alert {
  id: string;
  society_id: string;
  posted_by: string; // user_id
  message: string;
  severity: 'critical' | 'caution' | 'info';
  photo_url?: string;
  status: 'active' | 'resolved' | 'expired';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  reacts?: string[]; // user_ids who reacted +1
}

export interface Announcement {
  id: string;
  society_id: string;
  posted_by: string; // user_id
  content: string;
  created_at: string;
}

export interface FeedbackItem {
  id: string;
  posted_by: string;
  category: string;
  comment: string;
  created_at: string;
  reacts?: string[]; // user_ids who reacted +1
}

export interface Nudge {
  id: string;
  society_id: string;
  target_flat: string;
  category: 'noise' | 'parking' | 'pet' | 'other';
  message: string;
  created_at: string;
  status: 'active' | 'resolved';
}

// Default Seed Data
const DEFAULT_SOCIETIES: Society[] = [
  {
    id: "soc-orchid-heights",
    name: "Orchid Heights Phase 1",
    city: "Bangalore",
    address: "Outer Ring Road, Bellandur, Bengaluru, Karnataka 560103",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "soc-palm-meadows",
    name: "Palm Meadows",
    city: "Gurgaon",
    address: "Sector 54, Golf Course Road, Gurugram, Haryana 122011",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: "usr-me",
    phone: "+919876543210",
    name: "Aarav Sharma",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr-secretary",
    phone: "+919999999999",
    name: "Rajesh Malhotra",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr-treasurer",
    phone: "+918888888888",
    name: "Komal Mehta",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr-resident1",
    phone: "+917777777777",
    name: "Vikram Sen",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "usr-tenant1",
    phone: "+916666666666",
    name: "Divya Patel",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  // Vendors/Workers
  {
    id: "usr-plumber",
    phone: "+919000000001",
    name: "Ramesh (Plumbing Vendor)",
    avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "usr-electrician",
    phone: "+919000000002",
    name: "Suresh (Electrical Vendor)",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "usr-gardener",
    phone: "+919000000003",
    name: "Mahesh (Gardening Service)",
    avatar_url: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "usr-lifttech",
    phone: "+919000000004",
    name: "Ravi (Lift Operator)",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date().toISOString()
  },
  {
    id: "usr-securityhead",
    phone: "+919000000005",
    name: "Karan (Security In-Charge)",
    avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date().toISOString()
  },
  // Unverified Resident
  {
    id: "usr-unverified",
    phone: "+917777700001",
    name: "Amit Deshmukh",
    avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_MEMBERSHIPS: Membership[] = [
  {
    id: "mem-1",
    user_id: "usr-me",
    society_id: "soc-orchid-heights",
    role: "resident",
    flat_number: "Block A - 504",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    vibe_score: 95
  },
  {
    id: "mem-2",
    user_id: "usr-secretary",
    society_id: "soc-orchid-heights",
    role: "secretary",
    flat_number: "Block B - 1002",
    is_verified: true,
    presence_status: "away",
    last_seen: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    vibe_score: 100
  },
  {
    id: "mem-3",
    user_id: "usr-treasurer",
    society_id: "soc-orchid-heights",
    role: "treasurer",
    flat_number: "Block C - 301",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    vibe_score: 98
  },
  {
    id: "mem-4",
    user_id: "usr-resident1",
    society_id: "soc-orchid-heights",
    role: "resident",
    flat_number: "Block B - 402",
    is_verified: true,
    presence_status: "offline",
    last_seen: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    vibe_score: 85
  },
  {
    id: "mem-5",
    user_id: "usr-tenant1",
    society_id: "soc-orchid-heights",
    role: "tenant",
    flat_number: "Block A - 208",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    vibe_score: 90
  },
  // Vendors/Workers
  {
    id: "mem-plumber",
    user_id: "usr-plumber",
    society_id: "soc-orchid-heights",
    role: "worker",
    flat_number: "Plumbing Services Office",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    hero_points: 35,
    cups_of_chai: 6
  },
  {
    id: "mem-electrician",
    user_id: "usr-electrician",
    society_id: "soc-orchid-heights",
    role: "worker",
    flat_number: "Electrical Services Office",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    hero_points: 20,
    cups_of_chai: 3
  },
  {
    id: "mem-gardener",
    user_id: "usr-gardener",
    society_id: "soc-orchid-heights",
    role: "worker",
    flat_number: "Gardening & Landscape Wing",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    hero_points: 15,
    cups_of_chai: 1
  },
  {
    id: "mem-lifttech",
    user_id: "usr-lifttech",
    society_id: "soc-orchid-heights",
    role: "worker",
    flat_number: "Elevator Control Room",
    is_verified: true,
    presence_status: "away",
    last_seen: new Date().toISOString(),
    hero_points: 25,
    cups_of_chai: 4
  },
  {
    id: "mem-securityhead",
    user_id: "usr-securityhead",
    society_id: "soc-orchid-heights",
    role: "worker",
    flat_number: "Main Gate Security Cabin",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    hero_points: 40,
    cups_of_chai: 8
  },
  // Unverified Resident
  {
    id: "mem-unverified",
    user_id: "usr-unverified",
    society_id: "soc-orchid-heights",
    role: "resident",
    flat_number: "Block B - 1104",
    is_verified: false,
    presence_status: "offline",
    last_seen: new Date().toISOString(),
    vibe_score: 100
  },
  // Membership on Second Society
  {
    id: "mem-6",
    user_id: "usr-me",
    society_id: "soc-palm-meadows",
    role: "tenant",
    flat_number: "Tower C - 1502",
    is_verified: true,
    presence_status: "online",
    last_seen: new Date().toISOString(),
    vibe_score: 100
  }
];

const DEFAULT_ALERTS: Alert[] = [
  {
    id: "al-1",
    society_id: "soc-orchid-heights",
    posted_by: "usr-secretary",
    message: "No electricity in Block A garden area due to cable fault. Expected resolution: 6 PM today.",
    severity: "caution",
    status: "active",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reacts: ["usr-resident1", "usr-tenant1"]
  },
  {
    id: "al-2",
    society_id: "soc-orchid-heights",
    posted_by: "usr-me",
    message: "Stray dog/monkey seen near Block B elevator lobby. Please guard children.",
    severity: "critical",
    status: "active",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reacts: ["usr-secretary"]
  },
  {
    id: "al-3",
    society_id: "soc-orchid-heights",
    posted_by: "usr-treasurer",
    message: "Water tanker service booked for tomorrow morning. Minor water pressure fluctuation expected.",
    severity: "info",
    status: "active",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reacts: []
  }
];

const DEFAULT_ISSUES: Issue[] = [
  {
    id: "iss-1",
    society_id: "soc-orchid-heights",
    raised_by: "usr-resident1",
    category: "plumbing",
    description: "Main line water valve leakage in Block B stairwell. Water is pooling near the lift lobby. High wastage.",
    media_urls: ["https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80"],
    status: "assigned",
    assigned_to: "usr-plumber",
    escalation_level: 0,
    sla_hours: 48,
    raised_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    assigned_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(),
    proof_media_urls: []
  },
  {
    id: "iss-2",
    society_id: "soc-orchid-heights",
    raised_by: "usr-tenant1",
    category: "electrical",
    description: "Corridor lights flickering in Block A 2nd floor. It gets extremely dark after 7 PM.",
    media_urls: [],
    status: "raised",
    escalation_level: 0,
    sla_hours: 48,
    raised_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    proof_media_urls: []
  },
  {
    id: "iss-3",
    society_id: "soc-orchid-heights",
    raised_by: "usr-me",
    category: "security",
    description: "Rear boundary gate lock broken. Security guard not present at night shift. Gate is wide open.",
    media_urls: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"],
    status: "reopened",
    assigned_to: "usr-treasurer",
    escalation_level: 1,
    sla_hours: 24,
    raised_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    proof_media_urls: []
  }
];

const DEFAULT_LOGS: IssueActivityLog[] = [
  {
    id: "log-1",
    issue_id: "iss-1",
    actor_id: "usr-resident1",
    action: "raised",
    note: "Complaint submitted regarding valve leakage.",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "log-2",
    issue_id: "iss-1",
    actor_id: "usr-secretary",
    action: "assigned",
    note: "Assigned to Ramesh (Plumber).",
    created_at: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "log-3",
    issue_id: "iss-3",
    actor_id: "usr-me",
    action: "raised",
    note: "Raised security hazard.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "log-4",
    issue_id: "iss-3",
    actor_id: "usr-treasurer",
    action: "assigned",
    note: "Assigned to Komal Mehta.",
    created_at: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "log-5",
    issue_id: "iss-3",
    actor_id: "usr-treasurer",
    action: "fixed",
    note: "Lock temporary padlocked. Guard briefed.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "log-6",
    issue_id: "iss-3",
    actor_id: "usr-me",
    action: "reopened",
    note: "Lock broken again. Padlock key missing. Please fit standard deadbolt.",
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-1",
    society_id: "soc-orchid-heights",
    posted_by: "usr-secretary",
    content: "Annual General Body Meeting (AGM) scheduled for Sunday, July 12th, 10:30 AM at Clubhouse. Agenda: Lift renewal & security system upgrade proposal. Attendance mandatory.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ann-2",
    society_id: "soc-orchid-heights",
    posted_by: "usr-treasurer",
    content: "Maintenance dues invoice for Q3 (Jul - Sep) generated. Late fees applied post July 15th. Please pay via your UPI apps or contact office.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const DEFAULT_NUDGES: Nudge[] = [
  {
    id: "ndg-1",
    society_id: "soc-orchid-heights",
    target_flat: "Block A - 504",
    category: "noise",
    message: "Loud music playing after hours. Please keep it down.",
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    status: "active"
  }
];

const getStored = <T>(key: string, def: T): T => {
  if (typeof window === 'undefined') return def;
  const val = localStorage.getItem(key);
  if (!val) return def;
  
  try {
    const parsed = JSON.parse(val);
    
    // Auto-merge seeded workers and members to bypass development local storage cache!
    if (key === 'db_users' && Array.isArray(parsed)) {
      const defaultList = def as any[];
      let merged = [...parsed];
      let changed = false;
      defaultList.forEach(defU => {
        if (!merged.some(u => u.id === defU.id)) {
          merged.push(defU);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(key, JSON.stringify(merged));
      }
      return merged as any;
    }
    
    if (key === 'db_memberships' && Array.isArray(parsed)) {
      const defaultList = def as any[];
      let merged = [...parsed];
      let changed = false;
      defaultList.forEach(defM => {
        if (!merged.some(m => m.id === defM.id)) {
          merged.push(defM);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem(key, JSON.stringify(merged));
      }
      return merged as any;
    }
    
    return parsed;
  } catch (e) {
    return def;
  }
};

const setStored = <T>(key: string, val: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(val));
  }
};

export class MockDb {
  static get societies(): Society[] { return getStored('db_societies', DEFAULT_SOCIETIES); }
  static get users(): User[] { return getStored('db_users', DEFAULT_USERS); }
  static get memberships(): Membership[] { return getStored('db_memberships', DEFAULT_MEMBERSHIPS); }
  static get alerts(): Alert[] { return getStored('db_alerts', DEFAULT_ALERTS); }
  static get issues(): Issue[] { return getStored('db_issues', DEFAULT_ISSUES); }
  static get logs(): IssueActivityLog[] { return getStored('db_logs', DEFAULT_LOGS); }
  static get announcements(): Announcement[] { return getStored('db_announcements', DEFAULT_ANNOUNCEMENTS); }
  static get nudges(): Nudge[] { return getStored('db_nudges', DEFAULT_NUDGES); }

  // Setters
  static set societies(v) { setStored('db_societies', v); }
  static set users(v) { setStored('db_users', v); }
  static set memberships(v) { setStored('db_memberships', v); }
  static set alerts(v) { setStored('db_alerts', v); }
  static set issues(v) { setStored('db_issues', v); }
  static set logs(v) { setStored('db_logs', v); }
  static set announcements(v) { setStored('db_announcements', v); }
  static set nudges(v) { setStored('db_nudges', v); }

  // Actions
  static getActiveUser(): User {
    const defaultUser = DEFAULT_USERS[0];
    const loggedInId = typeof window !== 'undefined' ? localStorage.getItem('db_logged_in_user_id') : null;
    return this.users.find(u => u.id === loggedInId) || defaultUser;
  }

  static setActiveUser(userId: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('db_logged_in_user_id', userId);
    }
  }

  static getUserMembership(userId: string, societyId: string): Membership | undefined {
    return this.memberships.find(m => m.user_id === userId && m.society_id === societyId);
  }

  static addIssue(issue: Omit<Issue, 'id' | 'raised_at' | 'status' | 'escalation_level' | 'proof_media_urls'>) {
    const list = this.issues;
    const newIssue: Issue = {
      ...issue,
      id: 'iss-' + Math.random().toString(36).substr(2, 9),
      status: 'raised',
      escalation_level: 0,
      raised_at: new Date().toISOString(),
      proof_media_urls: []
    };
    list.unshift(newIssue);
    this.issues = list;

    // Add log
    this.addLog(newIssue.id, issue.raised_by, 'raised', 'Issue raised by Resident');
    return newIssue;
  }

  static updateIssueStatus(issueId: string, status: Issue['status'], actorId: string, note?: string, proofUrls: string[] = [], assignedTo?: string) {
    const list = this.issues;
    const idx = list.findIndex(i => i.id === issueId);
    if (idx === -1) return;

    const issue = list[idx];
    issue.status = status;

    if (status === 'assigned') {
      issue.assigned_at = new Date().toISOString();
      issue.assigned_to = assignedTo || actorId;
    } else if (status === 'fixed') {
      issue.fixed_at = new Date().toISOString();
      issue.proof_media_urls = proofUrls;
    } else if (status === 'verified') {
      issue.verified_at = new Date().toISOString();
      issue.verified_by = actorId;
    } else if (status === 'reopened') {
      issue.fixed_at = undefined;
      issue.proof_media_urls = [];
    }

    list[idx] = issue;
    this.issues = list;

    this.addLog(issueId, actorId, status, note);
  }

  static rateAndCloseIssue(issueId: string, rating: number, tipAmount: number, actorId: string, note?: string) {
    const list = this.issues;
    const idx = list.findIndex(i => i.id === issueId);
    if (idx === -1) return;

    const issue = list[idx];
    issue.status = 'verified';
    issue.verified_at = new Date().toISOString();
    issue.verified_by = actorId;
    issue.rating = rating;
    issue.tip_amount = tipAmount;

    list[idx] = issue;
    this.issues = list;

    // Increment worker points/chai if assigned
    if (issue.assigned_to) {
      const mems = this.memberships;
      const mIdx = mems.findIndex(m => m.user_id === issue.assigned_to && m.society_id === issue.society_id);
      if (mIdx !== -1) {
        mems[mIdx].hero_points = (mems[mIdx].hero_points || 0) + (rating * 5);
        if (tipAmount > 0) {
          mems[mIdx].cups_of_chai = (mems[mIdx].cups_of_chai || 0) + 1;
        }
        this.memberships = mems;
      }
    }

    this.addLog(issueId, actorId, 'verified', note || `Issue verified and closed. Rated ${rating} stars. Tip: ₹${tipAmount}`);
  }

  static addLog(issueId: string, actorId: string, action: string, note?: string) {
    const list = this.logs;
    const newLog: IssueActivityLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      issue_id: issueId,
      actor_id: actorId,
      action,
      note,
      created_at: new Date().toISOString()
    };
    list.push(newLog);
    this.logs = list;
  }

  static addAlert(alert: Omit<Alert, 'id' | 'created_at' | 'status'>) {
    const list = this.alerts;
    const newAlert: Alert = {
      ...alert,
      id: 'al-' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      created_at: new Date().toISOString(),
      reacts: []
    };
    list.unshift(newAlert);
    this.alerts = list;
    return newAlert;
  }

  static resolveAlert(alertId: string, userId: string) {
    const list = this.alerts;
    const idx = list.findIndex(a => a.id === alertId);
    if (idx === -1) return;

    list[idx].status = 'resolved';
    list[idx].resolved_at = new Date().toISOString();
    list[idx].resolved_by = userId;
    this.alerts = list;
  }

  static toggleAlertReact(alertId: string, userId: string) {
    const list = this.alerts;
    const idx = list.findIndex(a => a.id === alertId);
    if (idx === -1) return;

    const alert = list[idx];
    if (!alert.reacts) alert.reacts = [];

    const reactIdx = alert.reacts.indexOf(userId);
    if (reactIdx === -1) {
      alert.reacts.push(userId);
    } else {
      alert.reacts.splice(reactIdx, 1);
    }

    list[idx] = alert;
    this.alerts = list;
  }

  static toggleFeedbackReact(societyId: string, feedbackId: string, userId: string) {
    if (typeof window === 'undefined') return;
    const key = `db_feedback_${societyId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return;

    const list: FeedbackItem[] = JSON.parse(stored);
    const idx = list.findIndex(f => f.id === feedbackId);
    if (idx === -1) return;

    const item = list[idx];
    if (!item.reacts) item.reacts = [];

    const reactIdx = item.reacts.indexOf(userId);
    if (reactIdx === -1) {
      item.reacts.push(userId);
    } else {
      item.reacts.splice(reactIdx, 1);
    }

    list[idx] = item;
    localStorage.setItem(key, JSON.stringify(list));
  }

  static verifyMembership(membershipId: string) {
    const list = this.memberships;
    const idx = list.findIndex(m => m.id === membershipId);
    if (idx === -1) return;

    list[idx].is_verified = true;
    this.memberships = list;
  }

  static addMembership(user: Omit<User, 'id' | 'created_at'>, membership: Omit<Membership, 'id' | 'user_id' | 'society_id' | 'is_verified' | 'last_seen'>, societyId: string) {
    const uList = this.users;
    const uId = 'usr-' + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      ...user,
      id: uId,
      created_at: new Date().toISOString()
    };
    uList.push(newUser);
    this.users = uList;

    const mList = this.memberships;
    const newMem: Membership = {
      ...membership,
      id: 'mem-' + Math.random().toString(36).substr(2, 9),
      user_id: uId,
      society_id: societyId,
      is_verified: true, // directly verified by admin!
      last_seen: new Date().toISOString(),
      vibe_score: 100
    };
    mList.push(newMem);
    this.memberships = mList;
    return newMem;
  }

  // Nudge Actions
  static sendNudge(societyId: string, targetFlat: string, category: Nudge['category'], message: string) {
    const list = this.nudges;
    const newNudge: Nudge = {
      id: 'ndg-' + Math.random().toString(36).substr(2, 9),
      society_id: societyId,
      target_flat: targetFlat,
      category,
      message,
      created_at: new Date().toISOString(),
      status: 'active'
    };
    list.unshift(newNudge);
    this.nudges = list;

    // Reduce target flat's vibe score (by 5 points, minimum 50)
    const mems = this.memberships;
    const targetMems = mems.filter(m => m.society_id === societyId && m.flat_number.toLowerCase() === targetFlat.toLowerCase());
    targetMems.forEach(m => {
      const idx = mems.findIndex(item => item.id === m.id);
      if (idx !== -1) {
        const curScore = mems[idx].vibe_score ?? 100;
        mems[idx].vibe_score = Math.max(50, curScore - 5);
      }
    });
    this.memberships = mems;
    return newNudge;
  }

  static resolveNudge(nudgeId: string, societyId: string) {
    const list = this.nudges;
    const idx = list.findIndex(n => n.id === nudgeId);
    if (idx === -1) return;

    list[idx].status = 'resolved';
    this.nudges = list;

    // Restore vibe score slightly (by 3 points, maximum 100)
    const nudge = list[idx];
    const mems = this.memberships;
    const targetMems = mems.filter(m => m.society_id === societyId && m.flat_number.toLowerCase() === nudge.target_flat.toLowerCase());
    targetMems.forEach(m => {
      const mIdx = mems.findIndex(item => item.id === m.id);
      if (mIdx !== -1) {
        const curScore = mems[mIdx].vibe_score ?? 100;
        mems[mIdx].vibe_score = Math.min(100, curScore + 3);
      }
    });
    this.memberships = mems;
  }

  // Block Wars dynamic metrics calculation
  static getBlockLeaderboard(societyId: string) {
    // Generate scores for Block A, Block B, Block C
    // Scoring formula: (On-time payment percentage * 0.5) + (Resolutions Ratio * 0.3) + (Average Vibe * 0.2)
    const mems = this.memberships.filter(m => m.society_id === societyId);
    const iss = this.issues.filter(i => i.society_id === societyId);

    const blocks = ['Block A', 'Block B', 'Block C'];

    return blocks.map(block => {
      const blockMems = mems.filter(m => m.flat_number.startsWith(block));
      const blockUsers = blockMems.map(m => m.user_id);
      const blockIssues = iss.filter(i => blockUsers.includes(i.raised_by));

      // Calculate Vibe
      const avgVibe = blockMems.length > 0 
        ? Math.round(blockMems.reduce((acc, m) => acc + (m.vibe_score ?? 100), 0) / blockMems.length)
        : 100;

      // Calculate Issues resolution rate
      const totalIssues = blockIssues.length;
      const resolvedIssues = blockIssues.filter(i => i.status === 'verified').length;
      const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 80; // default to 80 if no issues

      // Mock payment rate based on block names for initial seeding variety
      let paymentRate = 90;
      if (block === 'Block A') paymentRate = 95;
      if (block === 'Block B') paymentRate = 82;
      if (block === 'Block C') paymentRate = 88;

      const score = Math.round((paymentRate * 0.5) + (resolutionRate * 0.3) + (avgVibe * 0.2));

      return {
        block,
        score,
        paymentRate,
        resolutionRate: Math.round(resolutionRate),
        avgVibe
      };
    }).sort((a, b) => b.score - a.score);
  }
}
