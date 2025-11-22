'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './add.css';

export default function AddEntryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        gmail: '',
        password: '',
        startDate: '',
        endDate: '',
        accountNo: '1' as '1' | '2',
        mobileNumber: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // If start date is changed, automatically set end date to 14 days later
        if (name === 'startDate' && value) {
            const startDate = new Date(value);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 14);

            // Format end date as YYYY-MM-DD for input field
            const endDateString = endDate.toISOString().split('T')[0];

            setFormData({
                ...formData,
                startDate: value,
                endDate: endDateString,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/entries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setError(data.error || 'Failed to add entry');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    return (
        <div className="add-container">
            <nav className="add-nav glass">
                <div className="nav-content">
                    <h1 className="nav-title">LSBD Subscription Manager</h1>
                    <div className="nav-actions">
                        <Link href="/dashboard" className="btn btn-secondary">
                            ← Dashboard
                        </Link>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="add-main container">
                <div className="add-content fade-in">
                    <div className="add-header">
                        <h2 className="page-title">Add New Entry</h2>
                    </div>

                    {success ? (
                        <div className="success-card card">
                            <div className="success-icon">✓</div>
                            <h3>Entry Added Successfully!</h3>
                            <p>Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="add-form card">
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="input-group">
                                    <label htmlFor="gmail" className="input-label">Gmail *</label>
                                    <input
                                        id="gmail"
                                        name="gmail"
                                        type="email"
                                        className="input-field"
                                        placeholder="example@gmail.com"
                                        value={formData.gmail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password" className="input-label">Password *</label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="text"
                                        className="input-field"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="startDate" className="input-label">Start Date *</label>
                                    <input
                                        id="startDate"
                                        name="startDate"
                                        type="date"
                                        className="input-field"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="endDate" className="input-label">End Date *</label>
                                    <input
                                        id="endDate"
                                        name="endDate"
                                        type="date"
                                        className="input-field"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="accountNo" className="input-label">Account No *</label>
                                    <select
                                        id="accountNo"
                                        name="accountNo"
                                        className="input-field"
                                        value={formData.accountNo}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="1">Account 1</option>
                                        <option value="2">Account 2</option>
                                    </select>
                                </div>

                                <div className="input-group">
                                    <label htmlFor="mobileNumber" className="input-label">Mobile Number *</label>
                                    <input
                                        id="mobileNumber"
                                        name="mobileNumber"
                                        type="tel"
                                        className="input-field"
                                        placeholder="+1234567890"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <Link href="/dashboard" className="btn btn-secondary">
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Entry'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
