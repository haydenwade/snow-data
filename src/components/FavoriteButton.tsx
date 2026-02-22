"use client";

import { Star } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

type FavoriteButtonProps = {
  locationId: string;
  size?: "sm" | "md";
  className?: string;
};

export default function FavoriteButton({
  locationId,
  size = "sm",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(locationId);

  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const padding = size === "md" ? "p-2" : "p-1.5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(locationId);
      }}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className={`${padding} rounded-lg transition-colors hover:bg-slate-600/50 hover:cursor-pointer ${className}`}
    >
      <Star
        className={`${iconSize} transition-colors ${
          favorited
            ? "fill-yellow-400 text-yellow-400"
            : "text-slate-400 hover:text-slate-300"
        }`}
      />
    </button>
  );
}
