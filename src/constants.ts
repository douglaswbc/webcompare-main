import { Plan, Article, Provider } from '../types';

export const PROVIDERS: Provider[] = [
  {
    name: 'Vivo Fibra',
    type: 'Internet Fibra',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOCet3z7mDhUJMyIUJgAc0sQN8pxXjWGswj6ptP1WX79DNL4ds0Ueyqj_X29HWTQD4aNpH4bHGHk2uCqf4uzMNEKpx7pKVo9UsFu_yyPiveAsvFaGO91cGfxxLBZxgRN5QZ_cX3Ms8PccwmtszxhRmB_7agOyt65IeReV8-6QOa4EWq_-xSN_JEIKaKPH99nWsjfatxLOWxzsArXxxv5d2edir9TVkz-5QlaTJgpNSxGPxKLNK1U0D4dl1ik--kvm-yhmDhcW7nJQt',
  },
  {
    name: 'Claro NET',
    type: 'Banda Larga',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn61qLEL6AHWdEFxxvkHoljVeIwkvRwU1CeN9-SyfFXBuso8_g3Uxin9nPKJTEVc8VMohpypgB4n0QhHUJa66UUgSRm_gT_P_BWlGsCHTtqlwOdvvOQK1Uq7XJRf3UFogtWYtomjpWsmyY4yiWbZo80s5mA9hrnGNLSBzX3MYs4e4PNIQbRfm9Lgv3To8xwtV7yG2E7ZxFDNMiiUeVdsncYeK8659LuBR0PW1XdET42w7828uMcBLpaYsk0YzC_3fuEsaLYfYbgLBi',
    logoClass: 'p-2'
  },
  {
    name: 'TIM Live',
    type: 'Internet 5G',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDXRayKvgPmEI64rOPbd-iqy-PQhIoqCjcuig0OR7J7k5IGv-rbONjYRIjdtbeGioNOkyzeXlELBglKmf4UF6ZEqW3-RawGldeY-c0E1W8UyGcev6sIz7aHeiWjKc69X1ulGnMBdt_CK4AzOt_nIsg_a-bMlcxNUNLrxwscEcXi8Pf7NxQI6iG7FR1b7vBeTxie8cJVUecN7AL28lN-tXKccgF5F0JPemGLJyRYlagYOJjEr1wZRUnusdaoWRcwNqOsUI2NCRaHMlBk',
  },
  {
    name: 'Oi Fibra',
    type: 'Internet Residencial',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSgZCqKRQdG7RiQSmDdGBURDH1ftWtYitZgamlagUT_XedyeljWIbrGQLAeIIE1AIduUOuDcTNH4DgNOHDR-bn_oAdxUAfCR8ClWGpL2SvuKZGSLgYylwnwBzTWjzpzfSzUITBJUmngQaky-eiXQqayMx59HdYSqW7_U_Mjn0KcuqiyMTx6NoLN-NBQMhKxUty8qatQ2RqMs_VvSk0DVlfx7MB9URJxjngDYx42U5YrnjLMqHOFWvZRRuVGTMP8yyxIi8_A8F84_i8',
    logoClass: 'p-2'
  }
];

