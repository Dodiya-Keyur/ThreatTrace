import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ChevronRight,
  User,
  Shield,
  ShieldAlert,
  KeyRound,
  Smartphone,
  Laptop,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  // Profile state
  const [profileName, setProfileName] = useState(user?.name || 'Keyur Dodiya');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'keyur@example.com');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profileName);
  const [editEmail, setEditEmail] = useState(profileEmail);

  // Security state
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Threat Detection Toggles
  const [detectionSettings, setDetectionSettings] = useState({
    emailScanning: true,
    phishingDetection: true,
    malwareDetection: true,
    threatNotifications: true,
  });

  const toggleDetection = (key) => {
    setDetectionSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;
    setProfileName(editName.trim());
    setProfileEmail(editEmail.trim());
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account and threat detection preferences
        </p>
      </div>

      {/* 2. GENERAL SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          General
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              <h3 className="text-base font-bold text-slate-900">Profile</h3>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => {
                  setEditName(profileName);
                  setEditEmail(profileEmail);
                  setIsEditingProfile(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Name</span>
                <span className="font-semibold text-slate-900">{profileName}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Email</span>
                <span className="font-mono text-slate-900 font-medium">{profileEmail}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-black rounded-lg hover:bg-neutral-800 shadow-2xs cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 3. SECURITY SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Security
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Change Password */}
          <div
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-900">Change Password</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4.5">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-sm font-medium text-slate-900">Two-Factor Authentication</span>
                <p className="text-xs text-slate-400 mt-0.5">Protect account with authenticator app</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                twoFactor
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {twoFactor ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Login Sessions */}
          <div
            onClick={() => setShowSessionsModal(true)}
            className="flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-sm font-medium text-slate-900">Login Sessions</span>
                <p className="text-xs text-slate-400 mt-0.5">Manage your active devices and sessions</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </section>

      {/* 4. THREAT DETECTION SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Threat Detection
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs overflow-hidden">
          {/* Email Threat Scanning */}
          <div className="flex items-center justify-between p-4.5">
            <div>
              <span className="text-sm font-medium text-slate-900">Email Threat Scanning</span>
              <p className="text-xs text-slate-400 mt-0.5">Deep inspection of .eml and .msg headers</p>
            </div>
            <button
              onClick={() => toggleDetection('emailScanning')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                detectionSettings.emailScanning
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {detectionSettings.emailScanning ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Phishing Detection */}
          <div className="flex items-center justify-between p-4.5">
            <div>
              <span className="text-sm font-medium text-slate-900">Phishing Detection</span>
              <p className="text-xs text-slate-400 mt-0.5">Brand typosquatting and deceptive URL analysis</p>
            </div>
            <button
              onClick={() => toggleDetection('phishingDetection')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                detectionSettings.phishingDetection
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {detectionSettings.phishingDetection ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Malware Detection */}
          <div className="flex items-center justify-between p-4.5">
            <div>
              <span className="text-sm font-medium text-slate-900">Malware Detection</span>
              <p className="text-xs text-slate-400 mt-0.5">VirusTotal payload hash cross-correlation</p>
            </div>
            <button
              onClick={() => toggleDetection('malwareDetection')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                detectionSettings.malwareDetection
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {detectionSettings.malwareDetection ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Threat Notifications */}
          <div className="flex items-center justify-between p-4.5">
            <div>
              <span className="text-sm font-medium text-slate-900">Threat Notifications</span>
              <p className="text-xs text-slate-400 mt-0.5">Real-time alerts for critical score events (85+)</p>
            </div>
            <button
              onClick={() => toggleDetection('threatNotifications')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                detectionSettings.threatNotifications
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {detectionSettings.threatNotifications ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </section>

      {/* 5. DANGER ZONE SECTION */}
      <section className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-red-600">
          Danger Zone
        </h2>

        <div className="bg-red-50/50 border border-red-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-700">Delete Account</h3>
            <p className="text-xs text-slate-600 mt-1">
              Permanently delete your account, session logs, and associated evidence data.
            </p>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* MODAL: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setShowPasswordModal(false); }} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input type="password" required placeholder="••••••••" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input type="password" required placeholder="Enter new strong password" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input type="password" required placeholder="Confirm new password" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-black rounded-lg hover:bg-neutral-800">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Active Login Sessions */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Active Login Sessions</h3>
              <button onClick={() => setShowSessionsModal(false)} className="text-slate-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-slate-600" /> Windows 11 · Chrome (Current)
                  </p>
                  <p className="text-slate-400 mt-0.5">IP: 192.168.1.45 · Mumbai, India</p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">Active</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={() => setShowSessionsModal(false)} className="px-4 py-1.5 text-xs font-bold text-white bg-black rounded-lg hover:bg-neutral-800">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Delete Account Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Account Permanently?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  This action cannot be undone. All your investigation dossiers, scan records, and custom evidence cases will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowDeleteModal(false)} className="px-3.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700">Cancel</button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-xs"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
