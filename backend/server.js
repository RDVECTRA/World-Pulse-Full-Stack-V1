import express from 'express';
import Parser from 'rss-parser';
import Database from 'better-sqlite3';

const app = express();
app.use(express.json());

// Banco de dados
const db = new Database('db.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    title TEXT,
    summary TEXT,
    source TEXT,
    link TEXT UNIQUE,
    published TEXT
  );
`);

const parser = new Parser();

// Fontes públicas
const SOURCES = [
  {
    category: 'health',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    source: 'WHO'
  },
  {
    category: 'science',
    url: 'https://www.sciencedaily.com/rss/all.xml',
    source: 'ScienceDaily'
  },
  {
    category: 'world',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    source: 'BBC'
  }
];

// Coleta automática
async function ingest() {
  for (const s of SOURCES) {
    try {
      const feed = await parser.parseURL(s.url);
      for (const item of feed.items.slice(0, 5)) {
        const exists = db
          .prepare('SELECT 1 FROM events WHERE link = ?')
          .get(item.link);

        if (!exists) {
          db.prepare(`
            INSERT INTO events 
            (category, title, summary, source, link, published)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            s.category,
            item.title,
            item.contentSnippet || '',
            s.source,
            item.link,
            item.pubDate || ''
          );
        }
      }
    } catch (err) {
      console.error('Erro ao coletar:', s.source);
    }
  }
}

// Executa a cada 30 minutos
setInterval(ingest, 1000 * 60 * 30);
ingest();

// API
app.get('/api/events', (req, res) => {
  const events = db
    .prepare('SELECT * FROM events ORDER BY id DESC LIMIT 50')
    .all();
  res.json(events);
});

app.listen(3000, () => {
  console.log('WorldPulse API rodando em http://localhost:3000');
});
