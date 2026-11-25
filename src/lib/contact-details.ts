import type { Site } from "./content";

export function businessDetails(site: Site) {
  const current = site.sections.find((s) => s.type === "contact")?.content
    .details;
  const legacy = site.sections.find((s) => s.type === "footer")?.content
    .details;
  const usesSharedFields =
    current?.hours !== undefined || current?.directions !== undefined;
  return {
    email:
      current?.email ||
      (usesSharedFields ? "" : legacy?.email || site.settings.details.email),
    phone:
      current?.phone ||
      (usesSharedFields ? "" : legacy?.phone || site.settings.details.phone),
    address:
      current?.address ||
      (usesSharedFields
        ? ""
        : legacy?.address || site.settings.details.address),
    hours: current?.hours || "",
    directions: current?.directions || "",
  };
}
export function sharedContactDetails(
  site: Site,
  officePath = "/contact#office-location",
) {
  const contact = site.sections.find(
    (section) => section.type === "contact",
  )?.content;
  const { email, phone, address, hours, directions } = businessDetails(site);
  const dial = phone.replace(/[^+\d]/g, "");
  return [
    {
      icon: "Phone",
      label: contact?.phoneLabel || "Call us",
      value: phone || "Phone number to be confirmed",
      url: dial ? "tel:" + dial : "/contact",
    },
    {
      icon: "Mail",
      label: contact?.emailLabel || "Email us",
      value: email || "Email available on enquiry",
      url: email ? "mailto:" + email : "/contact",
    },
    {
      icon: "MapPin",
      label: contact?.addressLabel || "Visit our office",
      value: address || "Office address to be confirmed",
      url:
        directions ||
        (address
          ? "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(address)
          : officePath),
    },
    {
      icon: "Clock",
      label: contact?.hoursLabel || "Office hours",
      value: hours || "Opening hours to be confirmed",
      url: officePath,
    },
  ];
}
