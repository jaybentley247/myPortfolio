const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const DATA_FILE = path.join(__dirname, 'projects.json');

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // API: GET All Projects
    if (pathname === '/api/projects' && req.method === 'GET') {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(data);
    }

    // API: POST Create Project
    if (pathname === '/api/projects' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const newProject = JSON.parse(body);
                const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                newProject.id = Date.now().toString();
                data.unshift(newProject);
                fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Project Created', project: newProject }));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid Data' }));
            }
        });
        return;
    }

    // API: PUT Update Project
    if (pathname === '/api/projects' && req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const updatedProject = JSON.parse(body);
                const id = query.id;
                let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
                // Flexible comparison (==) to handle both strings and numbers
                const index = data.findIndex(p => p.id == id);
                
                if (index !== -1) {
                    // Maintain original ID but update all other fields
                    data[index] = { ...data[index], ...updatedProject, id: data[index].id };
                    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Project Updated' }));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Project not found' }));
                }
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid Data' }));
            }
        });
        return;
    }

    // API: DELETE Project
    if (pathname === '/api/projects' && req.method === 'DELETE') {
        const id = query.id;
        let data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        // Flexible comparison (==)
        const newData = data.filter(p => p.id != id);
        
        if (data.length !== newData.length) {
            fs.writeFileSync(DATA_FILE, JSON.stringify(newData, null, 2));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Project Deleted' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Project not found' }));
        }
        return;
    }

    // Static File Server
    let filePath = '.' + pathname;
    if (filePath === './') filePath = './index.html';
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(404);
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Backend Server running at http://localhost:${PORT}/`);
});
