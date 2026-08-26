import type { Metadata } from "next";
import { AlertTriangle, FileText } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/snow-report/Footer";
import LegalSection, { type LegalBlock } from "@/components/legal/LegalSection";

// Static by design: an effective date records when these terms took effect and
// must not move on its own. Only edit it when the terms actually change.
const EFFECTIVE_DATE = "August 25, 2026";

const SECTIONS: LegalBlock[] = [
  {
    heading: "Acceptance of These Terms",
    paragraphs: [
      "SNOWD is operated by WaWe, LLC (\"WaWe,\" \"we,\" \"us,\" or \"our\"). By accessing or using SNOWD, including the website, the installable web app, and any related pages or feeds (together, the \"Service\"), you agree to these Terms of Use. If you do not agree, do not use the Service.",
      "If you use the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
      "You must be at least 13 years old to use the Service. If you are under 18, you may use the Service only with the involvement of a parent or guardian who agrees to these Terms.",
    ],
  },
  {
    heading: "What SNOWD Is, and What It Is Not",
    paragraphs: [
      "SNOWD aggregates publicly available weather, snowpack, and avalanche-region data and presents it in one place. SNOWD is an informational and recreational convenience tool only.",
    ],
    bullets: [
      "SNOWD does not produce weather forecasts. Forecast data originates with the National Weather Service, Open-Meteo, and similar providers.",
      "SNOWD does not produce avalanche forecasts, danger ratings, or terrain assessments. Avalanche information is sourced from avalanche.org and regional avalanche centers, and is presented as regional context only.",
      "SNOWD does not conduct snowpack observations, field tests, or route evaluation, and does not verify conditions at any location.",
      "SNOWD is not a guide service, an avalanche forecasting center, an emergency service, a rescue service, or a substitute for professional avalanche education, training, or judgment.",
      "SNOWD is not affiliated with, endorsed by, or sponsored by the National Weather Service, NOAA, the USDA Natural Resources Conservation Service, avalanche.org, any regional avalanche center, any ski area, or any government agency.",
    ],
  },
  {
    heading: "Safety Disclaimer and Assumption of Risk",
    paragraphs: [
      "This section is the most important part of these Terms. Read it carefully.",
      "Backcountry travel, skiing, snowboarding, splitboarding, snowmobiling, mountaineering, and related winter activities are inherently dangerous. Avalanches, tree wells, falls, hypothermia, terrain hazards, equipment failure, and other conditions can cause serious injury or death. These risks cannot be eliminated by any information source, including SNOWD.",
      "Data shown in SNOWD may be delayed, incomplete, interrupted, inaccurate, stale, mislabeled, misaligned with your actual location, or simply wrong. Automated sensors fail. Upstream feeds go down or publish bad values. Forecasts are estimates and are frequently incorrect, particularly beyond about three days and particularly as to snowfall timing and amount. Conditions in the field change faster than any data feed reflects.",
      "You must not rely on SNOWD to make decisions about entering, crossing, or traveling near avalanche terrain, or about any other activity where an error could cause harm. Before any such decision, read the current official forecast from the avalanche center responsible for your zone, evaluate the terrain and conditions yourself, and carry and know how to use appropriate safety equipment.",
      "You assume all risk arising from your use of the Service and from any activity you undertake after consulting it. You are solely responsible for your own safety and for the safety of anyone in your party, and for your decisions about where and whether to travel.",
    ],
  },
  {
    heading: "No Warranties",
    paragraphs: [
      "THE SERVICE AND ALL DATA IN IT ARE PROVIDED \"AS IS\" AND \"AS AVAILABLE,\" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WAWE DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.",
      "WITHOUT LIMITING THE FOREGOING, WAWE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, OR THAT ANY DATA PRESENTED IS ACCURATE, CURRENT, COMPLETE, OR RELIABLE. NO ADVICE OR INFORMATION OBTAINED THROUGH THE SERVICE CREATES ANY WARRANTY NOT EXPRESSLY STATED HERE.",
      "Some jurisdictions do not allow the exclusion of certain warranties, so some of the above exclusions may not apply to you.",
    ],
  },
  {
    heading: "Limitation of Liability",
    paragraphs: [
      "TO THE FULLEST EXTENT PERMITTED BY LAW, WAWE, LLC AND ITS MEMBERS, MANAGERS, OFFICERS, EMPLOYEES, CONTRACTORS, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, GOODWILL, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATING TO THE SERVICE, WHETHER BASED IN CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER THEORY, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.",
      "TO THE FULLEST EXTENT PERMITTED BY LAW, WAWE WILL NOT BE LIABLE FOR ANY PERSONAL INJURY, DEATH, PROPERTY DAMAGE, SEARCH AND RESCUE COST, OR OTHER LOSS ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE, YOUR RELIANCE ON ANY DATA IN IT, OR ANY ACTIVITY YOU UNDERTAKE AFTER CONSULTING IT.",
      "TO THE FULLEST EXTENT PERMITTED BY LAW, WAWE'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE TOTAL AMOUNT YOU PAID WAWE FOR THE SERVICE IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS ($100). THE SERVICE IS PROVIDED FREE OF CHARGE, AND THIS ALLOCATION OF RISK IS AN ESSENTIAL BASIS OF THESE TERMS.",
      "Some jurisdictions do not allow the exclusion or limitation of liability for personal injury or for incidental or consequential damages, so some of the above may not apply to you. Nothing in these Terms limits liability that cannot be limited under applicable law.",
    ],
  },
  {
    heading: "Indemnification",
    paragraphs: [
      "You agree to indemnify, defend, and hold harmless WaWe, LLC and its members, managers, officers, employees, contractors, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or relating to your use of the Service, your violation of these Terms, or your violation of any law or the rights of any third party.",
    ],
  },
  {
    heading: "Third-Party Data, Services, and Links",
    paragraphs: [
      "The Service displays data from and links to third parties. WaWe does not control those sources, does not guarantee their accuracy or availability, and is not responsible for their content, practices, or terms.",
      "Your use of a third-party site or service is governed by that party's terms and privacy policy, not these Terms. Source attribution and methodology are described on the Data & Attribution page.",
    ],
    bullets: [
      "Weather and forecast data: National Weather Service (weather.gov) and Open-Meteo.",
      "Snowpack and station data: USDA Natural Resources Conservation Service SNOTEL network.",
      "Avalanche region data: avalanche.org and regional avalanche centers.",
      "Map imagery: OpenStreetMap, OpenTopoMap, and Esri/ArcGIS World Imagery.",
      "Feedback form: Typeform. Voluntary support: Buy Me a Coffee.",
    ],
  },
  {
    heading: "Acceptable Use",
    paragraphs: [
      "You may use the Service for personal, non-commercial purposes. You agree not to:",
    ],
    bullets: [
      "Scrape, crawl, or bulk-download the Service, or access it through automated means, except for well-behaved search engine indexing.",
      "Interfere with or place undue load on the Service, its underlying infrastructure, or its upstream data providers.",
      "Attempt to gain unauthorized access to any part of the Service or any related system.",
      "Reverse engineer, decompile, or attempt to derive the source of any part of the Service, except where that restriction is unenforceable under applicable law.",
      "Remove, obscure, or alter any attribution, notice, or disclaimer displayed in the Service.",
      "Redistribute or resell data from the Service in a way that misrepresents its source or accuracy, or that suggests WaWe endorses your use.",
      "Use the Service in any way that violates applicable law or the terms of any upstream data provider.",
    ],
  },
  {
    heading: "Intellectual Property",
    paragraphs: [
      "The Service, including its design, interface, original text, and software, is owned by WaWe, LLC and protected by copyright and other laws. These Terms grant you a limited, revocable, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes. All rights not expressly granted are reserved.",
      "Underlying data from government and third-party sources remains subject to the rights and terms of those sources. Much of the weather and snowpack data presented in the Service is U.S. government work in the public domain; map imagery and other third-party layers carry their own licenses and attribution requirements, described on the Data & Attribution page.",
    ],
  },
  {
    heading: "Voluntary Support",
    paragraphs: [
      "The Service is free. If you choose to support it through a voluntary contribution, that contribution is a gratuity, not a purchase. It buys no product, no service level, no guarantee of continued availability, and no support obligation, and it is not refundable except as required by the payment processor or applicable law. Contributions are processed by a third party under that party's terms.",
    ],
  },
  {
    heading: "Availability and Changes to the Service",
    paragraphs: [
      "WaWe may modify, suspend, limit, or discontinue the Service or any feature at any time, with or without notice, and is not liable to you for doing so. Upstream data providers may also change or discontinue their feeds, which may degrade or remove features of the Service without warning.",
      "Do not depend on the Service being available at any particular time, including in the field or in areas with limited connectivity.",
    ],
  },
  {
    heading: "Changes to These Terms",
    paragraphs: [
      "WaWe may update these Terms from time to time. When we do, we will revise the effective date shown at the top of this page. Material changes will be reflected here, and your continued use of the Service after the effective date constitutes acceptance of the revised Terms. Review this page periodically.",
    ],
  },
  {
    heading: "Governing Law and Venue",
    paragraphs: [
      "These Terms are governed by the laws of the State of Minnesota, without regard to its conflict-of-laws principles. You agree that any dispute arising out of or relating to these Terms or the Service will be brought exclusively in the state or federal courts located in Minnesota, and you consent to the personal jurisdiction of those courts.",
      "These Terms do not require arbitration. Nothing here waives any right you may have to bring a claim in small claims court where jurisdiction and venue permit.",
    ],
  },
  {
    heading: "General",
    paragraphs: [
      "If any provision of these Terms is held unenforceable, that provision will be limited or severed to the minimum extent necessary, and the remaining provisions will remain in full force. WaWe's failure to enforce any provision is not a waiver of it.",
      "These Terms, together with the Privacy Policy, are the entire agreement between you and WaWe regarding the Service and supersede any prior understandings. You may not assign these Terms; WaWe may assign them in connection with a merger, acquisition, or sale of assets.",
      "The disclaimers, limitations of liability, indemnification, and governing law provisions survive any termination of these Terms or your use of the Service.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "Questions or legal notices regarding these Terms may be sent to privacy@teamwawe.com.",
    ],
  },
];

export const metadata: Metadata = {
  title: "Terms of Use | SNOWD",
  description:
    "Terms of Use for SNOWD, including safety disclaimers, assumption of risk, and limitation of liability for snow, weather, and avalanche-region data.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-3xl px-4 pt-4 pb-20">
        <PageHeader
          icon={FileText}
          title="Terms of Use"
          description={`Effective ${EFFECTIVE_DATE}. SNOWD is operated by WaWe, LLC.`}
        />

        <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-6 text-amber-50/95">
              SNOWD aggregates public data and is not a forecasting service. It
              is not a substitute for the official avalanche forecast for your
              zone, for proper training, or for your own judgment in the field.
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
