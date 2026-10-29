import type { ImageMetadata } from "astro"
import reconpayShot from "@/assets/projects/reconpay-dashboard.png"
import mfTelegram from "@/assets/projects/mf-telegram.png"
import mfDashboard from "@/assets/projects/mf-dashboard.png"
import inventoryShot from "@/assets/projects/inventory-landing.png"

export type Accent = "lime" | "laranja" | "azul" | "roxo"

export type Link = { label: string; href: string }

export type Project = {
  slug: string
  number: string
  name: string
  accent: Accent
  category: string
  stack: string[]
  summary: string
  decisions: { title: string; detail: string }[]
  links: Link[]
  media:
    | { kind: "polaroid"; image: ImageMetadata; alt: string }
    | { kind: "phones"; images: { image: ImageMetadata; alt: string; bar: string }[] }
  note: string
  stamp?: string
}

export const contact = {
  email: "hanrry.jsantos@gmail.com",
  github: "https://github.com/hanrrysantos",
  linkedin: "https://www.linkedin.com/in/hanrrysantos/",
  whatsapp: "https://wa.me/5594929236666",
}

export const nav: Link[] = [
  { label: "projetos", href: "#projetos" },
  { label: "trajetória", href: "#trajetoria" },
  { label: "stack", href: "#stack" },
  { label: "sobre", href: "#sobre" },
  { label: "contato", href: "#contato" },
]

export const marquee = {
  primary: ["JAVA", "SPRING BOOT", "POSTGRESQL", "RABBITMQ", "DOCKER", "AWS"],
  secondary: ["JAVA", "SPRING", "KAFKA", "REDIS", "FLYWAY"],
}

export const projects: Project[] = [
  {
    slug: "reconpay",
    number: "01",
    name: "ReconPay",
    accent: "lime",
    category: "Fintech · conciliação de pagamentos",
    stack: ["Java 21", "Spring Boot 3.5", "Next.js", "AWS"],
    summary:
      "Plataforma de conciliação de vendas no cartão. Cruza vendas, liquidações do adquirente e extrato bancário para apontar cada divergência, até o último centavo.",
    decisions: [
      { title: "Processamento assíncrono", detail: "A API responde 202 e um worker processa a conciliação em fila." },
      { title: "Precisão monetária", detail: "Valores em NUMERIC(19,2) e lossless-json, sem nenhum cálculo em ponto flutuante." },
      { title: "Qualidade no CI", detail: "Testcontainers, cobertura mínima de 85% e análise de dependências com OWASP." },
    ],
    links: [
      { label: "demo ao vivo", href: "https://reconpay.vercel.app" },
      { label: "código", href: "https://github.com/hanrrysantos/reconpay" },
      { label: "documentação da API", href: "https://reconpay.hanrry.top/swagger-ui.html" },
    ],
    media: {
      kind: "polaroid",
      image: reconpayShot,
      alt: "Painel de fechamento do ReconPay com taxa de conciliação, esperado × recebido e divergências por tipo",
    },
    note: "tem conta demo de 1 clique ↑",
    stamp: "em\nprodução",
  },
  {
    slug: "mao-fechada",
    number: "02",
    name: "Mão Fechada",
    accent: "laranja",
    category: "IA aplicada · finanças pessoais",
    stack: ["Java", "Spring Boot 4", "Gemini", "Telegram", "React"],
    summary:
      "Controle de gastos direto no Telegram. O usuário escreve em linguagem natural, como “gastei R$ 32,50 no almoço”, e o bot interpreta, pede confirmação e registra o lançamento.",
    decisions: [
      { title: "Confirmação obrigatória", detail: "O Gemini interpreta a mensagem, mas nada é salvo sem a confirmação do usuário." },
      { title: "Resiliência entre modelos", detail: "Fallback automático para outro modelo quando um deles falha." },
      { title: "Autenticação nativa", detail: "Mini App validada pela assinatura dos dados enviados pelo Telegram." },
    ],
    links: [
      { label: "abrir o bot", href: "https://t.me/MaoFechadaBot" },
      { label: "código", href: "https://github.com/hanrrysantos/mao-fechada" },
      { label: "demo web", href: "https://mao-fechada.vercel.app" },
    ],
    media: {
      kind: "phones",
      images: [
        { image: mfTelegram, alt: "Conversa com o bot do Mão Fechada registrando um gasto", bar: "#ffffff" },
        { image: mfDashboard, alt: "Dashboard do Mão Fechada no celular", bar: "#f5f5f7" },
      ],
    },
    note: "é só mandar mensagem →",
  },
  {
    slug: "inventory-manager",
    number: "03",
    name: "Inventory",
    accent: "azul",
    category: "Gestão de estoque · perecíveis",
    stack: ["Java", "RabbitMQ", "Grafana", "React"],
    summary:
      "Controle de estoque por lote para produtos perecíveis. Registra entradas e saídas e define automaticamente qual lote sai primeiro, reduzindo perdas por vencimento.",
    decisions: [
      { title: "FEFO automático", detail: "O lote com vencimento mais próximo é sempre o primeiro a sair." },
      { title: "Monolito modular", detail: "Módulos com fronteiras claras, prontos para virar serviços se a escala exigir." },
      { title: "Eventos confiáveis", detail: "Eventos de reposição publicados somente após o commit da transação." },
    ],
    links: [
      { label: "abrir aplicação", href: "https://controle-de-estoque.hanrry.top" },
      { label: "código", href: "https://github.com/hanrrysantos/inventory-manager" },
      { label: "documentação da API", href: "https://api-controle-de-estoque.hanrry.top/swagger-ui/index.html" },
    ],
    media: {
      kind: "polaroid",
      image: inventoryShot,
      alt: "Página inicial do EstoqueHub, interface web do Inventory Manager",
    },
    note: "specs, planos e ADRs\nversionados no repo ✓",
  },
]

