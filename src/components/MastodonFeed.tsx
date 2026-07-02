import parse, {
  attributesToProps,
  type DOMNode,
  domToReact,
  Element,
  type HTMLReactParserOptions,
} from "html-react-parser";
import { useEffect, useMemo, useState } from "react";
import "./MastodonFeed.css";

interface Account {
  id: string;
}

interface MediaAttachment {
  type: "image" | "gifv" | "video" | string;
  url?: string;
  remote_url?: string;
  preview_url?: string;
  description?: string;
}

interface PreviewCard {
  url?: string;
  image?: string;
  title?: string;
  description?: string;
  provider_name?: string;
}

interface Status {
  id: string;
  url?: string;
  created_at: string;
  content: string;
  account: {
    acct: string;
  };
  reblog?: Status | null;
  media_attachments?: MediaAttachment[];
  card?: PreviewCard | null;
  favourites_count?: number;
  reblogs_count?: number;
}

interface Props {
  instance: string;
  handle: string;
}

function FeedFooter({ href }: { href: string }) {
  return (
    <div className="masto-footer">
      <a href={href} target="_blank" rel="me noopener">
        前往 Mastdoon 查看更多
      </a>
    </div>
  );
}

function SkeletonToot() {
  return (
    <article className="masto-toot masto-toot--skeleton" aria-hidden="true">
      <span className="masto-skel masto-skel-time" />
      <span className="masto-skel masto-skel-line masto-skel-line-short" />
      <span className="masto-skel masto-skel-line" />
      <span className="masto-skel masto-skel-line masto-skel-line-mid" />
      <span className="masto-skel masto-skel-media" />
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="masto-feed" aria-busy="true" aria-live="polite">
      <SkeletonToot />
      <SkeletonToot />
      <SkeletonToot />
    </div>
  );
}

const statusContentOptions: HTMLReactParserOptions = {
  replace(domNode) {
    if (!(domNode instanceof Element) || domNode.name !== "a") return undefined;

    return (
      <a {...attributesToProps(domNode.attribs)} target="_blank" rel="noopener">
        {domToReact(domNode.children as DOMNode[], statusContentOptions)}
      </a>
    );
  },
};

function StatusContent({ html }: { html: string }) {
  return (
    <div className="masto-content post-content">
      {parse(html, statusContentOptions)}
    </div>
  );
}

function MediaGallery({ attachments }: { attachments: MediaAttachment[] }) {
  const visual = attachments
    .filter(
      (a) => a.type === "image" || a.type === "gifv" || a.type === "video",
    )
    .slice(0, 4);

  if (!visual.length) return null;

  const classes = ["masto-media", `masto-media--n${visual.length}`];
  if (visual.length > 1) classes.push("masto-media--grid");

  return (
    <div className={classes.join(" ")}>
      {visual.map((attachment) => {
        const key =
          attachment.url ||
          attachment.remote_url ||
          attachment.preview_url ||
          attachment.description;

        if (attachment.type === "video" || attachment.type === "gifv") {
          return (
            // biome-ignore lint/a11y/useMediaCaption: Mastodon API media attachments do not expose caption tracks.
            <video
              key={key}
              src={attachment.url}
              controls
              poster={attachment.preview_url}
            />
          );
        }

        return (
          <a
            key={key}
            href={attachment.url || attachment.remote_url}
            target="_blank"
            rel="noopener"
          >
            <img
              src={attachment.preview_url || attachment.url}
              alt={attachment.description || ""}
              loading="lazy"
            />
          </a>
        );
      })}
    </div>
  );
}

function Preview({ card }: { card?: PreviewCard | null }) {
  if (!card?.url) return null;

  let host = card.provider_name || "";
  try {
    host = new URL(card.url).hostname;
  } catch {
    // Keep provider_name fallback.
  }

  return (
    <a className="masto-card" href={card.url} target="_blank" rel="noopener">
      {card.image && (
        <img
          className="masto-card-img"
          src={card.image}
          alt=""
          loading="lazy"
        />
      )}
      <span className="masto-card-body">
        <strong className="masto-card-title">{card.title || card.url}</strong>
        {card.description && (
          <span className="masto-card-desc">{card.description}</span>
        )}
        <span className="masto-card-host">{host}</span>
      </span>
    </a>
  );
}

function Toot({
  status,
  dateFmt,
}: {
  status: Status;
  dateFmt: Intl.DateTimeFormat;
}) {
  const boosted = status.reblog;
  const toot = boosted || status;
  const media = toot.media_attachments || [];

  return (
    <article className="masto-toot">
      <a
        className="masto-time"
        href={toot.url || status.url}
        target="_blank"
        rel="noopener"
      >
        <time dateTime={toot.created_at}>
          {dateFmt.format(new Date(toot.created_at))}
        </time>
      </a>

      {boosted && (
        <span className="masto-boost">转发 @{toot.account.acct}</span>
      )}

      <StatusContent html={toot.content} />

      {media.length > 0 ? (
        <MediaGallery attachments={media} />
      ) : (
        <Preview card={toot.card} />
      )}

      {!!(toot.favourites_count || toot.reblogs_count) && (
        <div className="masto-stats">
          {!!toot.favourites_count && (
            <span className="masto-stat">★ {toot.favourites_count}</span>
          )}
          {!!toot.reblogs_count && (
            <span className="masto-stat">转发 {toot.reblogs_count}</span>
          )}
        </div>
      )}
    </article>
  );
}

export default function MastodonFeed({ instance, handle }: Props) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const profileUrl = `https://${instance}/@${handle}`;
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const base = `https://${instance}/api/v1`;

    async function load() {
      setLoading(true);
      setFailed(false);

      try {
        const account = await fetch(
          `${base}/accounts/lookup?acct=${encodeURIComponent(handle)}`,
        ).then((r) => {
          if (!r.ok) throw new Error(`lookup ${r.status}`);
          return r.json() as Promise<Account>;
        });

        const data = await fetch(
          `${base}/accounts/${account.id}/statuses?limit=20&exclude_replies=true`,
        ).then((r) => {
          if (!r.ok) throw new Error(`statuses ${r.status}`);
          return r.json() as Promise<Status[]>;
        });

        if (!cancelled) setStatuses(data);
      } catch (err) {
        if (!cancelled) setFailed(true);
        console.error("[mastodon]", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [handle, instance]);

  if (loading) {
    return (
      <div className="masto-shell">
        <FeedSkeleton />
        <FeedFooter href={profileUrl} />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="masto-shell">
        <p className="masto-status">嘟文加载失败。</p>
        <FeedFooter href={profileUrl} />
      </div>
    );
  }

  if (!statuses.length) {
    return (
      <div className="masto-shell">
        <p className="masto-status">还没有嘟文。</p>
        <FeedFooter href={profileUrl} />
      </div>
    );
  }

  return (
    <div className="masto-shell">
      <div className="masto-feed">
        {statuses.map((status) => (
          <Toot key={status.id} status={status} dateFmt={dateFmt} />
        ))}
      </div>
      <FeedFooter href={profileUrl} />
    </div>
  );
}
