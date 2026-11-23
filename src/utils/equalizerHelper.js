export const inferContentType = (name = "") => {
  const n = String(name || "").toLowerCase();
  if (n.includes("watch") || n.includes("video") || n.includes("unwind") || n.includes("movie") || n.includes("clip")) {
    return "video";
  }
  if (n.includes("sound") || n.includes("audio") || n.includes("soothe") || n.includes("music") || n.includes("tune")) {
    return "audio";
  }
  if (n.includes("mindful") || n.includes("story") || n.includes("stories") || n.includes("feeling") || n.includes("text")) {
    return "story";
  }
  if (n.includes("create") || n.includes("express") || n.includes("draw") || n.includes("paint") || n.includes("art")) {
    return "drawing";
  }
  if (n.includes("play") || n.includes("connect") || n.includes("game")) {
    return "game";
  }
  return "video";
};

export const EQUALIZER_TYPE_CONFIG = {
  video: {
    key: "video",
    label: "Video Player",
    bg: "bg-blue-50 text-blue-700 border-blue-200",
    color: "#2563EB",
  },
  audio: {
    key: "audio",
    label: "Audio Player",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    color: "#D97706",
  },
  story: {
    key: "story",
    label: "Story / Text",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    color: "#059669",
  },
  drawing: {
    key: "drawing",
    label: "Drawing / Art",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
    color: "#7C3AED",
  },
  game: {
    key: "game",
    label: "Relaxing Game",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    color: "#E11D48",
  },
};

