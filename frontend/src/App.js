import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

const fmt = (n) =>
  'R ' + Number(n).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function App() {
  const [form, setForm]       = useState({ name: '', annual_income: '', age: '' });
  const [result, setResult]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/calculate`);
      setHistory(data);
    } catch {

    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.annual_income || isNaN(form.annual_income) || Number(form.annual_income) <= 0) {
      setError('Please enter a valid annual income.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_BASE}/api/calculate`, {
        name:          form.name || 'Anonymous',
        annual_income: Number(form.annual_income),
        age:           Number(form.age) || 30,
      });
      setResult(data);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/calculate?id=${id}`);
      setHistory(h => h.filter(item => item.id !== id));
      if (result?.id === id) setResult(null);
    } catch {
      setError('Could not delete record.');
    }
  };

  const handleReset = () => {
    setForm({ name: '', annual_income: '', age: '' });
    setResult(null);
    setError('');
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="header-logo">Tax<span>Ready</span> SA</div>
        <div className="header-sub">SARS Tax Calculator · 2026/27</div>
      </header>

      <main className="main">

        {/* HERO */}
        <div className="hero">
          <h1>Know Your <span>Tax Liability</span></h1>
          <p>Enter your annual income to calculate your SARS tax bracket,
             effective rate, and monthly take-home pay.</p>
        </div>

        {/* FORM */}
        <div className="card">
          <div className="card-title">Calculate Tax</div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group full">
                <label htmlFor="name">Your Name (optional)</label>
                <input
                  id="name" name="name" type="text"
                  placeholder="e.g. Fatma Ben Azouz"
                  value={form.name} onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="annual_income">Annual Income (R)</label>
                <input
                  id="annual_income" name="annual_income" type="number"
                  placeholder="e.g. 450000"
                  value={form.annual_income} onChange={handleChange}
                  min="1" required
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  id="age" name="age" type="number"
                  placeholder="e.g. 30"
                  value={form.age} onChange={handleChange}
                  min="18" max="100"
                />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Calculating...' : 'Calculate My Tax'}
            </button>
          </form>
        </div>

        {/* RESULTS */}
        {result && (
          <div className="card results">
            <div className="results-header">
              <div className="results-name">{result.name}</div>
              <div className="results-tag">2026/27 Tax Year</div>
            </div>
            <div className="stats-grid">
              <div className="stat">
                <div className="stat-label">Annual Income</div>
                <div className="stat-value">{fmt(result.annual_income)}</div>
              </div>
              <div className="stat highlight">
                <div className="stat-label">Tax Liability</div>
                <div className="stat-value">{fmt(result.tax_liability)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Take-Home Pay</div>
                <div className="stat-value">{fmt(result.take_home)}</div>
              </div>
            </div>
            <div className="monthly-row">
              <div className="monthly-item">
                <span>Effective Tax Rate</span>
                <span>{result.effective_rate}%</span>
              </div>
              <div className="monthly-item">
                <span>Marginal Rate</span>
                <span>{result.marginal_rate}%</span>
              </div>
              <div className="monthly-item">
                <span>Monthly Take-Home</span>
                <span>{fmt(result.monthly_take_home)}</span>
              </div>
              <div className="monthly-item">
                <span>Monthly Tax</span>
                <span>{fmt(result.monthly_tax)}</span>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="btn-ghost" onClick={handleReset}>← New Calculation</button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        <div className="card">
          <div className="card-title">Recent Calculations</div>
          {histLoading ? (
            <div className="loading"><div className="spinner" /> Loading history...</div>
          ) : history.length === 0 ? (
            <div className="empty-state">No calculations yet. Run your first one above.</div>
          ) : (
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-left">
                    <div className="history-name">{item.name}</div>
                    <div className="history-income">
                      {fmt(item.annual_income)} per year · Age {item.age}
                    </div>
                  </div>
                  <div className="history-right">
                    <div className="history-tax">
                      <div className="history-tax-amount">{fmt(item.tax_liability)}</div>
                      <div className="history-tax-rate">{item.effective_rate}% effective</div>
                    </div>
                    <button
                      className="btn-ghost"
                      onClick={() => handleDelete(item.id)}
                      title="Delete"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        Built for <span>Tax Consulting SA</span> · Based on SARS 2026/27 tax tables · For illustrative purposes only
      </footer>
    </div>
  );
}