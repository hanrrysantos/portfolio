import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import Lenis from "lenis"

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin)

const $ = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T & Element>(selector)) as T[]

export function initMotion() {
  const lenis = setupLenis()
  setupNav(lenis)

  const mm = gsap.matchMedia()

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // SplitText precisa das fontes carregadas para medir os caracteres certo.
    // Tudo é preparado atrás do overlay: assim a hero entra enquanto ele encolhe, sem pulo nem travada
    const hero = document.fonts.ready.then(() => {
      const tl = heroIntro(willPlayIntro())
      revealTitles()
      ScrollTrigger.refresh()
      // Embrulhada: timeline do GSAP é "thenable" e a Promise esperaria ela terminar
      return { tl }
    })
    const reveal = () => hero.then(({ tl }) => tl?.play())
    playIntro(lenis, reveal).then(reveal)
    revealBlocks()
    marquees(lenis)
    drawOnScroll()
    caseMedia()
    timelinePostits()
    stackCards()
    floaters()
  })

  mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
    magnetic()
  })

  mm.add("(prefers-reduced-motion: reduce)", () => {
    lenis?.destroy()
    document.querySelector("[data-intro]")?.remove()
  })
}

function setupLenis() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null

  const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 } })
  lenis.on("scroll", ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  // Links do menu mobile (o Sheet trava o scroll enquanto está aberto)
  window.addEventListener("portfolio:scrollto", (event) => {
    const target = (event as CustomEvent<string>).detail
    lenis.scrollTo(target, { offset: -80 })
  })

  return lenis
}

function setupNav(lenis: Lenis | null) {
  const nav = document.querySelector<HTMLElement>("[data-nav]")
  if (!nav) return

  let last = 0
  const onScroll = (y: number) => {
    const goingDown = y > last && y > 120
    nav.style.transform = goingDown ? "translateY(-110%)" : ""
    nav.classList.toggle("backdrop-blur-md", y > 40)
    nav.classList.toggle("bg-ink/70", y > 40)
    last = y
  }

  if (lenis) lenis.on("scroll", ({ scroll }: { scroll: number }) => onScroll(scroll))
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true })

  if (!lenis) {
    window.addEventListener("portfolio:scrollto", (event) => {
      document.querySelector((event as CustomEvent<string>).detail)?.scrollIntoView()
    })
  }
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Conta de R$ 0,00 a R$ 100,00 seguindo o carregamento real de fontes e imagens,
 * carimba "BATEU" e encolhe o overlay roxo até a mancha roxa do hero.
 * Resolve `true` quando a intro rodou.
 */
const willPlayIntro = () =>
  !!document.querySelector("[data-intro]") && !document.documentElement.classList.contains("no-intro")

