import Image from "next/image";
import { Button } from "@/components/ui/button";
export function MarketingFooter() {
    return (<div className="hidden h-20 w-full border-t-2 border-slate-200 p-2 lg:block">
      <div className="mx-auto flex h-full max-w-screen-lg items-center justify-evenly">
        {[
            ["/hr.svg", "Croatian"],
            ["/es.svg", "Spanish"],
            ["/fr.svg", "French"],
            ["/it.svg", "Italian"],
            ["/jp.svg", "Japanese"]
        ].map(([src, label]) => (<Button key={label} size="lg" variant="ghost" className="w-full cursor-default">
            <Image src={src} alt={label} height={32} width={40} className="mr-4 rounded-md"/>
            {label}
          </Button>))}
      </div>
    </div>);
}
