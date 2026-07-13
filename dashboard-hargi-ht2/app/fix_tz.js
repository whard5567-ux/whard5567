const fs = require('fs');
const files = [
  'src/app/page.tsx',
  'src/app/ce-abo/page.tsx',
  'src/app/asset-maps/page.tsx',
  'src/app/pareto/page.tsx',
  'src/app/asesment-bushing/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/sheet_modified_ce at time zone/g, 'sheet_modified_ce::timestamptz at time zone');
    content = content.replace(/sheet_modified_pareto at time zone/g, 'sheet_modified_pareto::timestamptz at time zone');
    content = content.replace(/sheet_modified_abo at time zone/g, 'sheet_modified_abo::timestamptz at time zone');
    content = content.replace(/sheet_modified_bushing at time zone/g, 'sheet_modified_bushing::timestamptz at time zone');
    content = content.replace(/finished_at at time zone/g, 'finished_at::timestamptz at time zone');
    content = content.replace(/now\(\) at time zone/g, 'now()::timestamptz at time zone');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
