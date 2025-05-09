# Technical Assessment Project

A simple web application for uploading, displaying, and searching CSV data using a Node.js backend and a React frontend.

## Features

* CSV File Upload
* Full-Field Search
* Pagination

## Getting Started

### Prerequisites

* Node.js (v18+)
* Docker (if using Docker Compose)

### Installation

1. Clone the repository:

```bash
git clone <repository_url>
```

2. Navigate to the project directory:

```bash
cd technical-assessment
```

3. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```


### Running with Docker

```bash
docker compose up --build
```

### Usage

* Visit `http://localhost:3000` to access the frontend.
* Upload a CSV file.
* Use the search box to find rows based on any field.
* Use the pagination buttons to navigate.

### Cleanup

* Temporary uploaded files are stored in the `backend/uploads/` directory.

