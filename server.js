import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3333;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Get all patterns
app.get('/api/patterns', async (req, res) => {
  try {
    const patterns = await getPatternList();
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search patterns
app.get('/api/patterns/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const patterns = await getPatternList();
    const filtered = patterns.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pattern by category and name
app.get('/api/patterns/:category/:name', async (req, res) => {
  try {
    const { category, name } = req.params;
    const filePath = path.join(__dirname, 'patterns', category, `${name}.md`);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ 
      category, 
      name, 
      content,
      url: `https://github.com/richardichogan/vibe-coding-helper/blob/master/patterns/${category}/${name}.md`
    });
  } catch (error) {
    res.status(404).json({ error: 'Pattern not found' });
  }
});

// List patterns by category
app.get('/api/patterns/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const patterns = await getPatternList();
    const filtered = patterns.filter(p => p.category === category);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to scan patterns directory
async function getPatternList() {
  const patterns = [];
  const patternsDir = path.join(__dirname, 'patterns');
  const categories = await fs.readdir(patternsDir);

  for (const category of categories) {
    const categoryPath = path.join(patternsDir, category);
    const stat = await fs.stat(categoryPath);
    
    if (stat.isDirectory()) {
      const files = await fs.readdir(categoryPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const filePath = path.join(categoryPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const name = file.replace('.md', '');
          
          // Extract title from markdown
          const titleMatch = content.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : name;
          
          // Extract description
          const descMatch = content.match(/>\s+(.+)$/m);
          const description = descMatch ? descMatch[1] : '';
          
          patterns.push({
            category,
            name,
            title,
            description,
            url: `https://github.com/richardichogan/vibe-coding-helper/blob/master/patterns/${category}/${name}.md`
          });
        }
      }
    }
  }
  
  return patterns;
}

app.listen(PORT, () => {
  console.log(`Vibe Coding Helper API running on port ${PORT}`);
  console.log(`Access at: http://localhost:${PORT}/api/patterns`);
});
