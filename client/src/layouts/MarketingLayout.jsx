import { MarketingHeader } from "@/pages/marketing/MarketingHeader";
import { MarketingFooter } from "@/pages/marketing/MarketingFooter";
export function MarketingLayout({ children }) {
    return (<div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex flex-1 flex-col items-center justify-center">
        {children}
      </main>
      <MarketingFooter />
    </div>);
}
