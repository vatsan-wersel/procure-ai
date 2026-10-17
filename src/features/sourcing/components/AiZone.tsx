"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";
import { priorities } from "../data";

export function AiZone() {
  const [selected, setSelected] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const active = priorities[selected];

  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ top: 0, height: 0, show: false });

  // Custom left scrollbar: mirror the list's scroll position onto the thumb.
  const sync = useCallback(() => {
    const list = listRef.current;
    const track = trackRef.current;
    if (!list || !track) return;
    const { scrollTop, scrollHeight, clientHeight } = list;
    const trackH = track.clientHeight;
    const show = scrollHeight > clientHeight + 1;
    const height = show ? Math.max(32, (clientHeight / scrollHeight) * trackH) : trackH;
    const max = scrollHeight - clientHeight;
    const top = show && max > 0 ? (scrollTop / max) * (trackH - height) : 0;
    setThumb({ top, height, show });
  }, []);

  useEffect(() => {
    sync();
    const ro = new ResizeObserver(sync);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [sync]);

  const onThumbDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    const list = listRef.current;
    const track = trackRef.current;
    if (!list || !track) return;
    e.preventDefault();
    const startY = e.clientY;
    const startScroll = list.scrollTop;
    const ratio = (list.scrollHeight - list.clientHeight) / Math.max(1, track.clientHeight - thumb.height);
    const move = (ev: PointerEvent) => {
      list.scrollTop = startScroll + (ev.clientY - startY) * ratio;
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list || e.target !== e.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientY - rect.top) / rect.height;
    list.scrollTo({ top: pct * (list.scrollHeight - list.clientHeight), behavior: "smooth" });
  };

  return (
    <section className={collapsed ? "ai-zone is-collapsed" : "ai-zone"}>
      <div className="ai-left">
        <header className="ai-head">
          <span className="ai-badge" aria-hidden="true" />
          <div>
            <p className="ai-eyebrow">AI Zone</p>
            <h2 className="ai-title">
              Today&apos;s Priority
              <button
                type="button"
                className="ai-collapse"
                onClick={() => setCollapsed((c) => !c)}
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Expand AI Zone" : "Collapse AI Zone"}
              >
                <Icon name={collapsed ? "down" : "up"} size={16} />
              </button>
            </h2>
          </div>
        </header>

        <div className="ai-scroll" hidden={collapsed}>
          <div
            ref={trackRef}
            className={thumb.show ? "ai-track" : "ai-track is-hidden"}
            onClick={onTrackClick}
            aria-hidden="true"
          >
            <span
              className="ai-thumb"
              style={{ height: thumb.height, transform: `translateY(${thumb.top}px)` }}
              onPointerDown={onThumbDown}
            />
          </div>

          <ol ref={listRef} className="ai-list" onScroll={sync}>
            {priorities.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={i === selected ? "ai-item is-selected" : "ai-item"}
                  onClick={() => setSelected(i)}
                >
                  <span className="ai-item-title">{p.title}</span>
                  <span className={`ai-level level-${p.level.toLowerCase()}`}>{p.level}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {!collapsed && (
        <article className="ai-detail" key={active.id}>
          <span className={`ai-level level-${active.level.toLowerCase()}`}>{active.level}</span>
          <h3 className="ai-detail-title">{active.title}</h3>
          <p className="ai-detail-text">{active.reason}</p>
          <button type="button" className="ai-cta">
            {active.action}
            <Icon name="arrow" size={18} />
          </button>
        </article>
      )}
    </section>
  );
}
