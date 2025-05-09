// index.mjs
import http      from 'http';
import Busboy    from 'busboy';
import fs        from 'fs';
import path      from 'path';
import csvParser from 'csv-parser';
import { parse } from 'url';
import { Low }       from 'lowdb';
import { JSONFile }  from 'lowdb/node';

const DB_FILE = path.resolve('.', 'db.json');
const adapter     = new JSONFile(DB_FILE);
const defaultData = { rows: [] };
const db          = new Low(adapter, defaultData);

(async () => {

  await db.read();
  db.data ||= { rows: [] };
  await db.write();

  const UPLOAD_DIR = path.resolve('.', 'uploads');
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

  const server = http.createServer((req, res) => {
    const { pathname, query } = parse(req.url||'', true);

    // Upload CSV 
    if (req.method === 'POST' && pathname === '/upload') {
      const bb = Busboy({ headers: req.headers });
      let tmpPath;

      bb.on('file', (_f, file, name) => {
        tmpPath = path.join(UPLOAD_DIR, `${Date.now()}-${name}`);
        file.pipe(fs.createWriteStream(tmpPath));
      });

      bb.on('finish', () => {
        const rows = [];
        fs.createReadStream(tmpPath)
          .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
          .on('data', r => {
            if (r.id && r.name && r.email) {
              rows.push({ id: r.id, name: r.name, email: r.email, body: r.body||'' });
            }
          })
          .on('end', async () => {
            fs.unlinkSync(tmpPath);
            db.data.rows = rows;
            await db.write();
            res.writeHead(200, {'Content-Type':'application/json'});
            res.end(JSON.stringify({ message:'Upload complete', count:rows.length }));
          });
      });

      return req.pipe(bb);
    }

    // Paginated fetch
    if (req.method === 'GET' && pathname === '/data') {
      const page  = Math.max(1, parseInt(query.page||'1',10));
      const size  = 10;
      const start = (page-1)*size;
      const slice = db.data.rows.slice(start, start+size);
      res.writeHead(200, {'Content-Type':'application/json'});
      return res.end(JSON.stringify({ data: slice, page, total: db.data.rows.length }));
    }

    // Search 
    if (req.method === 'GET' && pathname === '/search') {
      const q = (query.q||'').toLowerCase();
      const filtered = db.data.rows.filter(r =>
        r.id.includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q)
      );
      res.writeHead(200, {'Content-Type':'application/json'});
      return res.end(JSON.stringify(filtered));
    }


    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(4000, () => {
    console.log('Server running at http://localhost:4000');
  });
})();
