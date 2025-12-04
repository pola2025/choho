const fs = require('fs');

const content = `import {
  Hero,
  Welcome,
  RoomList,
  CheckinGuide,
  Facilities,
  JournalPreview,
} from "@/components/sections";
import { CombinedWinterPopup } from "@/components/CombinedWinterPopup";

export default function Home() {
  return (
    <main className="-mt-16">
      <Hero />
      <Welcome />
      <RoomList />
      <CheckinGuide />
      <Facilities />
      <JournalPreview />
      <CombinedWinterPopup />
    </main>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log('Updated page.tsx with CombinedWinterPopup!');
