"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/layout/icons";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  name?: string;
};

export function Dropdown({ id, value, onChange, options, placeholder = "Select", searchable, required, name }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const filtered = searchable
    ? options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const close = (refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) trigger.current?.focus();
  };

  const openMenu = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };

  const pick = (o: string) => {
    onChange(o);
    close();
  };

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openMenu();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (filtered.length ? (a + step + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    }
  };

  return (
    <div className={open ? "dd is-open" : "dd"} ref={root} onKeyDown={onKey}>
      {required && (
        <input className="dd-proxy" tabIndex={-1} aria-hidden="true" required value={value} onChange={() => {}} name={name} />
      )}
      <button
        ref={trigger}
        id={id}
        type="button"
        className="dd-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openMenu())}
      >
        <span className={value ? "dd-value" : "dd-value is-placeholder"}>{value || placeholder}</span>
        <Icon name={open ? "up" : "down"} size={16} />
      </button>

      {open && (
        <div className="dd-menu">
          {searchable && (
            <label className="dd-search">
              <Icon name="search" size={16} />
              <input
                ref={searchRef}
                value={query}
                placeholder="Search"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
              />
            </label>
          )}
          <ul className="dd-list" role="listbox" id={listId}>
            {filtered.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={o === value}
                className={`dd-option${o === value ? " is-selected" : ""}${i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(o)}
              >
                <span>{o}</span>
                {o === value && <Icon name="check" size={16} />}
              </li>
            ))}
            {filtered.length === 0 && <li className="dd-empty">No results</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
