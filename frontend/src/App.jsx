import { useState } from 'react';
import './App.css';

function App() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const payload = { content };
      
      if (ttlSeconds) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          setError('TTL must be a positive integer');
          setLoading(false);
          return;
        }
        payload.ttl_seconds = ttl;
      }

      if (maxViews) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          setError('Max views must be a positive integer');
          setLoading(false);
          return;
        }
        payload.max_views = views;
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to create paste';
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } else {
          const text = await response.text();
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setSuccess(data);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (success?.url) {
      navigator.clipboard.writeText(success.url);
      alert('URL copied to clipboard!');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>📋 Pastebin Lite</h1>
          <p>Share text snippets with optional expiry and view limits</p>
        </header>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <strong>Success!</strong> Your paste has been created.
            <div className="success-content">
              <p className="url-label">Share this URL:</p>
              <div className="url-box">
                <input
                  type="text"
                  readOnly
                  value={success.url}
                  className="url-input"
                />
                <button onClick={copyToClipboard} className="btn-copy">
                  Copy
                </button>
              </div>
              <a href={success.url} target="_blank" rel="noopener noreferrer" className="btn-view">
                View Paste
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="paste-form">
          <div className="form-group">
            <label htmlFor="content">Paste Content *</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
              required
              rows={12}
              className="textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ttl">TTL (seconds)</label>
              <input
                type="number"
                id="ttl"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                placeholder="Optional"
                min="1"
                className="input"
              />
              <small className="help-text">Time until paste expires</small>
            </div>

            <div className="form-group">
              <label htmlFor="maxViews">Max Views</label>
              <input
                type="number"
                id="maxViews"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Optional"
                min="1"
                className="input"
              />
              <small className="help-text">Maximum number of views</small>
            </div>
          </div>

          <button type="submit" disabled={loading || !content} className="btn-submit">
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
