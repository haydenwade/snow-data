"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
type Link = { label: string; url: string };
export default function LocationLinksDialog({ open, onOpenChange, links }: { open: boolean; onOpenChange: (v: boolean) => void; links: Link[] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[320px] max-w-md bg-slate-800/90 border border-slate-700/50 rounded-2xl shadow-xl p-6 text-slate-200">
        <DialogHeader>
          <DialogTitle className="font-bold text-lg text-white mb-2">Related Links</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 mt-2">
          {links.length ? (
            links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline text-base font-medium"
                >
                  {l.label}
                </a>
              </li>
            ))
          ) : (
            <li className="text-slate-400 text-base">No links available.</li>
          )}
        </ul>
        <DialogClose asChild>
          <button className="mt-6 w-full px-4 py-2 rounded-xl bg-slate-700 text-slate-200 font-semibold hover:bg-slate-600 transition-colors">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
