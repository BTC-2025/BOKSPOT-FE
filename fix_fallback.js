const fs = require('fs');
const file = 'c:\\Users\\gmvin\\Desktop\\Projects\\BOKSPOT\\BOKSPOT-BUS-FE\\src\\lib\\store.ts';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(
  "let validCategoryId = '712cb562-7f6a-4fea-9145-00c6da59ebc3'; // Fallback",
  "let validCategoryId = isProd ? 'b06981f6-b12b-4905-be30-d74da4b6906b' : '712cb562-7f6a-4fea-9145-00c6da59ebc3'; // Prod/Local Fallback"
);
fs.writeFileSync(file, content);
console.log('Fixed validCategoryId fallback in store.ts');
