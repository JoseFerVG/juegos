const fs = require('fs');
const path = require('path');
const dir = __dirname;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html');

for (const file of files) {
    const fp = path.join(dir, file);
    let content = fs.readFileSync(fp, 'utf8');
    
    // Replace <style> block
    const injection = `<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;800;900&display=swap" rel="stylesheet">\n    <link rel="stylesheet" href="style.css">`;
    content = content.replace(/<style>[\s\S]*?<\/style>/gi, injection);
    
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Updated', file);
}
