import http from "http";
import Busboy from "busboy";
import fs from "fs";
import csv from "csv-parser";
import { parse } from "url";

let dataStore = [];

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);

  // 📤 Handle CSV Upload
  if (req.method === "POST" && req.url === "/upload") {
    console.log("Received upload");

    const busboy = Busboy({ headers: req.headers });
    let filePath = "";

    busboy.on("file", (fieldname, file, filename) => {
      filePath = `./uploads/${Date.now()}-${filename}`;
      const stream = fs.createWriteStream(filePath);
      file.pipe(stream);

      file.on("end", () => {
        const results = [];
      
        fs.createReadStream(filePath)
          .pipe(csv({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
          .on("data", (row) => {
          
            results.push({
              //postid: row["postid"] || row["postId"] || "",
              id: row["id"] || "",
              name: row["name"] || "",
              email: row["email"] || "",
              body: row["body"] || ""
            });
          })
          
          .on("end", () => {
            dataStore = results;
            fs.unlinkSync(filePath);
            console.log(`Parsed ${results.length} rows`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Upload complete", count: results.length }));
          });
      });
      
    });

    req.pipe(busboy);
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/data") {
    const page = parseInt(parsedUrl.query.page || "1");
    const size = 10;
    const start = (page - 1) * size;
    const paginated = dataStore.slice(start, start + size);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ data: paginated, page, total: dataStore.length }));
    return;
  }

  if (req.method === "GET" && parsedUrl.pathname === "/search") {
    const q = (parsedUrl.query.q || "").toLowerCase();
    const filtered = dataStore.filter((row) =>
      Object.values(row).some((value) =>
        value.toLowerCase().includes(q)
      )
    );
  
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(filtered));
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(4000, () => {
  console.log("✅ Server running at http://localhost:4000");
});
