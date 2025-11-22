'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './dashboard.css';

interface ZoomEntry {
    id: string;
    gmail: string;
    password: string;
    startDate: string;
    endDate: string;
    accountNo: '1' | '2';
    mobileNumber: string;
    createdAt: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<ZoomEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingEntry, setEditingEntry] = useState<ZoomEntry | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ZoomEntry>>({});
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
    const [copiedPasswords, setCopiedPasswords] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/entries');

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            const data = await res.json();
            setEntries(data.entries || []);
        } catch (error) {
            console.error('Failed to fetch entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleEdit = (entry: ZoomEntry) => {
        setEditingEntry(entry);
        setEditFormData({
            gmail: entry.gmail,
            password: entry.password,
            startDate: entry.startDate,
            endDate: entry.endDate,
            accountNo: entry.accountNo,
            mobileNumber: entry.mobileNumber,
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        try {
            const res = await fetch(`/api/entries?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchEntries();
            } else {
                alert('Failed to delete entry');
            }
        } catch (error) {
            alert('An error occurred while deleting');
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingEntry) return;

        try {
            const res = await fetch('/api/entries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingEntry.id,
                    ...editFormData,
                }),
            });

            if (res.ok) {
                setEditingEntry(null);
                setEditFormData({});
                fetchEntries();
            } else {
                alert('Failed to update entry');
            }
        } catch (error) {
            alert('An error occurred while updating');
        }
    };

    const filteredEntries = entries.filter(entry =>
        entry.gmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.mobileNumber.includes(searchTerm)
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const togglePasswordVisibility = (entryId: string) => {
        setVisiblePasswords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(entryId)) {
                newSet.delete(entryId);
            } else {
                newSet.add(entryId);
            }
            return newSet;
        });
    };

    const copyPassword = async (entryId: string, entry: ZoomEntry) => {
        const formattedDate = new Date(entry.endDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const message = `*Product*
*Ordered:* ZOOM PRO

*Go to:* https://zoom.us/signin#/login

*Log-in Details:*

*E-mail:* ${entry.gmail}
*Pass:* ${entry.password}

*Account Details:*

*Account No:* ${entry.accountNo}
*End Date:* ${formattedDate}

Thank you for choosing *LSBD*.`;

        try {
            await navigator.clipboard.writeText(message);
            setCopiedPasswords(prev => new Set(prev).add(entryId));
            setTimeout(() => {
                setCopiedPasswords(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(entryId);
                    return newSet;
                });
            }, 2000);
        } catch (error) {
            alert('Failed to copy details');
        }
    };

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav glass">
                <div className="nav-content">
                    <h1 className="nav-title">LSBD Subscription Manager</h1>
                    <div className="nav-actions">
                        <Link href="/add" className="btn btn-primary">
                            + Add Entry
                        </Link>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="dashboard-main container">
                <div className="dashboard-header fade-in">
                    <div>
                        <h2 className="page-title">Dashboard</h2>
                    </div>
                    <div className="search-box">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by email or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading entries...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-icon">📋</div>
                        <h3>No Entries Found</h3>
                        <p>
                            {searchTerm
                                ? 'No entries match your search criteria'
                                : 'Start by adding your first subscription entry'}
                        </p>
                        {!searchTerm && (
                            <Link href="/add" className="btn btn-primary">
                                Add First Entry
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="entries-grid">
                        {filteredEntries.map((entry, index) => (
                            <div
                                key={entry.id}
                                className="entry-card card glass-hover fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="entry-header">
                                    <div className="entry-date">{formatDate(entry.createdAt)}</div>
                                    <button
                                        onClick={() => copyPassword(entry.id, entry)}
                                        className="copy-all-btn"
                                        title="Copy all details"
                                    >
                                        {copiedPasswords.has(entry.id) ? '✓' : '📋'}
                                    </button>
                                </div>

                                <div className="entry-body">
                                    <div className="entry-field">
                                        <span className="field-label">Gmail</span>
                                        <span className="field-value">{entry.gmail}</span>
                                    </div>

                                    <div className="entry-field">
                                        <span className="field-label">Password</span>
                                        <div className="password-container">
                                            <span className="field-value password-field">
                                                {visiblePasswords.has(entry.id)
                                                    ? entry.password
                                                    : '•'.repeat(entry.password.length)}
                                            </span>
                                            <button
                                                onClick={() => togglePasswordVisibility(entry.id)}
                                                className="password-toggle"
                                                title={visiblePasswords.has(entry.id) ? 'Hide password' : 'Show password'}
                                            >
                                                {visiblePasswords.has(entry.id) ? '👁️' : '👁️‍🗨️'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="entry-field">
                                        <span className="field-label">Mobile</span>
                                        <span className="field-value">{entry.mobileNumber}</span>
                                    </div>

                                    <div className="entry-field">
                                        <span className="field-label">Account No</span>
                                        <span className="field-value">{entry.accountNo}</span>
                                    </div>

                                    <div className="entry-dates">
                                        <div className="date-item">
                                            <span className="date-label">Start</span>
                                            <span className="date-value">{formatDate(entry.startDate)}</span>
                                        </div>
                                        <div className="date-divider">→</div>
                                        <div className="date-item">
                                            <span className="date-label">End</span>
                                            <span className="date-value">{formatDate(entry.endDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="entry-actions">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="btn-icon btn-edit"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="btn-icon btn-delete"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
                }
            </main >

            {/* Edit Modal */}
            {
                editingEntry && (
                    <div className="modal-overlay" onClick={() => setEditingEntry(null)}>
                        <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Edit Entry</h3>
                                <button
                                    className="modal-close"
                                    onClick={() => setEditingEntry(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleUpdateSubmit} className="modal-form">
                                <div className="form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Gmail *</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={editFormData.gmail || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, gmail: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Password *</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={editFormData.password || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Start Date *</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={editFormData.startDate || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">End Date *</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={editFormData.endDate || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Account No *</label>
                                        <select
                                            className="input-field"
                                            value={editFormData.accountNo || '1'}
                                            onChange={(e) => setEditFormData({ ...editFormData, accountNo: e.target.value as '1' | '2' })}
                                            required
                                        >
                                            <option value="1">Account 1</option>
                                            <option value="2">Account 2</option>
                                        </select>
                                    </div>

                                    <div className="input-group">
                                        <label className="input-label">Mobile Number *</label>
                                        <input
                                            type="tel"
                                            className="input-field"
                                            value={editFormData.mobileNumber || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setEditingEntry(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Update Entry
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