export const PLANS: Plan[] = [
  {
    id: '1',
    provider: 'Vivo',
    name: 'Fibra 300 Mega',
    downloadSpeed: '300Mbps',
    uploadSpeed: '150Mbps',
    price: 'R$ 99,90',
    period: '/mês',
    subtitle: 'nos primeiros 12 meses',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAw72zpcROPJEFF62QOSan_Mb2y_QUkb_E_zXPiUDBIhsGYI8GkRshP6-D7dzfsb9eMhSWYFiytIrSZb6nWe8qpBghRoCXhkJNd7DHLTh_7Ol2Z3D5-VgeJcLuMvr4Kmvc4_as360ay3f8PNkHlNEijypnBPbpYmAjlbdbLm_R_YGqCnoSJHWG0xsTLSdf-W8hq9oweVkO2KlyEAUMOR8NiG6d675-gp8ES3REWuQJ7ZrCqG4rD8d-KX0-YbCdS-KL2zUoFn3axFai_',
    badge: {
      text: 'Popular',
      icon: 'star',
      colorClass: 'bg-amber-100 dark:bg-amber-900/40',
      textClass: 'text-amber-700 dark:text-amber-300'
    },
    specs: {
      connectionType: 'Fibra Ótica',
      dataLimit: 'Ilimitado',
      contract: '12 meses'
    },
    benefits: [
      { text: 'Roteador Wi-Fi Incluso', icon: 'wifi' },
      { text: 'Acesso a Serviços de Streaming', icon: 'live_tv' },
      { text: 'Instalação Grátis', icon: 'build' }
    ]
  },
  {
    id: '2',
    provider: 'Claro',
    name: '500 Mega Fibra',
    downloadSpeed: '500Mbps',
    uploadSpeed: '250Mbps',
    price: 'R$ 119,90',
    period: '/mês',
    subtitle: 'Wi-Fi grátis',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCC6AKP8FTiXwowT-IsEyWQtHsrWxsy9P6nd-PQ8k-B-6VpcHMfL45SZkeD5zR9Xm9BARRRJ64e6XdTaVWuJ3LMxLyV7ZIv5vnXG1tR_TtvnTkZSbIOuHtt4mmfTaXtUEF9lMrFjwD_4oOfyuSJt-O_Qj9FihgdlYPYpAyrCbPWyOSJJEexNzMQ0pPjg-kGjlBGg0FcUwqVACdFH0PjVayBTjZSRI2dj2ZUydAS3fFYGKmkKrYgkiGG66rkShct2AQ0z3j3HK0GpKQx',
    badge: {
      text: 'Promoção',
      icon: 'local_offer',
      colorClass: 'bg-green-100 dark:bg-green-900/40',
      textClass: 'text-green-700 dark:text-green-300'
    },
    specs: {
      connectionType: 'Fibra Ótica',
      dataLimit: 'Ilimitado',
      contract: 'Fidelidade 12 meses'
    },
    benefits: [
      { text: 'Wi-Fi Mesh', icon: 'router' },
      { text: 'Discovery+', icon: 'movie' },
      { text: 'Instalação Grátis', icon: 'build' }
    ]
  },
  {
    id: '3',
    provider: 'TIM',
    name: 'Ultrafibra 1 Giga',
    downloadSpeed: '1Gbps',
    uploadSpeed: '500Mbps',
    price: 'R$ 159,90',
    period: '/mês',
    subtitle: 'Instalação inclusa',
    bannerImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9ABOs10iItRcbdh2H7ZVYbUEql5SswQz7I6GJ-2gdmsgOOZWAk6-RZBfErDSAaxQQ5iUkiSG3Qd8ypunTfoXZhU2msTBf1Pb0McU3jsQgqxisufejzUsoV93lQudM1VwaX6JefJYCLYaKYxgfwHro-htQAmKacmD_aBbLaSa1e1sk0uqh4VAjuBZywXo_txO3hBFgsQqOuBC262xbPlHZVO0ckLDYjXpHNLXhODATlfjsL0girdNZ_K8CuTmgzspI4sMKHTdwZjUa',
    specs: {
      connectionType: 'Fibra Ótica',
      dataLimit: 'Ilimitado',
      contract: 'Sem fidelidade'
    },
    benefits: [
      { text: 'Paramount+ Incluso', icon: 'movie' },
      { text: 'Deezer Premium', icon: 'music_note' },
      { text: 'Modem Wi-Fi 6', icon: 'router' }
    ]
  }
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Guia Completo: Como Escolher o Plano de Internet Ideal',
    description: 'Um guia passo a passo para ajudar você a encontrar o plano perfeito para suas necessidades, seja para trabalho, estudo ou lazer.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNIrsyZ9Y997OmYTNJchrq1K8bUYbu8DUf4OMsWamg1lyJRzJDTwEGBwROO8De59hzHzQltjVN5EtIxbRcyOTX73Vbnfb1ivK-gv6WxFWz-35D6cpIRZ3nLMShCr_c-hYGKAlLzic0pv9PZFoW-s1q0Eb3dcl9Q5pIxmgQx2GATTeicaH8x8cDJE0K4Ah8sm_UEj4xuQQqM856eIcBijuGUDhOCbUuByZNn-egC8IuBRpYWy8XP0_Hkz6LDs-JBfEXbmWWs1-hWbK2',
    author: 'Autor Anônimo',
    date: '15 de Ago',
    readTime: '5 min de leitura'
  },
  {
    id: '2',
    title: 'Fibra Óptica vs. 5G: Qual a Melhor Tecnologia para Você?',
    description: 'Analisamos os prós e contras de cada tecnologia para que você possa tomar uma decisão informada.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKl_fyXqLFJP5l9NCD8yp5UUkVTSB2VpOHycRCi-ZNYPbztXQTozpPm0EFmxGcmA_2jYnSDYhrm81YhQ1Tph9I6_EO3iSRIe7LoYlbM2imcriE7UKGvdbOEDCsKlLNNf0WS3tYu1qTWTMSQ8coKy-mP5VB7HI2tefuNcHbbeMv1fDFFde-ytdhh5BimGtHerm9fNhWahhCT0jv7VQ_M32FERvh20FvuVFzsqa0ym3uZo7iy7GEevgCHmAcSFFQjAgVo0sTXbJv3Alq',
    author: 'Autor Anônimo',
    date: '12 de Ago',
    readTime: '4 min de leitura'
  },
  {
    id: '3',
    title: '5 Dicas para Melhorar o Sinal do seu Wi-Fi em Casa',
    description: 'Aumente sua cobertura e velocidade com estas dicas simples e eficazes que qualquer um pode aplicar.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaB5dHFImKrNnh54wRMQ14W0RIV1hpxtc6hispbcYDt8LT5ysdXTiip9B5Eb3WVBYE1tDMUZX6suU3SHrO6u9cuAVeOVObs4ZH-jh5aUGf1UDOxe8ZABKPSseJU3-Ot1BFKtKnFCpIq4vXNDBgADqJvWVznBO1XugB8fB4HukDJklCUzY4E3G2AobINTsZco9WGhyG_OoR2aZYlyJ_r5xbhQaB2qBnij5_v2xo3phBfDOdyh93_96zr0UShrrH2H313JHJxUeCe3cI',
    author: 'Maria Silva',
    date: '10 de Ago',
    readTime: '3 min de leitura'
  },
  {
    id: '4',
    title: 'Entendendo sua Conta de Internet: Termos que Você Precisa Saber',
    description: 'Desmistificamos jargões como "franquia", "velocidade de upload" e "latência" para você nunca mais ter dúvidas.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoPXDGwG4Z1var7y2CQ4-_ObJhWYg8Z_Bgmj777VtL8CCEZ_sXp32lLLTb6AAuXOSSu-bHkRBnDcd3W_HVbrSJ2ucNR8Lhddo_NZd-cCFRzd2uvu1TwBhnhzDA0HpPyCenAQeOIrm9D9SoCJoWiKbVrugqWsLvdqR7rdoPz9l9hpUoP-lHJcO0EKYq-fYPMnq1y7Yvp1IxgR8ZLKiu2wXms5TDT6aAMr8F5EcOBjbtRSMQw5KSkKsaC-szIxsOL6wTdPmcaKwOeLxk',
    author: 'João Pereira',
    date: '8 de Ago',
    readTime: '6 min de leitura'
  }
];
