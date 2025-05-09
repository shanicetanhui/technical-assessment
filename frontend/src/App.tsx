import { useState, useEffect, useCallback } from "react";
import React from "react";
import './App.css';

function App() {
  const [file,    setFile]    = useState<File | null>(null);
  const [data,    setData]    = useState<any[]>([]);
  const [page,    setPage]    = useState(1);
  const [query,   setQuery]   = useState("");
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  // Fetch with loading + error handling
  const fetchData = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/data?page=${p}`);
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const json = await res.json();
        setData(json.data);
        setTotal(json.total);
        setPage(p);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  // Upload with validation + loading/error
  const upload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are allowed.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await fetchData(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Search with loading+error too
  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const json = await res.json();
      setData(json);
      setTotal(json.length);
      setPage(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const canPrev = !loading && page > 1;
  const canNext = !loading && page * 10 < total;

  return (
    <div className="container">
      <h2>CSV Uploader</h2>

      {/* Error banner */}
      {error && <div className="error">{error}</div>}

      {/* Loading spinner */}
      {loading && <div className="loading">Loading…</div>}

      <div className="upload-section">
        <input
          type="file"
          accept=".csv"
          disabled={loading}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button onClick={upload} disabled={loading || !file}>
          Upload
        </button>
      </div>

      <div className="search-section">
        <input
          type="text"
          value={query}
          disabled={loading}
          placeholder="Search by name"
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={search} disabled={loading || !query.trim()}>
          Search
        </button>
      </div>

      <div className="pagination">
        <button onClick={() => fetchData(page - 1)} disabled={!canPrev}>
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => fetchData(page + 1)} disabled={!canNext}>
          Next
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Body</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.id}</td>
              <td>{row.name}</td>
              <td>{row.email}</td>
              <td>{row.body}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && data.length === 0 && <p>No data available.</p>}
    </div>
  );
}

export default App;
