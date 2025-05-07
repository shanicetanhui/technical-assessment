import { useState, useEffect, useCallback } from "react";
import React from "react";
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async (pageNum = page) => {
    const res = await fetch(`/data?page=${pageNum}`);
    const result = await res.json();
    setData(result.data);
    setTotal(result.total);
    setPage(pageNum);
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const upload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    fetchData(1);
  };

  const search = async () => {
    const res = await fetch(`/search?q=${query}`);
    const result = await res.json();
    setData(result);
    setTotal(result.length);
  };

  const canGoNext = data.length > 0 && page * 10 < total;
  const canGoPrev = page > 1;

  return (
    <div className="container">
      <h2>CSV Uploader</h2>

      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={upload}>Upload</button>

      <br /><br />

      <input
        type="text"
        value={query}
        placeholder="Search by name"
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={search}>Search</button>

      <br /><br />
      <button disabled={!canGoPrev} onClick={() => fetchData(page - 1)}>Prev</button>
      <button disabled={!canGoNext} onClick={() => fetchData(page + 1)}>Next</button>

      <table>
        <thead>
          <tr><th>Name</th><th>Email</th></tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}><td>{row.name}</td><td>{row.email}</td></tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <p>No more data available</p>
      )}
    </div>
  );
}

export default App;
