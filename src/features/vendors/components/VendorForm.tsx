"use client";

import Link from "next/link";
import { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { vendorCategories } from "../data";

const businessTypes = [
  "Sdn. Bhd. (Private limited)",
  "Bhd. (Public limited)",
  "LLP (Limited liability partnership)",
  "Partnership",
  "Sole proprietorship",
];
const states = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "W.P. Kuala Lumpur",
  "W.P. Labuan",
  "W.P. Putrajaya",
];
const yesNo = ["Yes", "No"];

type Fields = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  businessType: string;
  ssmNo: string;
  tin: string;
  sstRegistered: string;
  sstNo: string;
  brn: string;
  address: string;
  postcode: string;
  city: string;
  state: string;
  message: string;
};

const empty: Fields = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  category: "",
  businessType: "",
  ssmNo: "",
  tin: "",
  sstRegistered: "No",
  sstNo: "",
  brn: "",
  address: "",
  postcode: "",
  city: "",
  state: "",
  message: "",
};

export function VendorForm() {
  const [f, setF] = useState<Fields>(empty);
  const [invited, setInvited] = useState<Fields | null>(null);
  const set = (key: keyof Fields) => (value: string) => setF((p) => ({ ...p, [key]: value }));
  const text = (key: keyof Fields) => ({
    value: f[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key)(e.target.value),
  });

  if (invited) {
    return (
      <div className="form-card">
        <div className="frow">
          <span className="frow-label">Invitation sent</span>
          <div className="frow-field">
            <p>
              <strong>{invited.name}</strong> has been added as <strong>Invited</strong> in <strong>{invited.category}</strong>. An onboarding link was sent to{" "}
              <strong>{invited.email}</strong>.
            </p>
            <p className="fhint">The vendor completes their profile and uploads documents through the vendor portal.</p>
          </div>
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              setF(empty);
              setInvited(null);
            }}
          >
            Add another vendor
          </button>
          <Link href="/admin/vendors" className="btn-solid">
            Back to vendors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      className="form-card"
      onSubmit={(e) => {
        e.preventDefault();
        // Prototype: no backend yet — persist the vendor and email the invite here.
        setInvited(f);
      }}
    >
      <section className="fsection">
        <h2 className="fsection-title">Company &amp; contact</h2>
        <div className="fgrid">
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-name">Company name</label>
            <input id="v-name" className="finput" required placeholder="As registered with SSM" {...text("name")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-contact">Contact person</label>
            <input id="v-contact" className="finput" required placeholder="Full name" {...text("contactName")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-email">Email (invitation is sent here)</label>
            <input id="v-email" type="email" className="finput" required placeholder="name@company.com.my" {...text("email")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-phone">Phone</label>
            <div className="fprefix">
              <span>+60</span>
              <input id="v-phone" className="finput" type="tel" inputMode="tel" pattern="[0-9 \-]{8,12}" placeholder="12-345 6789" {...text("phone")} />
            </div>
          </div>
        </div>
      </section>

      <section className="fsection">
        <h2 className="fsection-title">Registration</h2>
        <div className="fgrid">
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-category">Vendor category</label>
            <Dropdown id="v-category" required value={f.category} onChange={set("category")} options={vendorCategories} placeholder="Select a category" />
            <small className="fhint">Decides which onboarding steps and documents the vendor sees.</small>
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-type">Business type</label>
            <Dropdown id="v-type" required value={f.businessType} onChange={set("businessType")} options={businessTypes} placeholder="Select business type" />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-ssm">SSM registration no.</label>
            <input
              id="v-ssm"
              className="finput"
              required
              pattern="([0-9]{12}|[0-9]{6,7}-?[A-Za-z])"
              title="12-digit new SSM number (e.g. 201901012345) or old format (e.g. 123456-X)"
              placeholder="201901012345 or 123456-X"
              {...text("ssmNo")}
            />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-brn">BRN (Business Registration No.)</label>
            <input id="v-brn" className="finput" required placeholder="Business registration number" {...text("brn")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-tin">Tax identification no. (TIN)</label>
            <input id="v-tin" className="finput" placeholder="e.g. C1234567890" {...text("tin")} />
          </div>
          <div className="fcell">
            <span className="fcell-label">SST registered</span>
            <div className="radio-pills" role="radiogroup" aria-label="SST registered">
              {yesNo.map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={f.sstRegistered === o}
                  className={f.sstRegistered === o ? "radio-pill is-on" : "radio-pill"}
                  onClick={() => set("sstRegistered")(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          {f.sstRegistered === "Yes" && (
            <div className="fcell">
              <label className="fcell-label" htmlFor="v-sst">SST registration no.</label>
              <input id="v-sst" className="finput" required placeholder="e.g. W10-1808-32000001" {...text("sstNo")} />
            </div>
          )}
        </div>
      </section>

      <section className="fsection">
        <h2 className="fsection-title">Business address</h2>
        <div className="fgrid">
          <div className="fcell fcell-wide">
            <label className="fcell-label" htmlFor="v-address">Street address</label>
            <textarea id="v-address" className="ftext" rows={2} required placeholder="Street address" {...text("address")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-postcode">Postcode</label>
            <input id="v-postcode" className="finput" required inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="50450" {...text("postcode")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-city">City</label>
            <input id="v-city" className="finput" required placeholder="Kuala Lumpur" {...text("city")} />
          </div>
          <div className="fcell">
            <label className="fcell-label" htmlFor="v-state">State</label>
            <Dropdown id="v-state" required searchable value={f.state} onChange={set("state")} options={states} placeholder="Select a state" />
          </div>
        </div>
      </section>

      <section className="fsection">
        <label className="fsection-title" htmlFor="v-message" style={{ display: "block" }}>Invitation message</label>
        <textarea id="v-message" className="ftext" rows={3} placeholder="Optional note included in the invitation email" {...text("message")} />
      </section>

      <div className="form-actions">
        <Link href="/admin/vendors" className="btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn-solid">
          Add &amp; send invite
        </button>
      </div>
    </form>
  );
}
