import { useState } from "react"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type Props = {
  links: { label: string; href: string }[]
}

export default function MobileMenu({ links }: Props) {
  const [open, setOpen] = useState(false)

  // Fecha o menu antes de rolar, para o Lenis não brigar com o scroll lock do Sheet
  function go(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault()
    setOpen(false)
    setTimeout(() => window.dispatchEvent(new CustomEvent("portfolio:scrollto", { detail: href })), 250)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Abrir menu"
        className="grid size-12 place-items-center rounded-full bg-roxo text-giz transition-transform active:scale-95 md:hidden"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-l-0 bg-roxo p-0 text-giz sm:max-w-sm">
        <SheetHeader className="px-6 pt-8">
          <SheetTitle className="font-marker text-3xl text-lime">hanrry.</SheetTitle>
          <SheetDescription className="font-hand text-2xl text-giz/80">pra onde vamos?</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-6 pt-6">
          {links.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => go(e, link.href)}
              className="flex items-baseline gap-4 border-b border-giz/15 py-4 font-marker text-4xl"
            >
              <span className="font-sans text-sm font-semibold text-lime">0{i + 1}</span>
              {link.label}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
