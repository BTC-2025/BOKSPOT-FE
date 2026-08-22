const fs = require('fs');
const file = 'c:\\Users\\gmvin\\Desktop\\Projects\\BOKSPOT\\BOKSPOT-BUS-FE\\src\\lib\\store.ts';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(
  "const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';\n      const baseUrl = isProd ? 'https://bokspot-be.onrender.com/api/v1' : (process.env.NEXT_PUBLIC_API_URL || '/api/v1');",
  "const isProd = process.env.NODE_ENV === 'production';\n      const baseUrl = isProd ? 'https://bokspot-be.onrender.com/api/v1' : 'http://localhost:9000/api/v1';"
);
fs.writeFileSync(file, content);
console.log('Fixed updateMerchantProfile baseUrl in store.ts');
