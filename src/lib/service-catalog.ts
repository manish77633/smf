import { sortVisible, type Records } from "./content";
import type { PageBlock } from "./pages";

export function serviceCatalog(block: PageBlock, records: Records["loans"]) {
  const loans = sortVisible(records);
  if (!block.items.length) return loans;
  const bySlug = new Map(loans.map((loan) => [loan.slug, loan]));
  const selected = sortVisible(block.items).flatMap((item) => {
    const loan = bySlug.get(item.title);
    return loan ? [{ ...loan, description: item.description || loan.description }] : [];
  });
  if (block.listedLoansOnly) return selected;
  const configured = new Set(block.items.map((item) => item.title));
  return [...selected, ...loans.filter((loan) => !configured.has(loan.slug))];
}
