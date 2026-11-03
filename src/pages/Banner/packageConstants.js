export const PACKAGE_OPTIONS = [
  "Educational Institutions",
  "Corporate Training",
  "Employee Wellbeing",
  "Old-Age Mental Care",
];

export const isPackageBanner = (banner) => {
  if (!banner) return false;
  const title = (banner.title || banner.name || "").trim();
  return PACKAGE_OPTIONS.some(
    (opt) => opt.toLowerCase() === title.toLowerCase()
  );
};
