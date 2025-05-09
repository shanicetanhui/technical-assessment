import { useState, useEffect, useCallback } from "react";
import React from "react";
import './App.css';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [total, setTotalRows] = useState(0);

  // Fetch Data from server with pagination
  const fetchData = useCallback(async (pageNum = page) => {
    const res = await fetch(`/data?page=${pageNum}`);
    const result = await res.json();
    setData(result.data);
    setTotalRows(result.total);
    setPage(pageNum);
  }, [page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle CSV file upload
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

  // Handle search bar
  const search = async () => {
    const res = await fetch(`/search?q=${query}`);
    const result = await res.json();
    setData(result);
    setTotalRows(result.length);
    setPage(1);
  };

  // Pagination navigation
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

      {/* Data table */}
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


      {data.length === 0 && (
        <p>No more data available</p>
      )}
    </div>
  );
}

export default App;
