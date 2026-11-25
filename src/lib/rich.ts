import sanitize from "sanitize-html";
export function cleanRich(value: string) {
  return sanitize(value, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "ul",
      "ol",
      "li",
      "h3",
      "h4",
      "blockquote",
      "a",
    ],
    allowedAttributes: { a: ["href"] },
    allowedSchemes: ["https", "mailto", "tel"],
    allowProtocolRelative: false,
  });
}
