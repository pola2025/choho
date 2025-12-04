import {
  Hero,
  Welcome,
  RoomList,
  CheckinGuide,
  Facilities,
  JournalPreview,
  Gallery,
  InstagramTags,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="-mt-16">
      <Hero />
      <Welcome />
      <RoomList />
      <CheckinGuide />
      <Facilities />
      <JournalPreview />
      <Gallery />
      <InstagramTags />
    </main>
  );
}