function playIntro(lenis: Lenis | null, reveal: () => void): Promise<boolean> {
  const intro = document.querySelector<HTMLElement>("[data-intro]")
  if (!intro) return Promise.resolve(false)
  if (!willPlayIntro()) {
    intro.remove()
    return Promise.resolve(false)
  }

  lenis?.stop()
  window.scrollTo(0, 0)
  // O JS assumiu: a rede de segurança do CSS só dispara se a animação travar de vez
  intro.style.animationDelay = "12s"

  const value = intro.querySelector<HTMLElement>("[data-intro-value]")!
  const pct = intro.querySelector<HTMLElement>("[data-intro-pct]")!
  const ring = intro.querySelector<SVGCircleElement>("[data-intro-ring]")!
  const ok = intro.querySelector<HTMLElement>("[data-intro-ok]")!
  const open = intro.querySelector<HTMLElement>("[data-intro-open]")!
  const steps = $("[data-intro-step]", intro)
  const stamp = intro.querySelector<HTMLElement>("[data-intro-stamp]")!
  const content = intro.querySelector<HTMLElement>("[data-intro-content]")!
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

  const state = { v: 0 }
  let settled = false
  const render = () => {
    const v = state.v
    value.textContent = brl.format(v)
    pct.textContent = `${Math.round(v)}%`
    gsap.set(ring, { drawSVG: `0% ${v}%` })
    // Mesmos números do painel de demo: 202 itens, 10 divergências
    ok.textContent = String(Math.round((202 * v) / 100))
    open.textContent = String(Math.round(10 * (1 - v / 100)))
    steps.forEach((step, i) => step.toggleAttribute("data-on", v >= (i + 1) * 25 - 0.01))
  }
  render()

  // Cada recurso que termina de carregar empurra o valor pra frente
  const tasks: Promise<unknown>[] = [
    document.fonts.ready,
    ...Array.from(document.images)
      .filter((img) => img.loading !== "lazy" && !img.complete)
      .map((img) => img.decode().catch(() => undefined)),
  ]
  if (document.readyState !== "complete") {
    tasks.push(new Promise((resolve) => window.addEventListener("load", resolve, { once: true })))
  }

  let done = 0
  tasks.forEach((task) =>
    task.then(() => {
      done++
      if (settled) return
      // Para em 92% até o fechamento, para o "R$ 100,00" chegar junto com o carimbo
      gsap.to(state, { v: (done / tasks.length) * 92, duration: 0.6, ease: "power2.out", onUpdate: render, overwrite: true })
    }),
  )

  const start = performance.now()
  const ready = Promise.race([Promise.all(tasks), wait(4000)])

  // Se tudo já estava em cache, a intro fica curta (~1,5 s) para não cansar quem volta ao site
  const cached = ready.then(() => performance.now() - start < 250)
  const minimum = cached.then((isCached) => wait(Math.max(0, (isCached ? 300 : 1200) - (performance.now() - start))))

  return Promise.all([cached, minimum]).then(
    ([isCached]) =>
      new Promise<boolean>((resolve) => {
        settled = true
        const blob = document.querySelector<HTMLElement>("[data-hero-blob='main']")
        const from = `circle(${Math.hypot(innerWidth, innerHeight)}px at ${innerWidth / 2}px ${innerHeight / 2}px)`
        const to = () => {
          if (!blob) return `circle(0px at ${innerWidth / 2}px ${innerHeight / 2}px)`
          const r = blob.getBoundingClientRect()
          return `circle(${r.width / 2}px at ${r.left + r.width / 2}px ${r.top + r.height / 2}px)`
        }

        gsap
          .timeline({
            onComplete: () => {
              intro.remove()
              lenis?.start()
              resolve(true)
            },
          })
          .to(state, { v: 100, duration: 0.5, ease: "power2.out", onUpdate: render, overwrite: true })
          .fromTo(
            stamp,
            { scale: 2.4, rotate: -40, autoAlpha: 0 },
            { scale: 1, rotate: -12, autoAlpha: 1, duration: 0.45, ease: "back.out(2.5)" },
          )
          .to(content, { autoAlpha: 0, y: -24, duration: 0.3, ease: "power2.in" }, "+=0.45")
          .fromTo(intro, { clipPath: from }, { clipPath: to, duration: 0.9, ease: "power4.inOut" }, "<0.1")
          // A hero começa a entrar no meio do encolhimento, não depois dele
          .call(reveal, [], "<0.3")
          // O painel escuro do ReconPay vira o roxo do portfólio enquanto encolhe
          .to(intro, { backgroundColor: "#7c3aed", duration: 0.6, ease: "power2.inOut" }, "<")
          .timeScale(isCached ? 1.7 : 1)
      }),
  )
}

/** Monta a entrada da hero pausada; os `from` já deixam tudo no estado inicial. */
function heroIntro(afterIntro: boolean) {
  const name = document.querySelector("[data-split='hero']")
  if (!name) return null

  const split = SplitText.create(name, { type: "chars" })
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } })

  // Depois da intro, a mancha principal já "existe": o overlay acabou de virar ela
  const blobs = afterIntro ? "[data-hero-blob]:not([data-hero-blob='main'])" : "[data-hero-blob]"
  tl.from(blobs, { scale: 0, duration: 1.1, ease: "elastic.out(1, 0.6)", stagger: 0.12 })
    .from(
      split.chars,
      {
        yPercent: 110,
        rotate: () => gsap.utils.random(-25, 25),
        opacity: 0,
        duration: 0.9,
        stagger: 0.06,
        ease: "back.out(2)",
      },
      0.1,
    )
    .from("[data-hero-photo]", { y: 80, opacity: 0, duration: 1 }, 0.25)
    .from("[data-draw-hero]", { drawSVG: "0%", duration: 0.9, ease: "power2.inOut", stagger: 0.25 }, 0.6)
    .from("[data-hero-in]", { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.07 }, 0.5)
    .from("[data-doodle]", { scale: 0, rotate: -90, duration: 0.7, ease: "back.out(3)", stagger: 0.08 }, 0.9)
    // Só flutua depois de entrar: se começasse antes, leria a rotação inicial (-90°) e a coroa ficaria tombada
    .call(floatDoodles)
  return tl
}

function revealTitles() {
  $("[data-reveal='chars']").forEach((el) => {
    // "words" mantém cada palavra inteira na quebra de linha
    const split = SplitText.create(el, { type: "words,chars", mask: "chars" })
    gsap.from(split.chars, {
      yPercent: 100,
      rotate: 8,
      duration: 0.7,
      ease: "back.out(1.8)",
      stagger: 0.03,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    })
  })
}

function revealBlocks() {
  gsap.set("[data-reveal='up']", { autoAlpha: 0, y: 32 })
  ScrollTrigger.batch("[data-reveal='up']", {
    start: "top 90%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }),
  })
}

