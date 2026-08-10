const fs = require('fs');
const file = 'd:/10Pearls Internship/NotesApp/cohort-9-mern-12302-ahmad/backend/test/auth.test.js';
let content = fs.readFileSync(file, 'utf8');

// Wrap contents of all it() blocks in try/catch
content = content.replace(/it\('([^']+)', async \(\) => \{\n([\s\S]*?)\n    \}\);/g, (match, title, body) => {
  const indentedBody = body.split('\n').map(line => '  ' + line).join('\n');
  return `it('${title}', async () => {\n      try {\n${indentedBody}\n      } catch (error) {\n        throw error;\n      }\n    });`;
});

fs.writeFileSync(file, content);
