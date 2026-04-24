"use client";

import { useCover } from "@/lib/useCover";

type Album = {
  title: string;
  artist: string;
  rating: number;
  mbid: string;
};

export default function AlbumCard({ album }: { album: Album }) {
  const cover = useCover(album.mbid);

  return (
    <div className="flex items-center gap-4 p-4">
      <img
        src={cover ?? undefined}
        className="w-16 h-16 rounded object-cover"
      />
      <div>
        <h2 className="text-sm font-semibold">{album.title}</h2>
        <p className="text-xs opacity-70">{album.artist}</p>
      </div>
    </div>
  );
}