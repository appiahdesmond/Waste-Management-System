import { useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  CreditCard,
  Truck,
  LogOut,
  Bell,
  ChevronDown,
  Edit2,
  RefreshCw,
  Plus,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  X,
  Save,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role =
  | "managing_director"
  | "account_manager"
  | "driver"
  | "client"
  | "operation_manager";

type Page =
  | "dashboard"
  | "scheduling"
  | "scheduling_preview"
  | "reports"
  | "user_management"
  | "payment_activities"
  | "make_payment"
  | "payment_review"
  | "settings";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
}

interface ScheduleEntry {
  id: number;
  client: string;
  driver: string;
  date: string;
  day: string;
  time: string;
  zone: string;
  status: "scheduled" | "completed" | "pending" | "cancelled";
}

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  joined: string;
}

type AuthUser = { username: string; role: Role; name: string } | null;

const MOCK_USERS: { username: string; password: string; role: Role; name: string }[] = [
  { username: "admin", password: "admin123", role: "managing_director", name: "Kwame Asante" },
  { username: "accounts", password: "acct123", role: "account_manager", name: "Abena Frimpong" },
  { username: "driver1", password: "drive123", role: "driver", name: "Kweku Asante" },
  { username: "client1", password: "client123", role: "client", name: "Akosua Mensah" },
  { username: "ops", password: "ops123", role: "operation_manager", name: "Yaw Darko" },
];

import { useEffect, createContext, useContext, useRef } from "react";

const AuthContext = createContext<{
  user: AuthUser;
  signIn: (username: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => void;
  switchRole?: (role: Role) => void;
} | null>(null);

function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const raw = localStorage.getItem("wastegh_user");
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("wastegh_user", JSON.stringify(user));
    else localStorage.removeItem("wastegh_user");
  }, [user]);

  const signIn = async (username: string, password: string) => {
    const found = MOCK_USERS.find((u) => u.username === username && u.password === password);
    if (!found) return { ok: false, message: "Invalid credentials" };
    const authUser: AuthUser = { username: found.username, role: found.role, name: found.name };
    setUser(authUser);
    return { ok: true };
  };

  const signOut = () => setUser(null);

  const switchRole = (role: Role) => setUser((prev) => (prev ? { ...prev, role } : prev));

  return <AuthContext.Provider value={{ user, signIn, signOut, switchRole }}>{children}</AuthContext.Provider>;
}

export { AuthProvider };

function LoginBox() {
  const authCtx = useContext(AuthContext)!;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    const res = await authCtx.signIn(username.trim(), password);
    if (!res.ok) setErr(res.message ?? "Unable to sign in");
  };

  return (
    <div>
      <div className="space-y-3">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none" />
        {err && <p className="text-xs text-red-600">{err}</p>}
        <div className="flex gap-3">
          <button onClick={onSubmit} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium">Sign in</button>
          <button onClick={() => { setUsername(""); setPassword(""); }} className="flex-1 h-10 rounded-lg border border-border text-sm">Clear</button>
        </div>
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Demo users: admin/admin123 · accounts/acct123 · driver1/drive123 · client1/client123 · ops/ops123
      </div>
    </div>
  );
}

// ── Static Data ───────────────────────────────────────────────────────────────

const ROLES: { id: Role; label: string; color: string; initials: string }[] = [
  { id: "managing_director", label: "Managing Director", color: "#15803d", initials: "MD" },
  { id: "account_manager", label: "Account Manager", color: "#1d4ed8", initials: "AM" },
  { id: "driver", label: "Driver", color: "#b45309", initials: "DR" },
  { id: "client", label: "Client", color: "#7c3aed", initials: "CL" },
  { id: "operation_manager", label: "Operation Manager", color: "#0e7490", initials: "OM" },
];

const ROLE_NAMES: Record<Role, string> = {
  managing_director: "Managing Director",
  account_manager: "Account Manager",
  driver: "Driver",
  client: "Client",
  operation_manager: "Operation Manager",
};

