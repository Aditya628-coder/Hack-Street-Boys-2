import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User, ShieldCheck, Search, PlusCircle, CheckCircle2, 
  Clock, AlertCircle, Calendar as CalendarIcon, Trophy, 
  ClipboardList, Package, LogOut, ChevronRight, Menu, 
  X, AlertTriangle, RefreshCw, BellRing, History
} from 'lucide-react';

// --- Error Boundary for System Stability ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("System Crash Prevented:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">System Interruption</h2>
            <p className="text-sm text-gray-500 mb-6">The application encountered an unexpected error. The system has gracefully paused to prevent data corruption.</p>
            <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">Reload System</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Static Mock Data ---
const INITIAL_COMPLAINTS = [
  { id: 1, student: 'Aryan Sharma', room: 'B-201', category: 'Electrical', description: 'Ceiling fan making loud noise', status: 'Pending', timestamp: '2023-10-25 09:00' },
  { id: 2, student: 'Ishita Gupta', room: 'G-104', category: 'Plumbing', description: 'Leaking tap in bathroom', status: 'In Progress', timestamp: '2023-10-24 14:30' },
  { id: 3, student: 'Kabir Verma', room: 'A-412', category: 'Internet', description: 'WiFi router not working since morning', status: 'Resolved', timestamp: '2023-10-23 11:20' },
];

const INITIAL_LOST_FOUND = [
  { id: 1, item: 'Casio Scientific Calculator', location: 'Reading Room', finder: 'Rahul', status: 'Found', date: '2023-10-24' },
  { id: 2, item: 'Black Nike Water Bottle', location: 'Basketball Court', finder: 'Sanya', status: 'Claimed', date: '2023-10-22' },
];

const INITIAL_SPORTS_GEAR = [
  { id: 1, name: 'Cricket Kit (Set A)', total: 2, available: 1, icon: '🏏' },
  { id: 2, name: 'Football (Premium)', total: 5, available: 3, icon: '⚽' },
  { id: 3, name: 'Badminton Racket', total: 8, available: 0, icon: '🏸' },
  { id: 4, name: 'Table Tennis Bat', total: 6, available: 4, icon: '🏓' },
];

const MESS_MENU = {
  Monday: { breakfast: 'Poha & Tea', lunch: 'Rajma Chawal', dinner: 'Paneer Butter Masala' },
  Tuesday: { breakfast: 'Aloo Paratha', lunch: 'Kadhi Pakoda', dinner: 'Mix Veg' },
  Wednesday: { breakfast: 'Idli Sambhar', lunch: 'Chole Bhature', dinner: 'Egg Curry / Malai Kofta' },
  Thursday: { breakfast: 'Oats & Milk', lunch: 'Veg Pulao', dinner: 'Dal Makhani' },
  Friday: { breakfast: 'Bread Butter', lunch: 'Aloo Gobhi', dinner: 'Chicken Curry / Shahi Paneer' },
  Saturday: { breakfast: 'Puri Sabzi', lunch: 'Dal Baati Churma', dinner: 'Kadhai Paneer' },
  Sunday: { breakfast: 'Special Sandwich', lunch: 'Special Thali', dinner: 'Biryani' },
};

// --- Pure Components ---