function marquees(lenis: Lenis | null) {
  const loops = $("[data-marquee]").map((track) => {
    const direction = Number(track.dataset.marquee) || 1
    const loop = gsap.fromTo(
      track,
      { xPercent: direction > 0 ? -50 : 0 },
      { xPercent: direction > 0 ? 0 : -50, duration: 28, ease: "none", repeat: -1 },
    )
    return loop
  })

  // A velocidade do scroll acelera as faixas e inverte o sentido ao rolar pra cima
  lenis?.on("scroll", ({ velocity, direction }: { velocity: number; direction: number }) => {
    const boost = 1 + Math.min(Math.abs(velocity) / 8, 4)
    loops.forEach((loop) => {
      gsap.to(loop, { timeScale: boost * (direction < 0 ? -1 : 1), duration: 0.3, overwrite: true })
      gsap.to(loop, { timeScale: direction < 0 ? -1 : 1, duration: 1.2, delay: 0.3 })
    })
  })
}

function drawOnScroll() {
  $("[data-draw]").forEach((path) => {
    gsap.from(path, {
      drawSVG: "0%",
      duration: 1.2,
      ease: "power2.inOut",
      scrollTrigger: { trigger: path, start: "top 85%", once: true },
    })
  })

  $("[data-draw-scrub]").forEach((path) => {
    gsap.from(path, {
      drawSVG: "0%",
      ease: "none",
      scrollTrigger: { trigger: path.closest("section"), start: "top 70%", end: "bottom 80%", scrub: 0.6 },
    })
  })

  $("[data-grow]").forEach((line) => {
    gsap.from(line, {
      scaleY: 0,
      ease: "none",
      scrollTrigger: { trigger: line.parentElement, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
    })
  })
}

function caseMedia() {
  // No celular o parallax é mais curto para não invadir o texto vizinho
  const scale = window.matchMedia("(min-width: 1024px)").matches ? 1 : 0.3
  $("[data-parallax]").forEach((el) => {
    const amount = (el.dataset.parallax === "fast" ? 90 : el.dataset.parallax === "slow" ? 30 : 60) * scale
    gsap.fromTo(
      el,
      { y: amount },
      { y: -amount, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
    )
  })

  $("[data-stamp]").forEach((el) => {
    gsap.from(el, {
      scale: 2.4,
      rotate: -70,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(2.5)",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    })
  })
}

function timelinePostits() {
  const notes = $("[data-postit]")
  if (!notes.length) return

  const list = notes[0].closest("ol")
  const drop = gsap.from(notes, {
    y: -120,
    rotate: () => gsap.utils.random(-25, 25),
    opacity: 0,
    duration: 0.9,
    ease: "back.out(1.6)",
    stagger: 0.12,
    paused: true,
  })

  // Cai de novo toda vez que a lista volta à tela, descendo ou subindo
  ScrollTrigger.create({
    trigger: list,
    start: "top 75%",
    end: "bottom 25%",
    onEnter: () => drop.progress() === 0 && drop.play(),
    onEnterBack: () => drop.progress() === 0 && drop.play(),
  })
  // Só rearma quando a lista sai inteira da tela, para os post-its nunca sumirem à vista
  ScrollTrigger.create({
    trigger: list,
    start: "top bottom",
    end: "bottom top",
    onLeave: () => drop.pause(0),
    onLeaveBack: () => drop.pause(0),
  })
}

function stackCards() {
  const cards = $("[data-stack-card]")
  if (!cards.length) return

  // Estado inicial já no carregamento: nada aparece e some antes de animar
  gsap.set(cards, { autoAlpha: 0, y: 40 })
  gsap.set("[data-pill]", { autoAlpha: 0, y: 10 })

  // Card e ferramentas numa sequência só: o card desliza e as ferramentas dele entram logo atrás
  ScrollTrigger.batch(cards, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      batch.forEach((card, i) => {
        gsap
          .timeline({ delay: i * 0.1, defaults: { ease: "power3.out" } })
          .to(card, { autoAlpha: 1, y: 0, duration: 0.8 })
          .to($("[data-pill]", card), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 }, 0.25)
      }),
  })
}

function floatDoodles() {
  $("[data-doodle]").forEach((el, i) => {
    gsap.to(el, { y: i % 2 ? 10 : -10, rotate: "+=8", duration: 2 + i * 0.3, ease: "sine.inOut", yoyo: true, repeat: -1 })
  })
}

function floaters() {
  $("[data-float]").forEach((el) => {
    gsap.to(el, { y: -30, x: 20, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 })
  })
  $("[data-spin]").forEach((el) => {
    gsap.to(el, { rotate: 360, duration: 14, ease: "none", repeat: -1 })
  })
}

function magnetic() {
  $("[data-magnetic]").forEach((el) => {
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" })
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" })

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect()
      xTo((event.clientX - rect.left - rect.width / 2) * 0.3)
      yTo((event.clientY - rect.top - rect.height / 2) * 0.3)
    })
    el.addEventListener("pointerleave", () => {
      xTo(0)
      yTo(0)
    })
  })
}
