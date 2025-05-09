# Technical Assessment

A simple web application for uploading, displaying, and searching CSV data using a Node.js backend and a React frontend.

## Features

* CSV file upload
* Full‐field search
* Pagination

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) v18 or higher
* [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### Run with Docker Compose

```bash
docker-compose up --build
```

* Backend → `http://localhost:4000`
* Frontend → `http://localhost:3000`

## Usage

1. Open your browser to **`http://localhost:3000`**.
2. Click **Upload**, select a `.csv` file (columns: `id`, `name`, `email`, `body`).
3. Use the **Search** box to filter results.
4. Navigate pages with **Prev** / **Next**.

## Data Storage

* Uploaded rows are persisted in a JSON file at `backend/db.json` via \[lowdb].
* Raw CSVs are written temporarily to `backend/uploads/` and deleted after parsing.
* Both `db.json` and `uploads/` are listed in `.gitignore`.

## Cleanup

* Temporary upload files are removed automatically.
* To reset stored data entirely, delete `backend/db.json`.
