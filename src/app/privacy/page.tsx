import type { Metadata } from "next";
import { ShieldCheck, Lock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/snow-report/Footer";
import LegalSection, { type LegalBlock } from "@/components/legal/LegalSection";

// Static by design: see the note in the Terms page.
const EFFECTIVE_DATE = "August 25, 2026";

const SECTIONS: LegalBlock[] = [
  {
    heading: "Summary",
    paragraphs: [
      "SNOWD is operated by WaWe, LLC (\"WaWe,\" \"we,\" \"us,\" or \"our\"). This policy explains what happens to information when you use SNOWD (the \"Service\").",
      "The short version: SNOWD has no user accounts and no user database. Your favorites, unit preference, and saved location are stored in your own browser and are never transmitted to us. We do not sell or share personal information, and we do not serve ads.",
    ],
  },
  {
    heading: "Information Stored on Your Device",
    paragraphs: [
      "SNOWD saves your preferences using your browser's local storage and session storage. This data stays on your device. It is not transmitted to WaWe, is not accessible to us, and is not backed up or synced across your devices.",
    ],
    bullets: [
      "Favorite stations and locations you have saved.",
      "Your unit preference (inches or centimeters).",
      "A preferred or most recently approved map location, stored as coordinates.",
      "Whether you have dismissed the \"add to home screen\" prompt, and when it was last shown.",
    ],
  },
  {
    heading: "Location Information",
    paragraphs: [
      "SNOWD can use your device's location to center the map and find nearby stations. Your browser asks for permission before this happens, and you can decline or revoke that permission at any time in your browser or operating system settings. Declining does not prevent you from using the Service; you can select locations manually instead.",
      "When you grant permission, coordinates are used in your browser and saved to local storage on your device. They are not sent to WaWe's servers, are not logged by us, and are not shared with third parties.",
    ],
  },
  {
    heading: "How Data Requests Work",
    paragraphs: [
      "Weather, snowpack, and avalanche-region data is requested by SNOWD's own servers on your behalf and then delivered to your browser. Because those requests originate from our servers, the upstream providers do not receive your IP address or device information.",
      "Map imagery is the exception. Map tiles load directly from third-party tile providers to your browser, which means those providers receive your IP address and standard request information, and their handling of it is governed by their own privacy policies.",
    ],
    bullets: [
      "Requested through our servers: National Weather Service, Open-Meteo, USDA SNOTEL, avalanche.org.",
      "Loaded directly by your browser: OpenStreetMap, OpenTopoMap, and Esri/ArcGIS World Imagery tiles.",
    ],
  },
  {
    heading: "Analytics",
    paragraphs: [
      "SNOWD uses Vercel Web Analytics to understand aggregate traffic patterns, such as which pages are visited and roughly where visitors are located. It is configured to be privacy-oriented: it does not use cookies to track you and does not build a cross-site profile of you.",
      "Analytics data is aggregated and is not used to identify individual users. Vercel processes this data as our service provider under its own privacy terms.",
    ],
  },
  {
    heading: "Hosting and Server Logs",
    paragraphs: [
      "The Service is hosted on Vercel. Like essentially all web hosts, Vercel processes standard technical request information, which can include IP address, user agent, and requested URL, in order to deliver the site and protect it from abuse. We do not use these logs to build user profiles.",
    ],
  },
  {
    heading: "Feedback Forms and Outbound Links",
    paragraphs: [
      "If you choose to submit feedback, that form is hosted by Typeform and any information you enter, including anything you volunteer such as an email address, is processed by Typeform under its privacy policy. Submitting feedback is entirely optional.",
      "If you choose to make a voluntary contribution, that transaction is handled by Buy Me a Coffee under its own privacy policy and terms. WaWe does not receive or store your payment details.",
      "The Service links to third-party sites, including avalanche centers, weather sources, and ski areas. Once you follow a link, that site's privacy policy governs, not this one.",
    ],
  },
  {
    heading: "Information We Do Not Collect",
    bullets: [
      "We do not operate user accounts, logins, or passwords.",
      "We do not collect your name, email address, or phone number, unless you volunteer it in a feedback submission.",
      "We do not maintain a database of users or of user activity.",
      "We do not sell or rent personal information, and we do not share it for cross-context behavioral advertising.",
      "We do not serve advertising, and we do not embed third-party advertising or social media trackers.",
    ],
  },
  {
    heading: "Your Choices and Controls",
    paragraphs: [
      "Because your preferences live in your browser rather than on our servers, you control them directly.",
    ],
    bullets: [
      "Clear your saved favorites, units, and location by clearing site data for SNOWD in your browser settings, or by using the reset controls on the Settings page.",
      "Revoke location permission at any time in your browser or operating system settings.",
      "Use your browser's private browsing mode to avoid persisting preferences at all.",
      "Contact us at privacy@teamwawe.com with questions about this policy or about any information you submitted through the feedback form.",
    ],
  },
  {
    heading: "Children's Privacy",
    paragraphs: [
      "The Service is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has submitted personal information through the feedback form, contact privacy@teamwawe.com and we will work with the form provider to delete it.",
    ],
  },
  {
    heading: "Data Retention and Security",
    paragraphs: [
      "We do not maintain a user database, so there is no stored profile for us to retain or delete. Preferences persist on your device until you clear them. Feedback submissions are retained in Typeform, and contribution records are retained by the payment processor, in each case subject to those providers' policies.",
      "We take reasonable measures to protect the Service, but no method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    heading: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we do, we will revise the effective date shown at the top of this page. Your continued use of the Service after the effective date constitutes acceptance of the revised policy.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions or privacy requests may be sent to privacy@teamwawe.com. Please include enough detail for us to understand and respond to your request.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Privacy Policy | SNOWD",
  description:
    "SNOWD's privacy policy: no accounts, no user database, no ads. Preferences and location stay in your browser.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 pt-4 pb-20">
        <PageHeader
          icon={ShieldCheck}
          title="Privacy Policy"
          description={`Effective ${EFFECTIVE_DATE}. SNOWD is operated by WaWe, LLC.`}
        />

        <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/40 p-4">
          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" />
            <p className="text-sm leading-6 text-slate-200">
              No accounts, no user database, no ads. Your favorites, units, and
              saved location live in your browser and never reach our servers.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {SECTIONS.map((block, i) => (
            <LegalSection key={block.heading} index={i + 1} block={block} />
          ))}
        </div>

        <Footer />
      </div>
    </div>
  );
}
