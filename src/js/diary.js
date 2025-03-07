// components/DiaryEntries/EntryList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEntries } from '../../services/entryService';

const EntryList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await getEntries();
        setEntries(data);
      } catch (err) {
        setError('Failed to load diary entries');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) {
    return <div className="loading">Loading entries...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="entries-container">
        <div className="entries-header">
          <h2>My Diary Entries</h2>
          <Link to="/add-entry" className="btn-primary">Add New Entry</Link>
        </div>
        <p>You haven't created any entries yet.</p>
      </div>
    );
  }

  // Format date from YYYY-MM-DD to a more readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="entries-container">
      <div className="entries-header">
        <h2>My Diary Entries</h2>
        <Link to="/add-entry" className="btn-primary">Add New Entry</Link>
      </div>
      <div className="entry-list">
        {entries.map((entry) => (
          <div key={entry.entry_id} className="entry-card">
            <div className="entry-date">{formatDate(entry.entry_date)}</div>
            <div className="entry-details">
              <div className="entry-item">
                <span className="label">Mood:</span> {entry.mood}
              </div>
              <div className="entry-item">
                <span className="label">Weight:</span> {entry.weight} kg
              </div>
              <div className="entry-item">
                <span className="label">Sleep:</span> {entry.sleep_hours} hours
              </div>
              {entry.notes && (
                <div className="entry-notes">
                  <span className="label">Notes:</span>
                  <p>{entry.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EntryList;

// components/DiaryEntries/EntryForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEntry } from '../../services/entryService';

const EntryForm = () => {
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0], // Default to today
    mood: '',
    weight: '',
    sleep_hours: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await addEntry(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to add entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Diary Entry</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="entry_date">Date</label>
          <input
            type="date"
            id="entry_date"
            name="entry_date"
            value={formData.entry_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mood">Mood</label>
          <input
            type="text"
            id="mood"
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            minLength="3"
            maxLength="25"
            required
            placeholder="How are you feeling today?"
          />
        </div>
        <div className="form-group">
          <label htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            min="2"
            max="200"
            step="0.1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="sleep_hours">Sleep Hours</label>
          <input
            type="number"
            id="sleep_hours"
            name="sleep_hours"
            value={formData.sleep_hours}
            onChange={handleChange}
            min="0"
            max="24"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            maxLength="1500"
            placeholder="Any additional notes for today..."
          ></textarea>
        </div>
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;