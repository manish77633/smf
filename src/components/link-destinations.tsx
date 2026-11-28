export type LinkDestination = { title: string; slug: string };

export default function LinkDestinations({ pages }: { pages: LinkDestination[] }) {
  return (
    <datalist id="site-link-destinations">
      <option value="/">Homepage</option>
      <option value="/emi-calculator">EMI calculator</option>
      <option value="/#loans">Homepage loan cards</option>
      <option value="/#about">Homepage about section</option>
      <option value="/#faqs">Homepage FAQs</option>
      <option value="/#contact">Homepage enquiry form</option>
      {pages.map(({ title, slug }) => (
        <option key={slug} value={`/${slug}`}>{title}</option>
      ))}
    </datalist>
  );
}
