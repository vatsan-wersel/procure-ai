"use client";

import { useEffect, useState } from "react";
import { activeFlow, loadStore } from "../flowStore";
import { defaultFlow, type FlowStep } from "../stepTypes";
import { KycWizard } from "./KycWizard";

/** The wizard with the saved flow for this vendor's category. Prototype: reads this browser's saved flows. */
export function VendorKycWizard({ category }: { category: string }) {
  const [flow, setFlow] = useState<FlowStep[]>(defaultFlow);
  useEffect(() => setFlow(activeFlow(loadStore(), category)), [category]);
  return <KycWizard flow={flow} category={category} />;
}