const SidebarItem = React.memo(({ active, icon: Icon, label, onClick }) => {
  return (
    <button
      onClick={(e) => onClick?.(e)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
        active 
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
          : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );
});

const Badge = React.memo(({ status }) => {
  const styles = {
    'Pending': 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Resolved': 'bg-emerald-100 text-emerald-700',
    'Found': 'bg-purple-100 text-purple-700',
    'Claimed': 'bg-gray-100 text-gray-500',
    'Available': 'bg-green-100 text-green-700',
    'Out of Stock': 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
});

const ToastContainer = React.memo(({ toasts = [], removeToast }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {(toasts || []).map((toast, index) => (
        <div 
          key={toast?.id || `toast-${index}`}
          className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-8 duration-300 border border-white/10"
        >
          <div className="bg-blue-500 p-1.5 rounded-lg animate-pulse">
            <BellRing size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Live Update</p>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button 
            onClick={() => removeToast?.(toast.id)}
            className="ml-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
});

// --- Views ---

const StatCard = ({ icon: Icon, color, count, label, subLabel }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color] || 'bg-gray-100 text-gray-600'}`}><Icon size={24} /></div>
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <h3 className="text-gray-500 font-medium">{label}</h3>
      <p className="text-xs text-gray-400 mt-1">{subLabel}</p>
    </div>
  );
};

const DashboardView = ({ stats = { pendingComplaints: 0, foundItems: 0 }, sportsGear = [], complaints = [] }) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[new Date().getDay()];
  const todaysMenu = MESS_MENU[currentDay] || MESS_MENU.Monday || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={AlertCircle} color="blue" count={stats?.pendingComplaints ?? 0} label="Active Issues" subLabel="Requires attention" />
        <StatCard icon={Package} color="purple" count={stats?.foundItems ?? 0} label="Lost & Found" subLabel="Items waiting" />
        <StatCard icon={Trophy} color="emerald" count={(sportsGear || []).reduce((acc, curr) => acc + (curr?.available ?? 0), 0)} label="Sports Gear" subLabel="Units available" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CalendarIcon className="text-blue-600" size={20} /> Today's Mess Menu ({currentDay})</h3>
          <div className="space-y-4">
            {Object.entries(todaysMenu || {}).map(([meal, menu], index) => (
              <div key={meal || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="capitalize font-semibold text-gray-600">{meal}</span>
                <span className="text-gray-500">{String(menu || 'Not available')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Clock className="text-blue-600" size={20} /> Recent Activities</h3>
          <div className="space-y-4">
            {(complaints || []).slice(0, 3).map((c, index) => (
              <div key={c?.id || `recent-${index}`} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0">
                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${c?.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{c?.description || 'No description'}</p>
                  <p className="text-xs text-gray-400">{c?.timestamp || 'Unknown time'} • Room {c?.room || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

function HostelApp() {
  const [role, setRole] = useState('Student');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [lostFound, setLostFound] = useState(INITIAL_LOST_FOUND);
  const [sportsGear, setSportsGear] = useState(INITIAL_SPORTS_GEAR);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null);

  // Security: RBAC Guard
  useEffect(() => {
    if (role === 'Student' && activeTab === 'audit') {
      setActiveTab('dashboard');
    }
  }, [role, activeTab]);

  const addToast = useCallback((message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleNavigation = useCallback((tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

  const stats = useMemo(() => ({
    pendingComplaints: (complaints || []).filter(c => c?.status !== 'Resolved').length,
    foundItems: (lostFound || []).filter(i => i?.status === 'Found').length,
  }), [complaints, lostFound]);

  const handleStatusUpdate = useCallback((id, newStatus) => {
    if (role !== 'Warden') return;

    setComplaints(prev => {
      const idx = prev.findIndex(c => c.id === id);
      if (idx === -1) return prev;
      
      const updated = [...prev];
      const oldStatus = updated[idx].status;
      updated[idx] = { ...updated[idx], status: newStatus };

      setAuditLogs(logPrev => [{
        id: Date.now(),
        complaintId: id,
        description: updated[idx].description,
        oldStatus,
        newStatus,
        timestamp: new Date().toLocaleString(),
        actor: 'Warden Admin'
      }, ...logPrev]);

      addToast(`Administrative update: Status changed to ${newStatus}`);
      return updated;
    });
  }, [addToast, role]);

  const handleAddComplaint = useCallback((newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
    addToast('Complaint registered successfully!');
  }, [addToast]);

  const bookGear = useCallback((id) => {
    if (role !== 'Student') {
      addToast("Management Role: Booking is restricted to Students.");
      return;
    }

    const item = sportsGear.find(g => g.id === id);
    if (!item || item.available <= 0) {
      setBookingStatus({ type: 'error', message: `Conflict: ${item?.name} is out of stock.` });
      setTimeout(() => setBookingStatus(null), 3000);
      return;
    }

    setSportsGear(prev => prev.map(g => g.id === id ? { ...g, available: g.available - 1 } : g));
    setBookingStatus({ type: 'success', message: `Success! ${item.name} booked.` });
    addToast(`Activity: ${item.name} booked.`);

    setTimeout(() => {
      setSportsGear(prev => prev.map(g => g.id === id ? { ...g, available: Math.min(g.total, g.available + 1) } : g));
      addToast(`Activity: ${item.name} returned to inventory.`);
    }, 10000);
  }, [sportsGear, addToast, role]);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <DashboardView stats={stats} sportsGear={sportsGear} complaints={complaints} />;
      case 'complaints': return (
        <ComplaintsSection 
          role={role} 
          complaints={complaints} 
          onUpdate={handleStatusUpdate} 
          onAdd={handleAddComplaint} 
        />
      );
      case 'sports': return <SportsArena sportsGear={sportsGear} onBook={bookGear} bookingStatus={bookingStatus} role={role} />;
      case 'lostfound': return <LostFoundHub lostFound={lostFound} />;
      case 'calendar': return <MessCalendar />;
      case 'audit': return role === 'Warden' ? <AuditLogView logs={auditLogs} /> : <DashboardView stats={stats} sportsGear={sportsGear} complaints={complaints} />;
      default: return <DashboardView stats={stats} sportsGear={sportsGear} complaints={complaints} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-gray-900 overflow-hidden">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 lg:hidden z-40 backdrop-blur-[2px] transition-opacity" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">K</div>
              <h1 className="text-xl font-black tracking-tight">COMMONS<span className="text-blue-600">.</span></h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <nav className="space-y-1 flex-1">
            <SidebarItem active={activeTab === 'dashboard'} icon={ClipboardList} label="Overview" onClick={() => handleNavigation('dashboard')} />
            <SidebarItem active={activeTab === 'complaints'} icon={AlertCircle} label="Complaints" onClick={() => handleNavigation('complaints')} />
            <SidebarItem active={activeTab === 'sports'} icon={Trophy} label="Sports Arena" onClick={() => handleNavigation('sports')} />
            <SidebarItem active={activeTab === 'lostfound'} icon={Package} label="Lost & Found" onClick={() => handleNavigation('lostfound')} />
            <SidebarItem active={activeTab === 'calendar'} icon={CalendarIcon} label="Schedule" onClick={() => handleNavigation('calendar')} />
            {role === 'Warden' && <SidebarItem active={activeTab === 'audit'} icon={History} label="Audit Log" onClick={() => handleNavigation('audit')} />}
          </nav>
          <div className="pt-6 border-t border-gray-50">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role === 'Warden' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {role === 'Student' ? <User size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{role === 'Student' ? 'Aryan Sharma' : 'Chief Warden'}</p>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{role} ACCESS</p>
              </div>
              <button onClick={() => { setRole(r => r === 'Student' ? 'Warden' : 'Student'); addToast('Role Switched'); }} className="p-2 hover:bg-gray-100 rounded-lg text-blue-600 transition-transform active:scale-95" title="Switch Role"><LogOut size={16} /></button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-full">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-bold capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3">
            {role === 'Warden' && <span className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-lg border border-blue-100"><ShieldCheck size={12} /> Admin Mode</span>}
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${role === 'Warden' ? 'border-blue-200 text-blue-600 bg-white shadow-sm' : 'border-gray-200 text-gray-500 bg-gray-50'}`}>
              {role} VIEW
            </span>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HostelApp />
    </ErrorBoundary>
  );
}

// --- Memoized Sections ---

const ComplaintsSection = React.memo(({ role = 'Student', complaints = [], onUpdate, onAdd }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const form = e.target;
      const f = new FormData(form);
      
      setIsSubmitting(true);
      
      setTimeout(() => {
        onAdd?.({ 
          id: Date.now(), 
          student: 'Aryan Sharma', 
          room: f.get('room') || 'Unknown', 
          category: f.get('category') || 'Other', 
          description: f.get('description') || 'No description provided', 
          status: 'Pending', 
          timestamp: new Date().toLocaleString() 
        });
        setIsSubmitting(false);
        form.reset();
      }, 1500);
    } catch (error) {
      console.error("Form submission failed:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {role === 'Student' ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">Register a Complaint</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="room" placeholder="Room Number (e.g. B-201)" className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-gray-50" disabled={isSubmitting} required />
            <select name="category" className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" disabled={isSubmitting} required>
              <option value="Electrical">Electrical</option><option value="Plumbing">Plumbing</option><option value="Internet">Internet</option><option value="Mess">Mess Issue</option>
            </select>
            <textarea name="description" placeholder="Describe the issue in detail..." className="p-2 border rounded-lg md:col-span-2 h-24 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50" disabled={isSubmitting} required></textarea>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="md:col-span-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  Syncing with Server...
                </>
              ) : 'Submit Maintenance Request'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-3 text-blue-700">
          <ShieldCheck size={20} />
          <p className="text-sm font-medium">Administrative Override: Use the table below to update complaint statuses.</p>
        </div>
      )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-6 py-4">Details</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Status</th>{role === 'Warden' && <th className="px-6 py-4 text-right">Actions</th>}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {(complaints || []).map((c, index) => (
                <tr key={c?.id || `complaint-${index}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><p className="font-bold text-gray-800">{c?.description || 'No description'}</p><p className="text-xs text-gray-400">By {c?.student || 'Unknown'} • Room {c?.room || 'Unknown'}</p></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-600">{c?.category || 'General'}</span></td>
                <td className="px-6 py-4"><Badge status={c?.status || 'Pending'} /></td>
                {role === 'Warden' && <td className="px-6 py-4 text-right">
                  <select value={c?.status || 'Pending'} onChange={(e) => onUpdate?.(c?.id, e.target.value)} className="text-xs p-1.5 border rounded-lg bg-white text-blue-600 font-bold border-blue-100 outline-none hover:bg-blue-50 cursor-pointer">
                    <option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
                  </select>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
});

const SportsArena = React.memo(({ sportsGear = [], onBook, bookingStatus, role = 'Student' }) => {
  return (
    <div className="space-y-6">
      {bookingStatus && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in fade-in slide-in-from-top-4 ${bookingStatus?.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
          {bookingStatus?.type === 'error' ? <AlertTriangle size={20} /> : <RefreshCw className="animate-spin" size={18} />}
          <span className="font-bold">{bookingStatus?.message || ''}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(sportsGear || []).map((item, index) => (
          <div key={item?.id || `gear-${index}`} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center relative overflow-hidden group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{item?.icon || '📦'}</div>
            <h3 className="font-bold text-lg mb-1">{item?.name || 'Unknown Item'}</h3>
            <div className="flex justify-center gap-2 mb-4"><Badge status={(item?.available || 0) > 0 ? 'Available' : 'Out of Stock'} /></div>
            <p className="text-sm text-gray-500 mb-2">{item?.available || 0} / {item?.total || 0} available</p>
            
            {role === 'Warden' && (item?.available || 0) < (item?.total || 0) && (
              <div className="mb-4 py-1 px-3 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg border border-red-100 inline-block animate-pulse">
                Alert: Last booked by Room B-{200 + (((item?.id || 0) * 37) % 90)}
              </div>
            )}

            <button 
              onClick={() => onBook?.(item?.id)} 
              className={`w-full py-2 rounded-xl font-bold transition-all ${
                role === 'Warden' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                (item?.available || 0) > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100' : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
            >
              {role === 'Warden' ? 'Admin Mode' : (item?.available || 0) > 0 ? 'Book Equipment' : 'Check Inventory'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

const AuditLogView = React.memo(({ logs = [] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl text-white">
        <h2 className="text-xl font-bold flex items-center gap-2"><History className="text-blue-400" /> Administrative Audit Trail</h2>
        <p className="text-slate-400 text-sm mt-1">Immutable record of status transitions for accountability.</p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-6 py-4">Timestamp</th><th className="px-6 py-4">Resource</th><th className="px-6 py-4">Transition</th><th className="px-6 py-4 text-right">Authorized By</th></tr></thead>
        <tbody className="divide-y divide-gray-100">
          {(!logs || logs.length === 0) ? (
            <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No administrative transitions recorded yet.</td></tr>
          ) : (
            (logs || []).map((log, index) => (
              <tr key={log?.id || `log-${index}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4"><span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{log?.timestamp || 'Unknown Time'}</span></td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-gray-800">{log?.description || 'Unknown Action'}</p></td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2"><Badge status={log?.oldStatus || 'Unknown'} /><ChevronRight size={14} className="text-gray-300" /><Badge status={log?.newStatus || 'Unknown'} /></div></td>
                    <td className="px-6 py-4 text-right text-sm font-black text-blue-600 uppercase tracking-widest">{log?.actor || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

const LostFoundHub = React.memo(({ lostFound = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(lostFound || []).map((item, index) => (
        <div key={item?.id || `lf-${index}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
          <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-300 group-hover:bg-purple-50 transition-colors"><Package size={48} className="group-hover:text-purple-300" /></div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-2"><h3 className="font-bold text-lg">{item?.item || 'Unknown Item'}</h3><Badge status={item?.status || 'Unknown'} /></div>
            <p className="text-sm text-gray-500 mb-4">Found at {item?.location || 'Unknown Location'} by {item?.finder || 'Anonymous'}</p>
            <div className="flex justify-between items-center"><span className="text-xs text-gray-400">{item?.date || 'Unknown Date'}</span><button className="text-blue-600 font-bold text-sm hover:underline">Claim Item</button></div>
          </div>
        </div>
      ))}
    </div>
  );
});

const MessCalendar = React.memo(() => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[500px]">
      <div className="p-6 bg-blue-600 text-white flex justify-between items-center"><div><h2 className="text-2xl font-bold">Hostel Mess Calendar</h2><p className="opacity-80">Weekly Menu & Meetings</p></div></div>
      <div className="grid grid-cols-7 border-b text-center text-[10px] font-black text-gray-400 py-3 uppercase tracking-widest">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y h-full">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className={`p-2 transition-all hover:bg-blue-50/50 ${i === 24 ? 'bg-blue-50' : ''}`}>
            <span className={`text-xs font-bold ${i === 24 ? 'text-blue-600' : 'text-gray-400'}`}>{i + 1}</span>
            {i === 26 && <div className="mt-1 text-[8px] bg-amber-100 text-amber-700 p-1 rounded font-bold">Warden Meet</div>}
          </div>
        ))}
      </div>
    </div>
  );
});