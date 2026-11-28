import "server-only";
import { AuditLog, ContentModels, Page } from "./db";

type PageIndexRow = {
  key: string;
  createdAt?: Date;
  title?: string;
  count: number;
  live: boolean;
  changed: boolean;
};

export async function adminPages() {
  const [rows, loans] = await Promise.all([
    Page.aggregate<PageIndexRow>([
      { $match: { $or: [{ key: "home" }, { key: /^page:/ }] } },
      {
        $project: {
          _id: 0,
          key: 1,
          createdAt: 1,
          title: "$draft.title",
          count: { $size: { $ifNull: ["$draft.sections", []] } },
          live: {
            $cond: [
              { $eq: ["$key", "home"] },
              { $eq: ["$published.page.status", "published"] },
              { $ne: [{ $ifNull: ["$published", null] }, null] },
            ],
          },
          changed: { $ne: ["$draft", "$published"] },
        },
      },
    ]),
    ContentModels.loans.find()
      .select("value.slug -_id")
      .lean<{ value: { slug: string } }[]>(),
  ]);
  const loanSlugs = new Set(loans.map(({ value }) => value.slug));
  const dates = await AuditLog.aggregate<{
    _id: string;
    publishedAt: Date | null;
    draftAt: Date | null;
  }>([
    {
      $match: {
        target: { $in: rows.map(({ key }) => key) },
        action: { $in: ["publish-page", "publish-home", "save-home-draft"] },
      },
    },
    {
      $group: {
        _id: "$target",
        publishedAt: {
          $max: {
            $cond: [
              { $in: ["$action", ["publish-page", "publish-home"]] },
              "$createdAt",
              null,
            ],
          },
        },
        draftAt: {
          $max: {
            $cond: [{ $eq: ["$action", "save-home-draft"] }, "$createdAt", null],
          },
        },
      },
    },
  ]);
  const datesByPage = new Map(dates.map((row) => [row._id, row]));

  return rows.map((row) => {
    const home = row.key === "home";
    const slug = home ? "" : row.key.slice(5);
    const history = datesByPage.get(row.key);
    const lastPublished = history?.publishedAt;
    const lastDraft = history?.draftAt;
    return {
      title: home ? "Homepage" : row.title || slug,
      path: "/" + slug,
      edit: home ? "/admin/cms" : "/admin/pages/" + slug,
      loan: loanSlugs.has(slug),
      published: row.live,
      draftChanges: row.live && (home
        ? Boolean(lastDraft && (!lastPublished || lastDraft > lastPublished))
        : row.changed),
      count: row.count,
      publishedAt: lastPublished && (!row.createdAt || lastPublished >= row.createdAt)
        ? lastPublished
        : null,
    };
  }).sort((a, b) => a.path === "/" ? -1 : b.path === "/" ? 1 : a.title.localeCompare(b.title));
}
