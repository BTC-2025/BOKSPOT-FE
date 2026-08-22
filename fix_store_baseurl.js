const fs = require('fs');
const file = 'c:\\Users\\gmvin\\Desktop\\Projects\\BOKSPOT\\BOKSPOT-BUS-FE\\src\\lib\\store.ts';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(
  /const baseUrl = process\.env\.NEXT_PUBLIC_API_URL \|\| \(isProd \? 'https:\/\/bokspot-be\.onrender\.com\/api\/v1' : '.*?'\);/g,
  "const baseUrl = isProd ? 'https://bokspot-be.onrender.com/api/v1' : 'http://localhost:9000/api/v1';"
);
fs.writeFileSync(file, content);
console.log('Fixed ALL baseUrl in store.ts');