const NAV_CONFIG: Record<Role, NavItem[]> = {
  managing_director: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "scheduling", label: "Scheduling", icon: <Calendar size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
    { id: "user_management", label: "User Management", icon: <Users size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  account_manager: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
    { id: "payment_activities", label: "Payment Activities", icon: <CreditCard size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  driver: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "scheduling_preview", label: "Schedule", icon: <Calendar size={18} /> },
    { id: "payment_review", label: "Payment Review", icon: <CreditCard size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  client: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "make_payment", label: "Make Payment", icon: <CreditCard size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
  operation_manager: [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "scheduling", label: "Scheduling", icon: <Calendar size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings size={18} /> },
  ],
};

const SCHEDULE_DATA: ScheduleEntry[] = [
  { id: 1, client: "Akosua Mensah", driver: "Kweku Asante", date: "2026-06-18", day: "Thursday", time: "08:00 AM", zone: "Zone A", status: "scheduled" },
  { id: 2, client: "Kofi Adu", driver: "Emmanuel Boateng", date: "2026-06-19", day: "Friday", time: "09:30 AM", zone: "Zone B", status: "scheduled" },
  { id: 3, client: "Abena Owusu", driver: "Samuel Darko", date: "2026-06-20", day: "Saturday", time: "07:00 AM", zone: "Zone C", status: "pending" },
  { id: 4, client: "Yaw Amponsah", driver: "Kweku Asante", date: "2026-06-16", day: "Monday", time: "10:00 AM", zone: "Zone A", status: "completed" },
  { id: 5, client: "Esi Barimah", driver: "Emmanuel Boateng", date: "2026-06-17", day: "Tuesday", time: "11:00 AM", zone: "Zone D", status: "scheduled" },
  { id: 6, client: "Nana Amoah", driver: "Samuel Darko", date: "2026-06-16", day: "Monday", time: "08:30 AM", zone: "Zone B", status: "cancelled" },
];

const USERS_DATA: User[] = [
  { id: 1, name: "Kwame Asante", role: "Managing Director", email: "kwame.asante@wastegh.com", phone: "+233 24 111 2233", status: "active", joined: "2024-01-10" },
  { id: 2, name: "Abena Frimpong", role: "Account Manager", email: "abena.frimpong@wastegh.com", phone: "+233 20 445 6677", status: "active", joined: "2024-03-15" },
  { id: 3, name: "Kweku Asante", role: "Driver", email: "kweku.asante@wastegh.com", phone: "+233 54 778 9900", status: "active", joined: "2024-05-01" },
  { id: 4, name: "Akosua Mensah", role: "Client", email: "akosua.mensah@gmail.com", phone: "+233 27 332 1100", status: "active", joined: "2025-01-20" },
  { id: 5, name: "Yaw Darko", role: "Operation Manager", email: "yaw.darko@wastegh.com", phone: "+233 24 556 8899", status: "active", joined: "2024-02-28" },
  { id: 6, name: "Esi Barimah", role: "Client", email: "esi.barimah@gmail.com", phone: "+233 20 123 4567", status: "inactive", joined: "2025-03-10" },
  { id: 7, name: "Emmanuel Boateng", role: "Driver", email: "e.boateng@wastegh.com", phone: "+233 54 234 5678", status: "active", joined: "2024-07-15" },
];

const CLIENTS_LIST = ["Akosua Mensah", "Kofi Adu", "Abena Owusu", "Yaw Amponsah", "Esi Barimah", "Nana Amoah", "Paa Kwesi Ankrah"];

const TREND_DATA = [
  { month: "Jan", collections: 320, revenue: 28400 },
  { month: "Feb", collections: 288, revenue: 25100 },
  { month: "Mar", collections: 412, revenue: 36800 },
  { month: "Apr", collections: 380, revenue: 34200 },
  { month: "May", collections: 455, revenue: 41600 },
  { month: "Jun", collections: 398, revenue: 37900 },
];

const ZONE_DATA = [
  { name: "Zone A", value: 34, color: "#15803d" },
  { name: "Zone B", value: 28, color: "#16a34a" },
  { name: "Zone C", value: 22, color: "#4ade80" },
  { name: "Zone D", value: 16, color: "#86efac" },
];

const PAYMENT_DATA = [
  { id: "PAY-001", client: "Akosua Mensah", amount: "GHS 450.00", date: "2026-06-14", method: "Mobile Money", status: "completed" },
  { id: "PAY-002", client: "Kofi Adu", amount: "GHS 320.00", date: "2026-06-13", method: "Bank Transfer", status: "completed" },
  { id: "PAY-003", client: "Abena Owusu", amount: "GHS 275.00", date: "2026-06-12", method: "Mobile Money", status: "pending" },
  { id: "PAY-004", client: "Yaw Amponsah", amount: "GHS 510.00", date: "2026-06-11", method: "Cash", status: "completed" },
  { id: "PAY-005", client: "Esi Barimah", amount: "GHS 390.00", date: "2026-06-10", method: "Mobile Money", status: "failed" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
  active: "bg-green-50 text-green-700 border border-green-200",
  inactive: "bg-gray-100 text-gray-500 border border-gray-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono ${statusColors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({
  title,
  value,
  sub,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  sub: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} style={{ backgroundColor: color }}>
          {icon}
        </div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-mono font-medium ${trend === "up" ? "text-green-600" : "text-red-500"}`}>
            {trend === "up" ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {trend === "up" ? "+8.2%" : "-3.1%"}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground font-display">{value}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

// ── Pages ─────────────────────────────────────────────────────────────────────

function DashboardPage({ role, onNavigate }: { role: Role; onNavigate?: (page: Page) => void }) {
  const isMD = role === "managing_director";
  const isOM = role === "operation_manager";
  const isAM = role === "account_manager";
  const isDriver = role === "driver";
  const isClient = role === "client";
  
  // Greeting based on time
  
   const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
     };
  
  // Role label mapping
  
  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "managing_director":
        return "Director";
      case "operation_manager":
        return "Operations Manager";
      case "account_manager":
        return "Account Manager";
      case "driver":
        return "Driver";
      case "client":
        return "Client";
      default:
        return "User";
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {getGreeting()}, {getRoleLabel(role)} 👋 — here is what's happening today.
        </p>
      </div>

      {/* Quick actions based on role */}
      <div className="flex items-center gap-3">
        {isMD && (
          <>
            <button onClick={() => onNavigate ? onNavigate("user_management") : alert("Navigate: user_management")} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Manage Users</button>
            <button onClick={() => onNavigate ? onNavigate("reports") : alert("Navigate: reports")} className="px-3 py-2 rounded-lg border border-border text-sm">Create Report</button>
          </>
        )}
        {isOM && (
          <>
            <button onClick={() => onNavigate ? onNavigate("scheduling") : alert("Navigate: scheduling")} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Open Scheduling</button>
            <button onClick={() => alert("Reviewing operational metrics...")} className="px-3 py-2 rounded-lg border border-border text-sm">Ops Metrics</button>
          </>
        )}
        {isAM && (
          <>
            <button onClick={() => onNavigate ? onNavigate("payment_activities") : alert("Navigate: payment_activities")} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Payments</button>
            <button onClick={() => alert("Exporting financial report...")} className="px-3 py-2 rounded-lg border border-border text-sm">Export Report</button>
          </>
        )}
        {isDriver && (
          <>
            <button onClick={() => onNavigate ? onNavigate("scheduling_preview") : alert("Navigate: scheduling_preview")} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">My Schedule</button>
            <button onClick={() => alert("Marking pickup complete...")} className="px-3 py-2 rounded-lg border border-border text-sm">Mark Pickup</button>
          </>
        )}
        {isClient && (
          <>
            <button onClick={() => onNavigate ? onNavigate("make_payment") : alert("Navigate: make_payment")} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">Make Payment</button>
            <button onClick={() => alert("Viewing invoices...")} className="px-3 py-2 rounded-lg border border-border text-sm">Invoices</button>
          </>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(isMD || isOM) && (
          <>
            <StatCard title="Total Collections" value="1,842" sub="This month" trend="up" icon={<Package size={18} />} color="#15803d" />
            <StatCard title="Active Drivers" value="24" sub="3 on leave" icon={<Truck size={18} />} color="#1d4ed8" />
            <StatCard title="Pending Pickups" value="67" sub="Due today" trend="down" icon={<Clock size={18} />} color="#b45309" />
            <StatCard title="Zones Covered" value="8 / 12" sub="Active zones" icon={<CheckCircle size={18} />} color="#0e7490" />
          </>
        )}
        {isAM && (
          <>
            <StatCard title="Total Revenue" value="GHS 184,200" sub="This month" trend="up" icon={<TrendingUp size={18} />} color="#15803d" />
            <StatCard title="Payments Received" value="312" sub="Transactions" icon={<CreditCard size={18} />} color="#1d4ed8" />
            <StatCard title="Pending Payments" value="28" sub="Awaiting clearance" trend="down" icon={<Clock size={18} />} color="#b45309" />
            <StatCard title="Active Clients" value="540" sub="+18 this month" trend="up" icon={<Users size={18} />} color="#0e7490" />
          </>
        )}
        {isDriver && (
          <>
            <StatCard title="Today's Pickups" value="8" sub="Assigned to you" icon={<Package size={18} />} color="#15803d" />
            <StatCard title="Completed" value="3" sub="This morning" icon={<CheckCircle size={18} />} color="#1d4ed8" />
            <StatCard title="Remaining" value="5" sub="Across Zone A & B" icon={<Clock size={18} />} color="#b45309" />
            <StatCard title="This Month" value="164" sub="Total collections" trend="up" icon={<TrendingUp size={18} />} color="#0e7490" />
          </>
        )}
        {isClient && (
          <>
            <StatCard title="Next Pickup" value="Thu 18 Jun" sub="08:00 AM" icon={<Calendar size={18} />} color="#15803d" />
            <StatCard title="Outstanding Balance" value="GHS 450.00" sub="Due 20 Jun" icon={<CreditCard size={18} />} color="#b45309" />
            <StatCard title="Pickups This Month" value="6" sub="All completed" icon={<CheckCircle size={18} />} color="#1d4ed8" />
            <StatCard title="Account Status" value="Active" sub="Premium plan" icon={<AlertCircle size={18} />} color="#0e7490" />
          </>
        )}
      </div>

      {/* Charts row */}
      {(isMD || isOM || isAM) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card rounded-xl p-5 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground font-display">Collection Trend</h3>
              <span className="text-xs font-mono text-muted-foreground">Jan – Jun 2026</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
                <Tooltip contentStyle={{ fontSize: 12, fontFamily: "Inter, sans-serif", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
                <Area type="monotone" dataKey="collections" stroke="#15803d" strokeWidth={2} fill="url(#colGrad)" name="Collections" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
            <h3 className="font-semibold text-foreground font-display mb-4">Zone Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ZONE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {ZONE_DATA.map((z, i) => (
                    <Cell key={i} fill={z.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ZONE_DATA.map((z) => (
                <div key={z.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: z.color }} />
                  <span className="text-xs text-muted-foreground font-mono">{z.name} — {z.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Schedule / Activity */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground font-display">Recent Schedule Activity</h3>
          <button className="text-xs text-primary font-medium hover:underline">View all</button>
        </div>
        <div className="divide-y divide-border">
          {SCHEDULE_DATA.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary">
                  <Truck size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{entry.client}</p>
                  <p className="text-xs text-muted-foreground font-mono">{entry.day} · {entry.time} · {entry.zone}</p>
                </div>
              </div>
              <StatusBadge status={entry.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SchedulingPage() {
  const [entries, setEntries] = useState<ScheduleEntry[]>(SCHEDULE_DATA);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const drivers = ["Kweku Asante", "Emmanuel Boateng", "Samuel Darko"];
  const zones = ["Zone A", "Zone B", "Zone C", "Zone D"];

  const handleSubmit = () => {
    if (!selectedClient || !selectedDate || !selectedDay) return;
    if (editId !== null) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editId
            ? { ...e, client: selectedClient, driver: selectedDriver, date: selectedDate, day: selectedDay, time: selectedTime, zone: selectedZone }
            : e
        )
      );
      setEditId(null);
    } else {
      const newEntry: ScheduleEntry = {
        id: Date.now(),
        client: selectedClient,
        driver: selectedDriver,
        date: selectedDate,
        day: selectedDay,
        time: selectedTime,
        zone: selectedZone,
        status: "scheduled",
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
    setSelectedClient("");
    setSelectedDriver("");
    setSelectedDate("");
    setSelectedDay("");
    setSelectedTime("");
    setSelectedZone("");
  };

  const handleEdit = (entry: ScheduleEntry) => {
    setEditId(entry.id);
    setSelectedClient(entry.client);
    setSelectedDriver(entry.driver);
    setSelectedDate(entry.date);
    setSelectedDay(entry.day);
    setSelectedTime(entry.time);
    setSelectedZone(entry.zone);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = filterStatus === "all" ? entries : entries.filter((e) => e.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Scheduling</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign pickup dates and times to clients.</p>
      </div>

      {/* Assignment Form */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <div className="w-1.5 h-5 rounded-full bg-primary" />
          <h3 className="font-semibold text-foreground font-display">
            {editId !== null ? "Edit Schedule Entry" : "New Schedule Assignment"}
          </h3>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Client */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select client…</option>
              {CLIENTS_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Driver */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Assign Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select driver…</option>
              {drivers.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Zone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select zone…</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Day */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Day of Week</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select day…</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={handleSubmit}
            disabled={!selectedClient || !selectedDate || !selectedDay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {editId !== null ? (
              <><RefreshCw size={15} /> Resubmit Schedule</>
            ) : (
              <><Plus size={15} /> Assign Schedule</>
            )}
          </button>
          {editId !== null && (
            <button
              onClick={() => { setEditId(null); setSelectedClient(""); setSelectedDriver(""); setSelectedDate(""); setSelectedDay(""); setSelectedTime(""); setSelectedZone(""); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <X size={15} /> Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Schedule Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground font-display">Schedule Entries</h3>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-8 px-3 rounded-lg border border-border bg-input-background text-xs text-foreground focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Driver</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Day</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Zone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-foreground">{entry.client}</td>
                  <td className="px-5 py-3 text-muted-foreground">{entry.driver}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{entry.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{entry.day}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{entry.time}</td>
                  <td className="px-5 py-3 text-muted-foreground">{entry.zone}</td>
                  <td className="px-5 py-3"><StatusBadge status={entry.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-muted-foreground text-sm">No schedule entries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SchedulingPreviewPage() {
  const mySchedule = SCHEDULE_DATA.filter((e) => e.driver === "Kweku Asante");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">My Schedule</h1>
        <p className="text-sm text-muted-foreground mt-1">Your assigned pickup schedule for this week.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mySchedule.map((entry) => (
          <div key={entry.id} className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Truck size={18} />
              </div>
              <StatusBadge status={entry.status} />
            </div>
            <h3 className="font-semibold text-foreground font-display">{entry.client}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-xs text-muted-foreground font-mono">📅 {entry.day}, {entry.date}</p>
              <p className="text-xs text-muted-foreground font-mono">⏰ {entry.time}</p>
              <p className="text-xs text-muted-foreground font-mono">📍 {entry.zone}</p>
            </div>
          </div>
        ))}
        {mySchedule.length === 0 && (
          <div className="col-span-2 bg-card rounded-xl border border-border p-10 text-center text-muted-foreground">
            No pickups assigned to you yet.
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsPage({ role }: { role: Role }) {
  const reportsRef = useRef<HTMLDivElement | null>(null);

  const exportToPdf = () => {
    try {
      const content = reportsRef.current;
      if (!content) {
        window.alert("Nothing to export");
        return;
      }

      const printWindow = window.open("", "PRINT", "height=800,width=1200");
      if (!printWindow) {
        window.alert("Unable to open print window. Please check your popup blocker.");
        return;
      }

      // Clone styles
      const doc = printWindow.document;
      doc.open();
      doc.write('<!doctype html><html><head><title>Reports</title>');
      Array.from(document.styleSheets).forEach((sheet) => {
        try {
          if ((sheet as CSSStyleSheet).href) {
            doc.write(`<link rel="stylesheet" href="${(sheet as CSSStyleSheet).href}">`);
          }
        } catch (e) {
          // ignore cross-origin sheets
        }
      });
      doc.write('</head><body>');
      doc.write(content.innerHTML);
      doc.write('</body></html>');
      doc.close();

      printWindow.focus();
      // Give the new window a moment to render styles
      setTimeout(() => {
        printWindow.print();
        // printWindow.close(); // optional
      }, 500);
    } catch (err) {
      console.error(err);
      window.alert("Export failed: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6" ref={reportsRef}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance overview and analytics.</p>
        </div>
        <button onClick={exportToPdf} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Download size={15} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-foreground font-display mb-4">Monthly Collections</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
              <Bar dataKey="collections" fill="#15803d" radius={[4, 4, 0, 0]} name="Collections" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-5">
          <h3 className="font-semibold text-foreground font-display mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={TREND_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} formatter={(v: number) => [`GHS ${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#1d4ed8" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground font-display">Summary Report</h3>
          <span className="text-xs font-mono text-muted-foreground">June 2026</span>
        </div>
        <div className="divide-y divide-border">
          {[
            { label: "Total Pickups Completed", value: "1,842", note: "+12% vs last month" },
            { label: "Total Revenue Collected", value: "GHS 184,200", note: "+8.2% vs last month" },
            { label: "Client Satisfaction Score", value: "94.3%", note: "Based on 312 reviews" },
            { label: "Average Pickups per Driver", value: "76.75", note: "Across 24 active drivers" },
            { label: "Zones with 100% Coverage", value: "8 of 12", note: "4 zones partially covered" },
            { label: "Pending / Overdue Pickups", value: "67", note: "Action required" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between px-5 py-3">
              <span className="text-sm text-foreground">{row.label}</span>
              <div className="text-right">
                <p className="text-sm font-semibold font-mono text-foreground">{row.value}</p>
                <p className="text-xs text-muted-foreground">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(USERS_DATA);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Add user form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("");

  const roles = ["Managing Director", "Account Manager", "Driver", "Client", "Operation Manager"];

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all system users and their roles.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> Add User
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none"
        >
          <option value="all">All roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["Name", "Role", "Email", "Phone", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{user.role}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{user.phone}</td>
                  <td className="px-5 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{user.joined}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 size={13} /></button>
                      <button onClick={() => toggleStatus(user.id)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"><Eye size={13} /></button>
                      <button
                        onClick={() => setUsers((prev) => prev.filter((u) => u.id !== user.id))}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-foreground font-display">Add New User</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} type="text" placeholder="Enter full name…" className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" placeholder="Enter email address…" className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} type="tel" placeholder="Enter phone number…" className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Role</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select role…</option>
                  {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button onClick={() => {
                // basic validation
                if (!newName.trim() || !newEmail.trim() || !newRole) {
                  window.alert("Please fill in name, email and role.");
                  return;
                }
                const newUser: User = {
                  id: Date.now(),
                  name: newName.trim(),
                  role: newRole,
                  email: newEmail.trim(),
                  phone: newPhone.trim() || "",
                  status: "active",
                  joined: new Date().toISOString().slice(0, 10),
                };
                setUsers((prev) => [newUser, ...prev]);
                // reset form
                setNewName(""); setNewEmail(""); setNewPhone(""); setNewRole("");
                setShowModal(false);
              }} className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Save size={14} /> Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display">Payment Activities</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and review all payment transactions.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Filter size={15} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collected" value="GHS 184,200" sub="This month" trend="up" icon={<TrendingUp size={18} />} color="#15803d" />
        <StatCard title="Completed" value="298" sub="Transactions" icon={<CheckCircle size={18} />} color="#1d4ed8" />
        <StatCard title="Pending" value="28" sub="Awaiting clearance" icon={<Clock size={18} />} color="#b45309" />
        <StatCard title="Failed" value="4" sub="Needs follow-up" icon={<AlertCircle size={18} />} color="#dc2626" />
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground font-display">Recent Transactions</h3>
          <button className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
            <Download size={13} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["Transaction ID", "Client", "Amount", "Date", "Method", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground font-mono uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PAYMENT_DATA.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.id}</td>
                  <td className="px-5 py-3 font-medium text-foreground">{p.client}</td>
                  <td className="px-5 py-3 font-mono font-semibold text-foreground">{p.amount}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.method}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MakePaymentPage() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("450.00");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Make Payment</h1>
        <p className="text-sm text-muted-foreground mt-1">Pay your outstanding waste management service balance.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
        <p className="text-sm opacity-80">Outstanding Balance</p>
        <p className="text-4xl font-bold font-display mt-1">GHS 450.00</p>
        <p className="text-xs opacity-70 font-mono mt-2">Due by 20 June 2026 · Account: CL-00412</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-12 rounded ${s < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">{["Select Method", "Enter Details", "Confirm"][step - 1]}</span>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
        {step === 1 && (
          <>
            <h3 className="font-semibold text-foreground font-display">Payment Method</h3>
            {["Mobile Money (MTN)", "Bank Transfer", "Cash at Office"].map((m) => (
              <label key={m} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${method === m ? "border-primary bg-secondary" : "border-border hover:border-primary/30"}`}>
                <input type="radio" name="method" value={m} checked={method === m} onChange={() => setMethod(m)} className="accent-primary" />
                <span className="text-sm font-medium text-foreground">{m}</span>
              </label>
            ))}
            <button disabled={!method} onClick={() => setStep(2)} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed">
              Continue
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h3 className="font-semibold text-foreground font-display">Payment Details</h3>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Amount (GHS)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            {method === "Mobile Money (MTN)" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Mobile Number</label>
                <input type="tel" placeholder="024 XXX XXXX" className="w-full h-10 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">Review</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h3 className="font-semibold text-foreground font-display">Confirm Payment</h3>
            <div className="bg-muted rounded-xl p-4 space-y-2">
              {[
                ["Method", method],
                ["Amount", `GHS ${amount}`],
                ["Account", "CL-00412 · Akosua Mensah"],
                ["Reference", "WASTE-2026-06-0412"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <span className="text-xs font-mono font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Back</button>
              <button onClick={() => { setStep(1); setMethod(""); }} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <CheckCircle size={16} /> Pay Now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PaymentReviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Payment Review</h1>
        <p className="text-sm text-muted-foreground mt-1">Your earnings summary and payment history.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard title="This Month's Earnings" value="GHS 3,240" sub="24 completed runs" trend="up" icon={<TrendingUp size={18} />} color="#15803d" />
        <StatCard title="Pending Payment" value="GHS 480" sub="Awaiting dispatch" icon={<Clock size={18} />} color="#b45309" />
      </div>
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground font-display">Payment History</h3>
        </div>
        <div className="divide-y divide-border">
          {[
            { period: "May 2026", amount: "GHS 3,120", runs: 22, status: "paid" },
            { period: "April 2026", amount: "GHS 2,880", runs: 20, status: "paid" },
            { period: "March 2026", amount: "GHS 3,360", runs: 26, status: "paid" },
          ].map((row) => (
            <div key={row.period} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{row.period}</p>
                <p className="text-xs text-muted-foreground font-mono">{row.runs} completed pickups</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-foreground">{row.amount}</span>
                <StatusBadge status={row.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ role }: { role: Role }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences.</p>
      </div>

      {[
        {
          title: "Profile Information",
          fields: [
            { label: "Full Name", value: "Kwame Asante", type: "text" },
            { label: "Email Address", value: "kwame@wastegh.com", type: "email" },
            { label: "Phone Number", value: "+233 24 111 2233", type: "tel" },
          ],
        },
        {
          title: "Notifications",
          fields: [
            { label: "Email Notifications", value: "Enabled", type: "toggle" },
            { label: "SMS Alerts", value: "Enabled", type: "toggle" },
            { label: "Schedule Reminders", value: "Enabled", type: "toggle" },
          ],
        },
        {
          title: "Security",
          fields: [
            { label: "Current Password", value: "", type: "password" },
            { label: "New Password", value: "", type: "password" },
          ],
        },
      ].map((section) => (
        <div key={section.title} className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-foreground font-display">{section.title}</h3>
          </div>
          <div className="p-5 space-y-4">
            {section.fields.map((field) => (
              <div key={field.label} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-foreground min-w-0 flex-shrink-0">{field.label}</label>
                {field.type === "toggle" ? (
                  <button className="w-11 h-6 rounded-full bg-primary relative flex-shrink-0">
                    <span className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                ) : (
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    placeholder={field.type === "password" ? "••••••••" : undefined}
                    className="flex-1 max-w-xs h-9 px-3 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                )}
              </div>
            ))}
            {section.title !== "Notifications" && (
              <div className="pt-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                  <Save size={14} /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────────────────

export default function App() {
  const [/*activeRole*/, setActiveRole] = useState<Role | null>(null); // kept setter for compatibility with header picker
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [notifications] = useState(3);

  const auth = useAuth();

  // derive activeRole from auth user
  const activeRole = auth.user?.role ?? null;

  // Login Screen (when not authenticated)
  if (!auth.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
              <Truck size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>PMJD</h1>
            <p className="text-sm text-muted-foreground mt-1">Waste Management System</p>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>Sign in to your account</h2>
            <p className="text-sm text-muted-foreground mb-5">Enter your username and password.</p>
            <LoginBox />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6 font-mono"> Contact us on +233XXXXXXXX © 2026 PMJD Ltd.</p>
        </div>
      </div>
    );
  }

  const navItems = activeRole ? NAV_CONFIG[activeRole] : [];
  const currentRole = ROLES.find((r) => r.id === activeRole!) ?? ROLES[0];

  const renderPage = () => {
    switch (activePage) {
  case "dashboard": return <DashboardPage role={activeRole!} onNavigate={(p) => setActivePage(p)} />;
      case "scheduling": return <SchedulingPage />;
      case "scheduling_preview": return <SchedulingPreviewPage />;
      case "reports": return <ReportsPage role={activeRole!} />;
      case "user_management": return <UserManagementPage />;
      case "payment_activities": return <PaymentActivitiesPage />;
      case "make_payment": return <MakePaymentPage />;
      case "payment_review": return <PaymentReviewPage />;
      case "settings": return <SettingsPage role={activeRole!} />;
      default: return <DashboardPage role={activeRole!} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col" style={{ backgroundColor: "#0d2137" }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Truck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>PMJD Ltd</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: currentRole.color }}>
              {currentRole.initials}
            </div>
            <span className="text-xs text-white/70 truncate">{currentRole.label}</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                  isActive
                    ? "bg-primary text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }`}
              >
                <span className={isActive ? "text-white" : "text-white/50"}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => { auth.signOut(); setActivePage("dashboard"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex-shrink-0 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              {navItems.find((n) => n.id === activePage)?.label ?? "Dashboard"}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
                {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
                  })}
            </p>
          </div>
          <div className="flex items-center gap-3">
                export default function NotificationBell() {
                const [open, setOpen] = useState(false);

    // Example notifications (replace with API later)
              const notifications = [
              "New waste collection request",
              "Driver assigned to route",
              "Payment received successfully",
             ];

      const bellRef = useRef(null);

    // Close dropdown when clicking outside
      useEffect(() => {
            const handleClickOutside = (event) => {
           if (bellRef.current && !bellRef.current.contains(event.target)) {
              setOpen(false);
          }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      {/* 🔔 BELL BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Bell size={18} className="text-muted-foreground" />

        {/* RED BADGE */}
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📩 DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">
          
          {/* HEADER */}
          <div className="p-3 border-b font-semibold">
            Notifications
          </div>

          {/* CONTENT */}
          {notifications.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              No notifications
            </div>
          ) : (
            notifications.map((note, index) => (
              <div
                key={index}
                className="p-3 text-sm hover:bg-gray-100 border-b last:border-b-0"
              >
                {note}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

            <button
              onClick={() => setShowRolePicker(!showRolePicker)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors relative"
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: currentRole.color }}>
                {currentRole.initials}
              </div>
              <span className="text-sm font-medium text-foreground hidden sm:block">{currentRole.label}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
              {showRolePicker && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { auth.switchRole?.(r.id); setActivePage("dashboard"); setShowRolePicker(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted transition-colors ${r.id === activeRole ? "text-primary font-medium" : "text-foreground"}`}
                    >
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: r.color }}>
                        {r.initials}
                      </div>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
