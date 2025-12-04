import {
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
