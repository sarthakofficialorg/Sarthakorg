import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  subscribeActivities, 
  createActivity, 
  updateActivity, 
  deleteActivity, 
  getJoinSubmissions, 
  getContactSubmissions,
  updateJoinSubmission,
  deleteJoinSubmission,
  Activity,
  JoinSubmission,
  ContactSubmission
} from '../lib/firebase';
import { 
  Lock, 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Mail, 
  FileText, 
  Activity as ActIcon, 
  Eye, 
  X, 
  ChevronRight, 
  LogOut, 
  ArrowLeft,
  Calendar,
  MapPin,
  Award,
  ListFilter,
  CheckCircle2,
  Heart,
  Download,
  Check,
  XCircle
} from 'lucide-react';
import { compressImage } from '../lib/imageCompressor';

interface AdminPortalProps {
  onBackToSite: () => void;
  activities: Activity[];
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite, activities }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Loaded database items
  const [joinSubmissions, setJoinSubmissions] = useState<JoinSubmission[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);

  // Navigation tab in admin
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activities' | 'volunteers' | 'contacts' | 'team_sarthak'>('dashboard');

  // Edit member modal states
  const [editingMember, setEditingMember] = useState<JoinSubmission | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    email: '',
    bloodGroup: '',
    agreeToDonateBlood: 'Yes' as 'Yes' | 'No',
    dob: '',
    educationalQualification: '',
    address: '',
    recentImage: ''
  });
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberFormError, setMemberFormError] = useState('');

  // Edit / Add Activity Modal States
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null); // null means "Add New"
  const [activityForm, setActivityForm] = useState({
    title: '',
    category: 'Education',
    date: '',
    location: '',
    imageUrl: '',
    imageUrls: [] as string[],
    goalReached: '',
    description: '',
    details: ''
  });
  const [formError, setFormError] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Viewer states
  const [viewingJoin, setViewingJoin] = useState<JoinSubmission | null>(null);
  const [viewingContact, setViewingContact] = useState<ContactSubmission | null>(null);

  // Deletion modal states
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preset Image Options for Activities (Unsplash) to make it easy for Admin to pick a high-quality photo!
  const PRESET_IMAGES = [
    { name: "Education", url: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80" },
    { name: "Children / Group", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80" },
    { name: "Support Group", url: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80" },
    { name: "Healthcare", url: "https://images.unsplash.com/photo-1504813184591-015578f1c3f5?auto=format&fit=crop&w=800&q=80" },
    { name: "Food Drive", url: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80" },
    { name: "Donation Boxes", url: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?auto=format&fit=crop&w=800&q=80" }
  ];

  const loadAllData = async () => {
    setLoading(true);
    try {
      const joins = await getJoinSubmissions();
      const contacts = await getContactSubmissions();
      setJoinSubmissions(joins);
      setContactSubmissions(contacts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '10112') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode.');
    }
  };

  const handleOpenActivityModal = (activity: Activity | null) => {
    setEditingActivity(activity);
    if (activity) {
      setActivityForm({
        title: activity.title,
        category: activity.category,
        date: activity.date,
        location: activity.location,
        imageUrl: activity.imageUrl,
        imageUrls: activity.imageUrls || (activity.imageUrl ? [activity.imageUrl] : []),
        goalReached: activity.goalReached || '',
        description: activity.description,
        details: activity.details || ''
      });
    } else {
      // Setup blank form
      setActivityForm({
        title: '',
        category: 'Education',
        date: new Date().toISOString().split('T')[0],
        location: '',
        imageUrl: PRESET_IMAGES[0].url,
        imageUrls: [PRESET_IMAGES[0].url],
        goalReached: '',
        description: '',
        details: ''
      });
    }
    setFormError('');
    setIsActivityModalOpen(true);
  };

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityForm.title || !activityForm.date || !activityForm.location || !activityForm.description) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const finalImageUrl = activityForm.imageUrl || activityForm.imageUrls[0] || '';
    const finalImageUrls = activityForm.imageUrls.length > 0 
      ? activityForm.imageUrls 
      : (finalImageUrl ? [finalImageUrl] : []);

    if (!finalImageUrl) {
      setFormError('Please add at least one image in the gallery (via URL, upload or presets).');
      return;
    }

    setFormError('');
    setFormSaving(true);

    try {
      // Compress all base64 images in imageUrls and the cover imageUrl
      const compressedImageUrls = await Promise.all(
        finalImageUrls.map(url => compressImage(url))
      );
      const compressedImageUrl = await compressImage(finalImageUrl);

      const dataToSave = {
        ...activityForm,
        imageUrl: compressedImageUrl,
        imageUrls: compressedImageUrls
      };

      if (editingActivity) {
        // Update mode
        await updateActivity(editingActivity.id, dataToSave);
      } else {
        // Create mode
        await createActivity(dataToSave);
      }
      setIsActivityModalOpen(false);
      await loadAllData();
    } catch (err) {
      setFormError('Failed to save activity to cloud.');
      console.error(err);
    } finally {
      setFormSaving(false);
    }
  };

  const handleAcceptApplication = async (id: string) => {
    try {
      await updateJoinSubmission(id, { status: 'accepted' });
      if (viewingJoin && viewingJoin.id === id) {
        setViewingJoin(prev => prev ? { ...prev, status: 'accepted' } : null);
      }
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to accept application.');
    }
  };

  const handleRejectApplication = async (id: string) => {
    if (confirm('Are you sure you want to reject this volunteer application?')) {
      try {
        await updateJoinSubmission(id, { status: 'rejected' });
        if (viewingJoin && viewingJoin.id === id) {
          setViewingJoin(prev => prev ? { ...prev, status: 'rejected' } : null);
        }
        await loadAllData();
      } catch (err) {
        console.error(err);
        alert('Failed to reject application.');
      }
    }
  };

  const handleOpenMemberEditModal = (member: JoinSubmission) => {
    setEditingMember(member);
    setMemberForm({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      bloodGroup: member.bloodGroup || 'A+',
      agreeToDonateBlood: member.agreeToDonateBlood || 'Yes',
      dob: member.dob || '',
      educationalQualification: member.educationalQualification || '',
      address: member.address || '',
      recentImage: member.recentImage || ''
    });
    setMemberFormError('');
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !editingMember.id) return;
    if (!memberForm.name || !memberForm.phone || !memberForm.email || !memberForm.address) {
      setMemberFormError('Please fill in Name, Phone, Email and Address.');
      return;
    }
    setMemberSaving(true);
    try {
      await updateJoinSubmission(editingMember.id, memberForm);
      setEditingMember(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      setMemberFormError('Failed to update member.');
    } finally {
      setMemberSaving(false);
    }
  };

  const handleDownloadTeamCSV = () => {
    const acceptedMembers = joinSubmissions.filter(sub => sub.status === 'accepted');
    if (acceptedMembers.length === 0) {
      alert('No accepted team members to download.');
      return;
    }

    const headers = ['Name', 'Phone', 'Email', 'Blood Group', 'Emergency Donor', 'Date of Birth', 'Educational Qualification', 'Address', 'Date Applied'];
    const rows = acceptedMembers.map(m => [
      m.name,
      m.phone,
      m.email,
      m.bloodGroup || 'N/A',
      m.agreeToDonateBlood || 'No',
      m.dob || 'N/A',
      m.educationalQualification || 'N/A',
      `"${(m.address || '').replace(/"/g, '""')}"`,
      m.submittedAt ? m.submittedAt.split('T')[0] : 'N/A'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Team_Sarthak_Members_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this Team Sarthak member permanently? This action cannot be undone.')) {
      try {
        await deleteJoinSubmission(id);
        if (viewingJoin && viewingJoin.id === id) {
          setViewingJoin(null);
        }
        await loadAllData();
      } catch (err) {
        console.error(err);
        alert('Failed to delete member.');
      }
    }
  };

  const handleDeleteActivity = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteActivity(deleteTargetId);
      setDeleteTargetId(null);
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete activity.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Top Admin Branding Banner */}
      <header className="bg-gray-900 text-white px-6 py-4 shadow-md flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center font-bold font-serif text-lg text-white">
            S
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">SARTHAK Admin Hub</h2>
            <p className="text-xs text-rose-400 font-mono">NGO Management Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-website"
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" />
            View Website
          </button>
          {isAuthenticated && (
            <button
              id="btn-logout"
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center justify-center p-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-xl transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Container Area */}
      {!isAuthenticated ? (
        // Passcode Entrance screen
        <div className="flex-grow flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center"
          >
            <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-6 border border-pink-100">
              <Lock className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Admin Security Access</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              This space manages volunteer forms, contact queries, and activities content.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {authError && (
                <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-xl font-medium">
                  {authError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">
                  Portal Passcode
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter administrator code"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-mono tracking-widest transition-colors text-center"
                  required
                />
              </div>

              <div className="bg-rose-50/50 border border-pink-100 text-rose-800 text-xs p-3.5 rounded-xl leading-relaxed text-center">
                This area is restricted to authorized representatives of the SARTHAK Foundation.
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-pink-100 hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                Unlock Administrator Console
                <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        // Authenticated Dashboard
        <div className="flex-grow flex flex-col md:flex-row">
          
          {/* Admin Sidebar Navigation */}
          <aside className="w-full md:w-64 bg-white border-r border-gray-200 shrink-0">
            <nav className="p-4 space-y-1.5">
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4.5 h-4.5 shrink-0" />
                  Overview Dashboard
                </div>
                <ChevronRight className={`w-4 h-4 opacity-55 transition-transform ${activeTab === 'dashboard' ? 'rotate-90 text-rose-600' : ''}`} />
              </button>

              <button
                id="tab-activities"
                onClick={() => setActiveTab('activities')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'activities'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ActIcon className="w-4.5 h-4.5 shrink-0" />
                  Manage Activities ({activities.length})
                </div>
                <ChevronRight className={`w-4 h-4 opacity-55 transition-transform ${activeTab === 'activities' ? 'rotate-90 text-rose-600' : ''}`} />
              </button>

              <button
                id="tab-volunteers"
                onClick={() => setActiveTab('volunteers')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'volunteers'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4.5 h-4.5 shrink-0" />
                  Join Applications ({joinSubmissions.filter(s => !s.status || s.status === 'pending').length})
                </div>
                <ChevronRight className={`w-4 h-4 opacity-55 transition-transform ${activeTab === 'volunteers' ? 'rotate-90 text-rose-600' : ''}`} />
              </button>

              <button
                id="tab-team-sarthak"
                onClick={() => setActiveTab('team_sarthak')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'team_sarthak'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                  Team Sarthak ({joinSubmissions.filter(s => s.status === 'accepted').length})
                </div>
                <ChevronRight className={`w-4 h-4 opacity-55 transition-transform ${activeTab === 'team_sarthak' ? 'rotate-90 text-rose-600' : ''}`} />
              </button>

              <button
                id="tab-contacts"
                onClick={() => setActiveTab('contacts')}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-sans text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'contacts'
                    ? 'bg-rose-50 text-rose-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4.5 h-4.5 shrink-0" />
                  Support Inquiries ({contactSubmissions.length})
                </div>
                <ChevronRight className={`w-4 h-4 opacity-55 transition-transform ${activeTab === 'contacts' ? 'rotate-90 text-rose-600' : ''}`} />
              </button>
            </nav>
          </aside>

          {/* Admin Workspace Content */}
          <main className="flex-grow p-6 md:p-8 max-w-6xl">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-mono uppercase tracking-wider">Syncing database...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                
                {/* 1. OVERVIEW DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">NGO Overview Dashboard</h3>
                      <p className="text-sm text-gray-500">Live statistics and summaries of form registrations.</p>
                    </div>

                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* Stat Card 1 */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Activities</p>
                          <h4 className="text-3xl font-extrabold text-gray-900">{activities.length}</h4>
                        </div>
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                          <ActIcon className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Stat Card 2 */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Volunteer Forms</p>
                          <h4 className="text-3xl font-extrabold text-gray-900">{joinSubmissions.length}</h4>
                        </div>
                        <div className="w-12 h-12 bg-pink-50 text-rose-600 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Stat Card 3 */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Queries</p>
                          <h4 className="text-3xl font-extrabold text-gray-900">{contactSubmissions.length}</h4>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <Mail className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Quick Activity & Submissions Split Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                      {/* Recent Registrants */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-96">
                        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                          <h4 className="font-sans font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-rose-600" />
                            Recent Volunteer Joins
                          </h4>
                          <button onClick={() => setActiveTab('volunteers')} className="text-xs font-semibold text-rose-600 hover:underline">
                            View All
                          </button>
                        </div>
                        <div className="flex-grow overflow-y-auto divide-y divide-gray-100 p-2">
                          {joinSubmissions.length === 0 ? (
                            <p className="p-6 text-center text-sm text-gray-400">No applicants yet.</p>
                          ) : (
                            joinSubmissions.slice(0, 5).map((sub) => (
                              <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors">
                                <div>
                                  <p className="font-sans font-semibold text-gray-800 text-sm">{sub.name}</p>
                                  <p className="font-sans text-xs text-rose-600 font-medium">{sub.skills}</p>
                                </div>
                                <span className="font-mono text-[10px] text-gray-400">
                                  {sub.submittedAt ? sub.submittedAt.split('T')[0] : 'Today'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Recent Inquiries */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-96">
                        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                          <h4 className="font-sans font-bold text-gray-900 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Recent Contact Messages
                          </h4>
                          <button onClick={() => setActiveTab('contacts')} className="text-xs font-semibold text-rose-600 hover:underline">
                            View All
                          </button>
                        </div>
                        <div className="flex-grow overflow-y-auto divide-y divide-gray-100 p-2">
                          {contactSubmissions.length === 0 ? (
                            <p className="p-6 text-center text-sm text-gray-400">No messages yet.</p>
                          ) : (
                            contactSubmissions.slice(0, 5).map((sub) => (
                              <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors">
                                <div className="max-w-[70%]">
                                  <p className="font-sans font-semibold text-gray-800 text-sm">{sub.name}</p>
                                  <p className="font-sans text-xs text-gray-500 line-clamp-1">{sub.subject}</p>
                                </div>
                                <span className="font-mono text-[10px] text-gray-400 shrink-0">
                                  {sub.submittedAt ? sub.submittedAt.split('T')[0] : 'Today'}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. MANAGE ACTIVITIES */}
                {activeTab === 'activities' && (
                  <motion.div
                    key="activities"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Activities</h3>
                        <p className="text-sm text-gray-500">Add, edit, or delete the activity entries showcased on the website.</p>
                      </div>
                      <button
                        id="btn-add-activity"
                        onClick={() => handleOpenActivityModal(null)}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-pink-100 hover:shadow-none transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Create New Activity
                      </button>
                    </div>

                    {/* Activities List Cards / Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activities.length === 0 ? (
                        <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400">
                          No activities registered. Click 'Create New Activity' to start.
                        </div>
                      ) : (
                        activities.map((act) => (
                          <div key={act.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                            <div className="h-40 w-full relative bg-gray-100">
                              <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {act.imageUrls && act.imageUrls.length > 1 && (
                                <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold z-10">
                                  {act.imageUrls.length} images
                                </span>
                              )}
                            </div>
                            <div className="p-5 flex-grow flex flex-col justify-between">
                              <div>
                                <h4 className="font-sans font-bold text-gray-900 text-lg line-clamp-1 mb-2">{act.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500 font-mono mb-4">
                                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-rose-500" /> {act.date}</span>
                                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-500" /> {act.location}</span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">{act.description}</p>
                              </div>

                              <div className="flex items-center gap-2 border-t border-gray-100 pt-4 mt-2">
                                <button
                                  id={`btn-edit-act-${act.id}`}
                                  onClick={() => handleOpenActivityModal(act)}
                                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                                  Edit Content
                                </button>
                                <button
                                  id={`btn-delete-act-${act.id}`}
                                  onClick={() => handleDeleteActivity(act.id)}
                                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  Delete Entry
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. VOLUNTEER SUBMISSIONS */}
                {activeTab === 'volunteers' && (
                  <motion.div
                    key="volunteers"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Volunteer Submissions</h3>
                      <p className="text-sm text-gray-500">Detailed list of individuals who completed the 'Join with Us' form.</p>
                    </div>

                    {/* Registrations Table */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              <th className="px-6 py-4">Full Name</th>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">Phone</th>
                              <th className="px-6 py-4">Blood Group</th>
                              <th className="px-6 py-4">Emergency Donor</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Date Applied</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {joinSubmissions.filter(s => !s.status || s.status !== 'accepted').length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No pending join applications stored.</td>
                              </tr>
                            ) : (
                              joinSubmissions.filter(s => !s.status || s.status !== 'accepted').map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 flex items-center gap-3">
                                    {sub.recentImage ? (
                                      <img src={sub.recentImage} alt={sub.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-[10px] border border-gray-200">
                                        N/A
                                      </div>
                                    )}
                                    <span className="font-bold text-gray-900">{sub.name}</span>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs">{sub.email}</td>
                                  <td className="px-6 py-4">{sub.phone}</td>
                                  <td className="px-6 py-4">
                                    <span className="inline-block px-2.5 py-1 bg-red-50 border border-red-150 text-red-700 text-xs font-bold rounded-lg font-mono">
                                      {sub.bloodGroup || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                                      sub.agreeToDonateBlood === 'Yes' 
                                        ? 'bg-green-50 border border-green-150 text-green-700' 
                                        : 'bg-gray-50 border border-gray-150 text-gray-600'
                                    }`}>
                                      {sub.agreeToDonateBlood || 'No'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                                      sub.status === 'rejected'
                                        ? 'bg-rose-50 border border-rose-150 text-rose-700'
                                        : 'bg-amber-50 border border-amber-150 text-amber-700'
                                    }`}>
                                      {sub.status === 'rejected' ? 'Rejected' : 'Pending'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs">
                                    {sub.submittedAt ? sub.submittedAt.split('T')[0] : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        id={`btn-view-join-${sub.id}`}
                                        onClick={() => setViewingJoin(sub)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                        title="Review Application"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        Review
                                      </button>
                                      
                                      <button
                                        id={`btn-accept-join-${sub.id}`}
                                        onClick={() => handleAcceptApplication(sub.id!)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg cursor-pointer transition-colors"
                                        title="Accept & Promote to Team"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        Accept
                                      </button>

                                      {sub.status !== 'rejected' && (
                                        <button
                                          id={`btn-reject-join-${sub.id}`}
                                          onClick={() => handleRejectApplication(sub.id!)}
                                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                          title="Reject Application"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                          Reject
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. CONTACT INQUIRIES */}
                {activeTab === 'contacts' && (
                  <motion.div
                    key="contacts"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Support Inquiries</h3>
                      <p className="text-sm text-gray-500">Messages sent by visitors through the general contact form.</p>
                    </div>

                    {/* Messages Table */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              <th className="px-6 py-4">Sender</th>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">Subject</th>
                              <th className="px-6 py-4">Message</th>
                              <th className="px-6 py-4">Date Sent</th>
                              <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {contactSubmissions.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No contact submissions stored.</td>
                              </tr>
                            ) : (
                              contactSubmissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-gray-900">{sub.name}</td>
                                  <td className="px-6 py-4 font-mono text-xs">{sub.email}</td>
                                  <td className="px-6 py-4 font-semibold text-gray-850 line-clamp-1 max-w-[200px]">{sub.subject}</td>
                                  <td className="px-6 py-4 text-gray-500 line-clamp-1 max-w-[250px]">{sub.message}</td>
                                  <td className="px-6 py-4 font-mono text-xs">
                                    {sub.submittedAt ? sub.submittedAt.split('T')[0] : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      id={`btn-view-contact-${sub.id}`}
                                      onClick={() => setViewingContact(sub)}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      Read
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 5. TEAM SARTHAK */}
                {activeTab === 'team_sarthak' && (
                  <motion.div
                    key="team_sarthak"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">Team Sarthak</h3>
                        <p className="text-sm text-gray-500">Official roster of all accepted volunteers. You can update details or download the complete directory.</p>
                      </div>
                      <button
                        id="btn-download-team-csv"
                        onClick={handleDownloadTeamCSV}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm self-start sm:self-auto"
                      >
                        <Download className="w-4 h-4" />
                        Download Team Roster
                      </button>
                    </div>

                    {/* Team Table */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse font-sans">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                              <th className="px-6 py-4">Team Member</th>
                              <th className="px-6 py-4">Contact Info</th>
                              <th className="px-6 py-4">Blood Group</th>
                              <th className="px-6 py-4">Qualification</th>
                              <th className="px-6 py-4">Residential Address</th>
                              <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {joinSubmissions.filter(s => s.status === 'accepted').length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No team members registered yet. Accept join applications to build Team Sarthak.</td>
                              </tr>
                            ) : (
                              joinSubmissions.filter(s => s.status === 'accepted').map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 flex items-center gap-3">
                                    {sub.recentImage ? (
                                      <img src={sub.recentImage} alt={sub.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-bold text-[10px] border border-rose-100">
                                        Team
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-bold text-gray-900 leading-tight">{sub.name}</p>
                                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Joined: {sub.submittedAt ? sub.submittedAt.split('T')[0] : 'N/A'}</p>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 space-y-0.5">
                                    <p className="font-mono text-xs text-gray-600">{sub.email}</p>
                                    <p className="text-xs font-semibold text-gray-900">{sub.phone}</p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="space-y-1">
                                      <span className="inline-block px-2.5 py-1 bg-red-50 border border-red-150 text-red-700 text-xs font-bold rounded-lg font-mono">
                                        {sub.bloodGroup || 'N/A'}
                                      </span>
                                      {sub.agreeToDonateBlood === 'Yes' && (
                                        <p className="text-[10px] text-green-600 font-semibold">Emergency Donor</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-xs font-medium text-gray-600">
                                    {sub.educationalQualification || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 max-w-[200px] truncate text-xs text-gray-500" title={sub.address}>
                                    {sub.address || 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        id={`btn-view-member-${sub.id}`}
                                        onClick={() => setViewingJoin(sub)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                                        title="View Profile Details"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        Profile
                                      </button>
                                      <button
                                        id={`btn-edit-member-${sub.id}`}
                                        onClick={() => handleOpenMemberEditModal(sub)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors"
                                        title="Edit Member Details"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        id={`btn-delete-member-${sub.id}`}
                                        onClick={() => handleDeleteMember(sub.id!)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                                        title="Delete Member permanently"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            )}
          </main>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto bg-gray-900 border-t border-gray-800 py-6 px-6 text-center text-xs text-gray-400">
        <p>© 2026 SARTHAK NGO Management Suite. Secured Cloud Firestore Active.</p>
      </footer>

      {/* DIALOG MODAL: ADD / EDIT ACTIVITY */}
      <AnimatePresence>
        {isActivityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-150 my-8"
            >
              <div className="bg-rose-600 text-white p-6 flex justify-between items-center">
                <h4 className="font-sans text-xl font-bold tracking-tight">
                  {editingActivity ? 'Modify Activity Entry' : 'Register New Activity'}
                </h4>
                <button
                  id="btn-close-act-form"
                  onClick={() => setIsActivityModalOpen(false)}
                  className="text-white/80 hover:text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="p-6 md:p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                {formError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-medium">
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Activity Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Special Education Kits Giveaway"
                    value={activityForm.title}
                    onChange={(e) => setActivityForm({...activityForm, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Category *</label>
                  <select
                    required
                    value={activityForm.category}
                    onChange={(e) => setActivityForm({...activityForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                  >
                    <option value="Education">Education</option>
                    <option value="Food Relief">Food Relief</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Livelihood">Livelihood</option>
                  </select>
                </div>

                {/* Date Conducted */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Date Conducted *</label>
                  <input
                    type="date"
                    required
                    value={activityForm.date}
                    onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                  />
                </div>

                {/* Location & Impact Badge Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Location *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g., Rural Outskirts"
                      value={activityForm.location}
                      onChange={(e) => setActivityForm({...activityForm, location: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Goal / Impact Achieved (Optional)</label>
                    <input
                      type="text"
                      placeholder="E.g., 200 bags distributed"
                      value={activityForm.goalReached}
                      onChange={(e) => setActivityForm({...activityForm, goalReached: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Image Gallery (Multiple Images) */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-3xl border border-gray-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 uppercase">Activity Images Gallery *</label>
                      <p className="text-[11px] text-gray-500">Add one or more images. The activity card will automatically rotate through them.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-pink-100">
                      {activityForm.imageUrls.length} {activityForm.imageUrls.length === 1 ? 'image' : 'images'}
                    </span>
                  </div>

                  {/* List of current images */}
                  {activityForm.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {activityForm.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 group bg-white shadow-sm">
                          <img
                            src={url}
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => {
                              const newList = activityForm.imageUrls.filter((_, i) => i !== idx);
                              setActivityForm(prev => ({
                                ...prev,
                                imageUrls: newList,
                                imageUrl: prev.imageUrl === url ? (newList[0] || '') : prev.imageUrl
                              }));
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-md cursor-pointer z-10"
                            title="Remove Image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {/* Badge showing index or cover status */}
                          <div className="absolute bottom-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white font-semibold tracking-wider uppercase font-mono z-10">
                            {idx === 0 ? 'Cover' : `#${idx + 1}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form to add a new image URL or Upload an image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Paste URL Input */}
                    <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Add Image via URL</span>
                      <div className="flex gap-2">
                        <input
                          id="input-gallery-url"
                          type="url"
                          placeholder="https://example.com/photo.jpg"
                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 focus:bg-white"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.target as HTMLInputElement).value.trim();
                              if (val) {
                                if (!activityForm.imageUrls.includes(val)) {
                                  const newList = [...activityForm.imageUrls, val];
                                  setActivityForm(prev => ({
                                    ...prev,
                                    imageUrls: newList,
                                    imageUrl: prev.imageUrl ? prev.imageUrl : val
                                  }));
                                }
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('input-gallery-url') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              if (!activityForm.imageUrls.includes(val)) {
                                const newList = [...activityForm.imageUrls, val];
                                setActivityForm(prev => ({
                                  ...prev,
                                  imageUrls: newList,
                                  imageUrl: prev.imageUrl ? prev.imageUrl : val
                                }));
                              }
                              input.value = '';
                            }
                          }}
                          className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    {/* Local Image Uploader */}
                    <div className="bg-white p-3 rounded-2xl border border-gray-200 flex flex-col justify-between space-y-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Add Image via Upload</span>
                      <label className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-dashed border-rose-200 hover:border-rose-300 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer transition-all text-center">
                        <Plus className="w-4 h-4 shrink-0" />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            if (file.size > 10 * 1024 * 1024) {
                              alert("The selected image file is too large! Please choose an image under 10MB.");
                              return;
                            }

                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (typeof reader.result === 'string') {
                                try {
                                  const val = await compressImage(reader.result);
                                  if (!activityForm.imageUrls.includes(val)) {
                                    const newList = [...activityForm.imageUrls, val];
                                    setActivityForm(prev => ({
                                      ...prev,
                                      imageUrls: newList,
                                      imageUrl: prev.imageUrl ? prev.imageUrl : val
                                    }));
                                  }
                                } catch (err) {
                                  console.error(err);
                                  const val = reader.result;
                                  if (!activityForm.imageUrls.includes(val)) {
                                    const newList = [...activityForm.imageUrls, val];
                                    setActivityForm(prev => ({
                                      ...prev,
                                      imageUrls: newList,
                                      imageUrl: prev.imageUrl ? prev.imageUrl : val
                                    }));
                                  }
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                            e.target.value = ''; // clear input
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preset helpers */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-2">Click to Quick Add Preset Photos:</span>
                    <div className="mt-1 flex flex-wrap gap-1.5 font-sans">
                      {PRESET_IMAGES.map((img) => {
                        const isAdded = activityForm.imageUrls.includes(img.url);
                        return (
                          <button
                            key={img.name}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                // Remove
                                const newList = activityForm.imageUrls.filter(u => u !== img.url);
                                setActivityForm(prev => ({
                                  ...prev,
                                  imageUrls: newList,
                                  imageUrl: prev.imageUrl === img.url ? (newList[0] || '') : prev.imageUrl
                                }));
                              } else {
                                // Add
                                const newList = [...activityForm.imageUrls, img.url];
                                setActivityForm(prev => ({
                                  ...prev,
                                  imageUrls: newList,
                                  imageUrl: prev.imageUrl ? prev.imageUrl : img.url
                                }));
                              }
                            }}
                            className={`px-2.5 py-1 border text-[10px] font-semibold rounded-lg cursor-pointer transition-colors ${
                              isAdded
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-650'
                            }`}
                          >
                            {img.name} {isAdded ? '✓' : '+'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Brief Summary (Line clamp on website) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Summary Outline *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a 2-3 sentence overview that appears on the card..."
                    value={activityForm.description}
                    onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Detailed Writing */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Detailed Writing / In-depth Works (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Provide a comprehensive write-up of the event. Explain the timeline, feedback, background, and results. This will show up inside the 'Read More' detail modal..."
                    value={activityForm.details}
                    onChange={(e) => setActivityForm({...activityForm, details: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                  <button
                    id="btn-cancel-act"
                    type="button"
                    onClick={() => setIsActivityModalOpen(false)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-act"
                    type="submit"
                    disabled={formSaving}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-sm font-semibold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {formSaving ? 'Saving Changes...' : 'Save Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: VOLUNTEER REVIEW */}
      <AnimatePresence>
        {viewingJoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="bg-gray-900 text-white p-6 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" />
                  <h4 className="font-sans text-lg font-bold tracking-tight">Review Application</h4>
                </div>
                <button
                  id="btn-close-view-join"
                  onClick={() => setViewingJoin(null)}
                  className="text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  {viewingJoin.recentImage ? (
                    <img src={viewingJoin.recentImage} alt={viewingJoin.name} className="w-16 h-16 rounded-full object-cover border border-gray-250 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-sm uppercase">
                      No Photo
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Applicant Name</p>
                    <p className="font-sans text-lg font-extrabold text-gray-900 leading-tight">{viewingJoin.name}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-red-50 border border-red-100 text-rose-700 text-xs font-semibold rounded-lg font-mono">
                      Blood Group: {viewingJoin.bloodGroup || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Contact Number</p>
                    <p className="font-sans text-sm font-semibold text-gray-800">{viewingJoin.phone}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                    <p className="font-sans text-sm font-semibold text-gray-800 font-mono break-all">{viewingJoin.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Date of Birth</p>
                    <p className="font-sans text-sm font-semibold text-gray-800">{viewingJoin.dob || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Agree to Donate Blood?</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-lg ${
                      viewingJoin.agreeToDonateBlood === 'Yes'
                        ? 'bg-green-50 border border-green-150 text-green-700'
                        : 'bg-gray-50 border border-gray-150 text-gray-600'
                    }`}>
                      {viewingJoin.agreeToDonateBlood || 'No'}
                    </span>
                  </div>
                </div>

                <div className="pb-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Educational Qualification</p>
                  <p className="font-sans text-sm font-semibold text-gray-800 mt-0.5">{viewingJoin.educationalQualification || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Residential Address</p>
                  <p className="font-sans text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {viewingJoin.address || 'N/A'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-gray-400 font-mono">
                    Registered: {viewingJoin.submittedAt ? viewingJoin.submittedAt.split('T')[0] : 'N/A'}
                  </div>
                  
                  <div className="flex items-center gap-2 self-end">
                    {(!viewingJoin.status || viewingJoin.status === 'pending') ? (
                      <>
                        <button
                          id="btn-modal-reject-join"
                          onClick={() => {
                            handleRejectApplication(viewingJoin.id!);
                          }}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          id="btn-modal-accept-join"
                          onClick={() => {
                            handleAcceptApplication(viewingJoin.id!);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept
                        </button>
                      </>
                    ) : viewingJoin.status === 'accepted' ? (
                      <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                        Accepted Member of Team Sarthak
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                        Rejected Application
                      </span>
                    )}
                    <button
                      id="btn-close-view-join-footer"
                      onClick={() => setViewingJoin(null)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-250 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: CONTACT MESSAGE REVIEW */}
      <AnimatePresence>
        {viewingContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
            >
              <div className="bg-gray-900 text-white p-6 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <h4 className="font-sans text-lg font-bold tracking-tight">Support Message</h4>
                </div>
                <button
                  id="btn-close-view-contact"
                  onClick={() => setViewingContact(null)}
                  className="text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Sender Name</p>
                    <p className="font-sans text-sm font-extrabold text-gray-900">{viewingContact.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Subject</p>
                    <p className="font-sans text-sm font-bold text-gray-800 line-clamp-1">{viewingContact.subject}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                    <p className="font-sans text-sm font-semibold text-gray-800 font-mono break-all">{viewingContact.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Phone Number</p>
                    <p className="font-sans text-sm font-semibold text-gray-800">{viewingContact.phone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Message Detail</p>
                  <p className="font-sans text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                    {viewingContact.message}
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs text-gray-400 font-mono">
                  <span>Received: {viewingContact.submittedAt || 'N/A'}</span>
                  <button
                    id="btn-close-view-contact-footer"
                    onClick={() => setViewingContact(null)}
                    className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: EDIT TEAM MEMBER */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-150 my-8"
            >
              <div className="bg-gray-900 text-white p-6 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-rose-500" />
                  <h4 className="font-sans text-lg font-bold tracking-tight">Edit Team Member Details</h4>
                </div>
                <button
                  id="btn-close-edit-member"
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="text-gray-400 hover:text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="p-6 md:p-8 space-y-4 max-h-[80vh] overflow-y-auto">
                {memberFormError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3.5 rounded-xl font-medium">
                    {memberFormError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={memberForm.dob}
                      onChange={(e) => setMemberForm({ ...memberForm, dob: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Blood Group</label>
                    <select
                      value={memberForm.bloodGroup}
                      onChange={(e) => setMemberForm({ ...memberForm, bloodGroup: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Emergency Blood Donor?</label>
                    <select
                      value={memberForm.agreeToDonateBlood}
                      onChange={(e) => setMemberForm({ ...memberForm, agreeToDonateBlood: e.target.value as 'Yes' | 'No' })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                    >
                      <option value="Yes">Yes, willing to donate in emergency</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Educational Qualification</label>
                  <input
                    type="text"
                    value={memberForm.educationalQualification}
                    onChange={(e) => setMemberForm({ ...memberForm, educationalQualification: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Residential Address *</label>
                  <textarea
                    required
                    rows={3}
                    value={memberForm.address}
                    onChange={(e) => setMemberForm({ ...memberForm, address: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-gray-900 whitespace-pre-wrap leading-relaxed"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    id="btn-cancel-edit-member"
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-edit-member"
                    type="submit"
                    disabled={memberSaving}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {memberSaving ? 'Saving Changes...' : 'Save Member Details'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG MODAL: DELETE ACTIVITY CONFIRMATION */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 p-6 md:p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                <Trash2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-sans text-xl font-bold text-gray-900 tracking-tight">Delete Activity Entry?</h3>
                <p className="font-sans text-sm text-gray-500 leading-relaxed">
                  Are you sure you want to delete this activity? This will permanently remove it from both the Admin Hub and the public website dashboard.
                </p>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  id="btn-cancel-delete"
                  onClick={() => setDeleteTargetId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 disabled:bg-gray-50 text-gray-700 font-sans text-sm font-semibold border border-gray-250 rounded-xl cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-delete"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-sans text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-pink-100 hover:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
