import fs from 'fs';

const pageFile = 'src/app/page.tsx';
const radarFile = 'src/components/home/NearbyRadar.tsx';

let pageContent = fs.readFileSync(pageFile, 'utf8');
let radarContent = fs.readFileSync(radarFile, 'utf8');

// The block to extract starts from:
// const cityCenter = useMemo(() => {
// and ends at:
//     }
//   }, [homepageNearbyServices, selectedNearbyService]);

const startExtract = pageContent.indexOf('const cityCenter = useMemo(() => {');
const endExtractStr = '  }, [homepageNearbyServices, selectedNearbyService]);';
const endExtract = pageContent.indexOf(endExtractStr, startExtract) + endExtractStr.length;

if (startExtract !== -1 && endExtract !== -1) {
  const extractedLogic = pageContent.substring(startExtract, endExtract);
  
  // Clean up page.tsx
  // We also need to remove:
  // const [realServices, setRealServices] = useState<any[]>([]);
  // const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  // const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);

  pageContent = pageContent.substring(0, startExtract) + pageContent.substring(endExtract);
  
  pageContent = pageContent.replace(/const \[realServices, setRealServices\] = useState<any\[\]>\(\[\]\);\n/, '');
  pageContent = pageContent.replace(/const \[userPannedCenter, setUserPannedCenter\] = useState<\[number, number\] \| null>\(null\);\n/, '');
  pageContent = pageContent.replace(/const \[selectedNearbyService, setSelectedNearbyService\] = useState<any>\(null\);\n/, '');
  
  fs.writeFileSync(pageFile, pageContent);

  // Update NearbyRadar.tsx
  // 1. Remove the fake imports and states I put in earlier
  radarContent = radarContent.replace(/import { homepageNearbyServices } from '\.\.\/\.\.\/lib\/homeData';\n/, '');
  
  // Also we need to import api, calculateDistance, getProvidersByCategory, CITY_COORDINATES
  const newImports = `import { api } from '../../lib/api';
import { calculateDistance, getProvidersByCategory } from '../../lib/mockData';
import { CITY_COORDINATES } from '../../lib/homeData';
`;
  radarContent = radarContent.replace(/import { useLocationStore } from '\.\.\/\.\.\/lib\/store';\n/, "import { useLocationStore } from '../../lib/store';\n" + newImports);
  
  // Also need to add useMemo and useEffect to react import
  radarContent = radarContent.replace(/import { useState } from 'react';/, "import { useState, useMemo, useEffect } from 'react';");
  
  // Replace the fake state inside NearbyRadar with the extracted logic
  const fakeStateBlockStart = radarContent.indexOf('  const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);');
  const fakeStateBlockEnd = radarContent.indexOf('  const mapCenter: [number, number] = [13.0827, 80.2707];\n') + '  const mapCenter: [number, number] = [13.0827, 80.2707];\n'.length;
  
  if (fakeStateBlockStart !== -1) {
    const beforeFake = radarContent.substring(0, fakeStateBlockStart);
    const afterFake = radarContent.substring(fakeStateBlockEnd);
    
    // We need to add the LocationStore hooks to NearbyRadar since we removed them from the fake state
    const radarHooks = `  const { city, latitude, longitude } = useLocationStore();
  const [realServices, setRealServices] = useState<any[]>([]);
  const [userPannedCenter, setUserPannedCenter] = useState<[number, number] | null>(null);
  const [selectedNearbyService, setSelectedNearbyService] = useState<any>(null);
  
${extractedLogic}
`;
    
    // And we need to remove `const { city } = useLocationStore();` from the original radar string
    const beforeFakeCleaned = beforeFake.replace(/  const \{ city \} = useLocationStore\(\);\n/, '');
    
    radarContent = beforeFakeCleaned + radarHooks + afterFake;
    
    fs.writeFileSync(radarFile, radarContent);
    console.log('Fixed NearbyRadar logic');
  } else {
    console.log('Fake state block not found in NearbyRadar');
  }

} else {
  console.log('Could not find extract boundaries in page.tsx');
}