export const otherProjects = [
  {
    name: "E-commerce",
    description: "Arquitetura de microsserviços com pagamento via Mercado Pago e confirmação por webhook.",
    stack: ["Java", "RabbitMQ", "Docker"],
    accent: "azul",
    category: "Microsserviços",
    href: "https://github.com/hanrrysantos/e-commerce-microsservicos",
  },
  {
    name: "Rate limiting",
    description: "Limitação de requisições com janela fixa no Redis, validada com testes de carga no k6.",
    stack: ["Java", "Redis", "k6"],
    accent: "laranja",
    category: "Performance · API",
    href: "https://github.com/hanrrysantos/rate-limiting",
  },
  {
    name: "Event Score",
    description: "Sistema de apuração de pontuação para a Arena Comp 2026.",
    stack: ["TypeScript"],
    accent: "roxo",
    category: "Competição",
    href: "https://github.com/hanrrysantos/event-score",
  },
  {
    name: "Deefy",
    description: "Plataforma de streaming musical da UEPA, onde liderei uma equipe de 4 devs backend.",
    stack: ["Java", "Spring", "Swagger"],
    accent: "lime",
    category: "Liderança técnica",
    href: "https://github.com/eng-software-t2024/deefy",
  },
] as const

export const timeline = [
  { date: "ago 2024", title: "Início da graduação em Engenharia de Software na UEPA", tag: "graduação", color: "#FFF3B0" },
  { date: "2025", title: "Tech lead backend no Deefy, liderando 4 devs", tag: "liderança", color: "#C7F9CC" },
  { date: "abr 2026", title: "Dev backend voluntário na FullDev, com mais de 10 endpoints entregues", tag: "comunidade", color: "#BDE0FE" },
  { date: "jul 2026", title: "Projeto de extensão PET-Saúde: Clima nas UBSs", tag: "extensão", color: "#FFD6A5" },
  { date: "ago 2026", title: "Selecionado como Google Student Ambassador", tag: "liderança", color: "#E4C1F9" },
  { date: "set 2026", title: "Pesquisador de iniciação científica no SoftLab", tag: "pesquisa", color: "#C6F432" },
]

export const stack: { title: string; accent: Accent; tools: string[] }[] = [
  { title: "Linguagem e frameworks", accent: "lime", tools: ["Java 21", "Spring Boot", "JPA / Hibernate", "MapStruct"] },
  { title: "Segurança e proxy", accent: "roxo", tools: ["Spring Security", "JWT", "OAuth", "Nginx"] },
  { title: "Mensageria", accent: "laranja", tools: ["RabbitMQ", "Kafka"] },
  { title: "Banco de dados", accent: "azul", tools: ["PostgreSQL", "MongoDB", "Redis", "Flyway"] },
  { title: "Testes e qualidade", accent: "lime", tools: ["JUnit 5", "Testcontainers", "JaCoCo", "k6"] },
  { title: "DevOps e observabilidade", accent: "roxo", tools: ["Docker", "GitHub Actions", "AWS", "Grafana"] },
]

/* Classes completas para o Tailwind detectar */
export const accentText: Record<Accent, string> = {
  lime: "text-lime",
  laranja: "text-laranja",
  azul: "text-azul",
  roxo: "text-roxo",
}
export const accentBg: Record<Accent, string> = {
  lime: "bg-lime",
  laranja: "bg-laranja",
  azul: "bg-azul",
  roxo: "bg-roxo",
}
export const accentBorder: Record<Accent, string> = {
  lime: "border-lime",
  laranja: "border-laranja",
  azul: "border-azul",
  roxo: "border-roxo",
}
