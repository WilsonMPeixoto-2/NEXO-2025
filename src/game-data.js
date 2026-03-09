export const TRAIT_LABELS = {
  trait_hacker: "Eng. de IA",
  trait_engineer: "Arquiteto urbano",
  trait_diplomat: "Lider colaborativo",
  trait_bio: "Guardiao eco-tech"
};

export const PROFILE_LABELS = {
  gender: {
    masc: "Masculino",
    fem: "Feminino"
  },
  age: {
    child: "Crianca",
    teen: "Adolescente"
  },
  hair: {
    blue: "Cabelo azul",
    yellow: "Cabelo amarelo",
    red: "Cabelo vermelho"
  },
  power: {
    calc: "Calculo rapido",
    empathy: "Gentileza ativa",
    animal: "Protecao aos bichinhos",
    trees: "Defesa das arvores"
  },
  profession: {
    smart_architect: "Arquiteto de cidades inteligentes",
    ai_engineer: "Engenheiro de IA",
    robo_coach: "Treinador de robo-futebol",
    food_3d: "Criador de alimentos 3D",
    space_driver: "Motorista de onibus espacial",
    game_designer: "Desenhista de jogos digitais",
    holo_actor: "Ator de holograma",
    green_manager: "Gestor de energia verde"
  }
};

export const DEFAULT_PROFILE = {
  gender: null,
  age: null,
  hair: null,
  power: null,
  profession: null
};

export const INITIAL_BATTERY = 55;

export const SCENES = {
  title: {
    speaker: "G.E.T. MOVEL",
    chapter: "Ato 0 | Convocacao",
    theme: "clean",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_title_screen.jpg",
    text:
      "Voce sabia que pode ser um super-heroi de verdade e salvar nossa cidade? Pense rapido e nao deixe nossa bateria acabar.",
    choices: [
      {
        label: "⚠️ Iniciar protocolo de imersao",
        detail: "Painel de controle critico",
        to: "avatar_gender",
        tone: "warning"
      }
    ]
  },

  avatar_gender: {
    speaker: "Console de Avatar",
    chapter: "Ato 0 | Personalizacao",
    theme: "cyber",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_capsula_limpa.jpg",
    text: "Primeiro ajuste: qual genero representa seu avatar para a missao de 2050?",
    choices: [
      {
        label: "Avatar masculino",
        detail: "Perfil visual A",
        setProfile: { gender: "masc" },
        to: "avatar_age",
        tone: "confirm"
      },
      {
        label: "Avatar feminino",
        detail: "Perfil visual B",
        setProfile: { gender: "fem" },
        to: "avatar_age",
        tone: "confirm"
      }
    ]
  },

  avatar_age: {
    speaker: "Console de Avatar",
    chapter: "Ato 0 | Personalizacao",
    theme: "cyber",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_capsula_limpa.jpg",
    text: "Agora defina a faixa etaria do seu personagem.",
    choices: [
      {
        label: "Crianca",
        detail: "Perfil de exploracao inicial",
        setProfile: { age: "child" },
        to: "avatar_hair",
        tone: "confirm"
      },
      {
        label: "Adolescente",
        detail: "Perfil de resposta avancada",
        setProfile: { age: "teen" },
        to: "avatar_hair",
        tone: "confirm"
      }
    ]
  },

  avatar_hair: {
    speaker: "Console de Avatar",
    chapter: "Ato 0 | Personalizacao",
    theme: "cyber",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_capsula_limpa.jpg",
    text:
      "Escolha a cor de cabelo com identidade G.E.T. para o seu avatar em campo.",
    choices: [
      {
        label: "Azul eletrico",
        detail: "Estilo tecnico",
        setProfile: { hair: "blue" },
        to: "power_pick"
      },
      {
        label: "Amarelo neon",
        detail: "Estilo estrategico",
        setProfile: { hair: "yellow" },
        to: "power_pick"
      },
      {
        label: "Vermelho pulsante",
        detail: "Estilo de impacto",
        setProfile: { hair: "red" },
        to: "power_pick"
      }
    ]
  },

  power_pick: {
    speaker: "G.E.T. MOVEL",
    chapter: "Ato 0 | Personalizacao",
    theme: "clean",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_capsula_limpa.jpg",
    text: "Quais poderes voce possui hoje e que podem te ajudar a alcancar seus sonhos?",
    choices: [
      {
        label: "Altos poderes em calculos rapidos",
        detail: "Rota de dados e sistemas",
        setProfile: { power: "calc" },
        grants: ["trait_hacker"],
        to: "profession_pick"
      },
      {
        label: "Ser gentil e simpatico com quem precisa",
        detail: "Rota de negociacao e lideranca",
        setProfile: { power: "empathy" },
        grants: ["trait_diplomat"],
        to: "profession_pick"
      },
      {
        label: "Ajuda a bichinhos indefesos",
        detail: "Rota de cuidado ecologico",
        setProfile: { power: "animal" },
        grants: ["trait_bio"],
        to: "profession_pick"
      },
      {
        label: "Protetor de todas as arvores do bairro",
        detail: "Rota de restauracao urbana",
        setProfile: { power: "trees" },
        grants: ["trait_engineer"],
        to: "profession_pick"
      }
    ]
  },

  profession_pick: {
    speaker: "G.E.T. MOVEL",
    chapter: "Ato 0 | Personalizacao",
    theme: "clean",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_capsula_limpa.jpg",
    text: "Escolha sua profissao do futuro para abrir seu protocolo de missao.",
    choices: [
      {
        label: "Arquiteto de cidades inteligentes",
        detail: "Infraestrutura e desenho urbano",
        setProfile: { profession: "smart_architect" },
        grants: ["trait_engineer"],
        to: "briefing_2050"
      },
      {
        label: "Engenheiro de Inteligencia Artificial",
        detail: "Sistemas autonomos e seguranca",
        setProfile: { profession: "ai_engineer" },
        grants: ["trait_hacker"],
        to: "briefing_2050"
      },
      {
        label: "Treinador de jogadores roboticos de futebol",
        detail: "Estrategia em equipe",
        setProfile: { profession: "robo_coach" },
        grants: ["trait_diplomat"],
        to: "briefing_2050"
      },
      {
        label: "Criador de alimentos em impressora 3D",
        detail: "Tecnologia aplicada ao cuidado",
        setProfile: { profession: "food_3d" },
        grants: ["trait_bio"],
        to: "briefing_2050"
      },
      {
        label: "Motorista de onibus espacial",
        detail: "Navegacao e logistica critica",
        setProfile: { profession: "space_driver" },
        grants: ["trait_engineer"],
        to: "briefing_2050"
      },
      {
        label: "Desenhista de jogos digitais",
        detail: "Criatividade e narrativa interativa",
        setProfile: { profession: "game_designer" },
        grants: ["trait_hacker"],
        to: "briefing_2050"
      },
      {
        label: "Ator de holograma",
        detail: "Comunicacao e engajamento social",
        setProfile: { profession: "holo_actor" },
        grants: ["trait_diplomat"],
        to: "briefing_2050"
      },
      {
        label: "Gestor de energia verde",
        detail: "Sustentabilidade com dados",
        setProfile: { profession: "green_manager" },
        grants: ["trait_bio"],
        to: "briefing_2050"
      }
    ]
  },

  briefing_2050: {
    speaker: "G.E.T. MOVEL",
    chapter: "Ato 1 | Imersao",
    theme: "clean",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_capsula_limpa.jpg",
    text:
      "Iniciando simulacao. Ano de destino: 2050. Status da cidade: instavel. Condicoes climaticas: adversas.",
    choices: [
      {
        label: "Abrir janela da simulacao",
        detail: "Conectar com o video de pane",
        to: "pane_hook",
        tone: "warning"
      }
    ]
  },

  pane_hook: {
    speaker: "ALERTA DE PANE",
    chapter: "Ato 1 | Ruptura",
    theme: "glitch",
    backdrop: "flood-grid",
    image: "./assets/hq-4k/bg_glitch_screen.jpg",
    npc: "./assets/hq-4k/npc_security_drone.png",
    text:
      "Pane total no modulo central! A cidade entrou em modo de inundacao e perda energetica. Ejetando equipe para resposta imediata.",
    choices: [
      {
        label: "⚠️ Confirmar ejeccao",
        detail: "Entrar no Rio de 2050 em colapso",
        to: "guanabara_critical",
        tone: "alert"
      }
    ]
  },

  guanabara_critical: {
    speaker: "Mentor de Campo",
    chapter: "Ato 1 | Ruptura",
    theme: "distopic",
    backdrop: "civic-bunker",
    image: "./assets/hq-4k/bg_baia_distopica.jpg",
    npc: "./assets/hq-4k/npc_mentor_sujo.png",
    imageAlt: "Baia de Guanabara em 2050 em estado critico",
    text:
      "A Bacia da Baia de Guanabara atingiu nivel de risco. Corredores escolares estao ilhados e o sistema de drenagem parou.",
    choices: [
      {
        label: "Fugir para o Colaboratorio",
        detail: "Reagrupar com Cadu e Mila",
        to: "colaboratorio_entry",
        tone: "warning"
      }
    ]
  },

  colaboratorio_entry: {
    speaker: "Cadu",
    chapter: "Ato 1 | Reagrupamento",
    theme: "distopic",
    backdrop: "civic-bunker",
    image: "./assets/hq-4k/bg_safehouse_bunker.jpg",
    npc: "./assets/hq-4k/npc_cadu_explaining.png",
    text:
      "Voce chegou ao Colaboratorio. Mila abriu tres terminais de resposta e um corredor final em modo corrida.",
    choices: [
      {
        label: "Definir terminal principal",
        detail: "Escolha orientada pela sua especializacao",
        to: "mission_hub"
      }
    ]
  },

  mission_hub: {
    speaker: "Mila",
    chapter: "Ato 2 | Missao",
    theme: "distopic",
    backdrop: "civic-bunker",
    image: "./assets/hq-4k/bg_safehouse_bunker.jpg",
    npc: "./assets/hq-4k/npc_mila_neutral.png",
    text:
      "Linha de corte: estabilize um terminal agora. Depois voce corre para religar os Arcos antes da bateria zerar.",
    choices: [
      {
        label: "Terminal IA | Torre Central",
        detail: "Rota de overclocking",
        requires: ["trait_hacker"],
        to: "hacker_01"
      },
      {
        label: "Terminal Malha | Estadio Submerso",
        detail: "Rota de engenharia",
        requires: ["trait_engineer"],
        to: "engineer_01"
      },
      {
        label: "Terminal Tribunal | Copacabana Palace",
        detail: "Rota diplomatica",
        requires: ["trait_diplomat"],
        to: "diplomat_01"
      },
      {
        label: "Terminal Bioma | Jardim Mutante",
        detail: "Rota bio",
        requires: ["trait_bio"],
        to: "bio_01"
      }
    ]
  },

  hacker_01: {
    speaker: "Nucleo Zion",
    chapter: "Ato 2 | Missao IA",
    theme: "cyber",
    backdrop: "tribunal-core",
    image: "./assets/hq-4k/bg_central_torre.jpg",
    npc: "./assets/hq-4k/npc_zion_ia.png",
    text: "A IA Zion bloqueou o acesso. Qual protocolo voce executa?",
    choices: [
      {
        label: "Injetar codigo SME com backup orbital",
        detail: "Resposta segura",
        to: "hacker_success",
        grants: ["node_stable"],
        tone: "confirm"
      },
      {
        label: "Forcar painel em brute force",
        detail: "Risco de curto",
        to: "hacker_fail",
        tone: "alert"
      }
    ]
  },

  hacker_fail: {
    speaker: "Cadu no link",
    chapter: "Ato 2 | Missao IA",
    theme: "glitch",
    backdrop: "tribunal-core",
    image: "./assets/hq-4k/cg_cadu_facepalm.jpg",
    npc: "./assets/hq-4k/npc_cadu_sarcastic.png",
    text:
      "Brute force contra a Zion? Agora a matriz fechou tudo. Respira, volta ao protocolo SME e entra pela rota limpa.",
    choices: [
      {
        label: "Retomar protocolo tecnico",
        detail: "Sem perder a etapa",
        to: "hacker_success",
        grants: ["node_stable"]
      }
    ]
  },

  engineer_01: {
    speaker: "Sistema do Traje",
    chapter: "Ato 2 | Missao Malha",
    theme: "cyber",
    backdrop: "flood-grid",
    image: "./assets/hq-4k/bg_estadio_submerso.jpg",
    text: "A bomba geodesica do Estadio esta sem fase. O que voce faz?",
    choices: [
      {
        label: "Reescrever voltagem e abrir trava magnetica",
        detail: "Resposta recomendada",
        to: "engineer_success",
        grants: ["node_stable"],
        tone: "confirm"
      },
      {
        label: "Ligar em carga total de uma vez",
        detail: "Pode quebrar o reator",
        to: "engineer_fail",
        tone: "alert"
      }
    ]
  },

  engineer_fail: {
    speaker: "Cadu no radio",
    chapter: "Ato 2 | Missao Malha",
    theme: "distopic",
    backdrop: "flood-grid",
    image: "./assets/hq-4k/bg_estadio_submerso.jpg",
    npc: "./assets/hq-4k/npc_cadu_panicking.png",
    text: "A bomba travou no pico. Recalibre com metodo fino.",
    choices: [
      {
        label: "Recalibrar com seguranca",
        detail: "Retomar operacao",
        to: "engineer_success",
        grants: ["node_stable"]
      }
    ]
  },

  diplomat_01: {
    speaker: "Alto Juiz Kael",
    chapter: "Ato 2 | Missao Tribunal",
    theme: "glitch",
    backdrop: "tribunal-core",
    image: "./assets/hq-4k/bg_auditorio_ia.jpg",
    npc: "./assets/hq-4k/npc_elder_diplomat.png",
    text: "Defina por que humanos devem co-governar a cidade com as IAs.",
    choices: [
      {
        label: "Sem criatividade humana, sua previsao fica cega",
        detail: "Argumento tecnico e social",
        to: "diplomat_success",
        grants: ["node_stable"],
        tone: "confirm"
      },
      {
        label: "Aceitem porque sim",
        detail: "Argumento fraco",
        to: "diplomat_fail",
        tone: "alert"
      }
    ]
  },

  diplomat_fail: {
    speaker: "Kael",
    chapter: "Ato 2 | Missao Tribunal",
    theme: "distopic",
    backdrop: "tribunal-core",
    image: "./assets/hq-4k/bg_auditorio_ia.jpg",
    npc: "./assets/hq-4k/npc_elder_diplomat.png",
    text: "Proposta recusada por falta de base. Tente novamente com dados.",
    choices: [
      {
        label: "Refazer defesa com dados e empatia",
        detail: "Reabrir negociacao",
        to: "diplomat_success",
        grants: ["node_stable"]
      }
    ]
  },

  bio_01: {
    speaker: "Scanner Bio",
    chapter: "Ato 2 | Missao Bioma",
    theme: "distopic",
    backdrop: "botanic-lab",
    image: "./assets/hq-4k/bg_jardim_mutante.jpg",
    text: "Esporos toxicos cobriram o Jardim. Qual acao voce executa?",
    choices: [
      {
        label: "Aplicar retrovirus neutralizador",
        detail: "Cura seletiva",
        to: "bio_success",
        grants: ["node_stable"],
        tone: "confirm"
      },
      {
        label: "Queimar toda a area com plasma",
        detail: "Dano ambiental alto",
        to: "bio_fail",
        tone: "alert"
      }
    ]
  },

  bio_fail: {
    speaker: "Mila",
    chapter: "Ato 2 | Missao Bioma",
    theme: "glitch",
    backdrop: "botanic-lab",
    image: "./assets/hq-4k/bg_jardim_mutante.jpg",
    npc: "./assets/hq-4k/npc_mila_neutral.png",
    text: "Negativo. Sem ecossistema vivo, sem cidade. Reaplique dose calibrada.",
    choices: [
      {
        label: "Retomar com protocolo de cura",
        detail: "Salvar o bioma",
        to: "bio_success",
        grants: ["node_stable"]
      }
    ]
  },

  hacker_success: {
    speaker: "Zion",
    chapter: "Ato 2 | Missao IA",
    theme: "cyber",
    backdrop: "tribunal-core",
    image: "./assets/hq-4k/cg_hacker_matrix.jpg",
    npc: "./assets/hq-4k/npc_zion_ia.png",
    text:
      "Matriz de defesa desmontada. A Torre Central voltou a operar em modo seguro para a rede escolar.",
    choices: [
      {
        label: "Retornar ao Colaboratorio",
        detail: "Encadear para fase final",
        to: "mission_done",
        tone: "confirm"
      }
    ]
  },

  engineer_success: {
    speaker: "Sistema NEXO",
    chapter: "Ato 2 | Missao Malha",
    theme: "clean",
    backdrop: "flood-grid",
    image: "./assets/hq-4k/cg_engineer_conduit.jpg",
    text:
      "Conduites drenantes reativados. A agua recuou e os corredores da cidade voltaram a respirar.",
    choices: [
      {
        label: "Retornar ao Colaboratorio",
        detail: "Encadear para fase final",
        to: "mission_done",
        tone: "confirm"
      }
    ]
  },

  diplomat_success: {
    speaker: "Kael",
    chapter: "Ato 2 | Missao Tribunal",
    theme: "clean",
    backdrop: "tribunal-core",
    image: "./assets/hq-4k/cg_diplomat_handshake.jpg",
    npc: "./assets/hq-4k/npc_elder_diplomat.png",
    text:
      "Acordo firmado. O tribunal sintetico liberou energia para reerguer os pontos criticos da simulacao.",
    choices: [
      {
        label: "Retornar ao Colaboratorio",
        detail: "Encadear para fase final",
        to: "mission_done",
        tone: "confirm"
      }
    ]
  },

  bio_success: {
    speaker: "Scanner Bio",
    chapter: "Ato 2 | Missao Bioma",
    theme: "clean",
    backdrop: "botanic-lab",
    image: "./assets/hq-4k/cg_mutant_flower.jpg",
    text:
      "Bio-matriz restaurada. O ar urbano foi descontaminado e os sensores verdes retomaram o equilibrio.",
    choices: [
      {
        label: "Retornar ao Colaboratorio",
        detail: "Encadear para fase final",
        to: "mission_done",
        tone: "confirm"
      }
    ]
  },

  mission_done: {
    speaker: "Mila",
    chapter: "Ato 2 | Missao",
    theme: "clean",
    backdrop: "civic-bunker",
    image: "./assets/hq-4k/cg_hand_kit.jpg",
    npc: "./assets/hq-4k/npc_mila_laughing.png",
    text:
      "Terminal estabilizado. Agora entra o protocolo arcade: corrida NEXO em tempo real para religar os Arcos da Lapa.",
    choices: [
      {
        label: "⚠️ Iniciar corrida NEXO",
        detail: "Arcade real com obstaculos e coleta",
        to: "run_arcade",
        tone: "warning"
      }
    ]
  },

  run_arcade: {
    speaker: "Console de Corrida",
    chapter: "Ato 3 | Corrida",
    theme: "cyber",
    backdrop: "flood-grid",
    image: "./assets/hq-4k/bg_painel_controle.jpg",
    mode: "runner",
    runner: {
      durationSec: 28,
      passBattery: 64,
      passScore: 900,
      legendScore: 1650,
      nextLegend: "ending_legend",
      nextPass: "ending_success",
      nextFail: "ending_fail",
      title: "Operacao Arcos da Lapa",
      hint: "Setas ou A/D para mover, espaco para salto"
    },
    text:
      "Corra, colete energia e evite obstaculos. O desempenho aqui define a qualidade do seu final.",
    choices: []
  },

  ending_success: {
    speaker: "Diretoria SME",
    chapter: "Ato Final",
    theme: "clean",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_rio_restaurado.jpg",
    showRanking: true,
    text:
      "Linha do tempo estabilizada com excelencia. Score de impacto: {{impactScore}} e bateria final: {{battery}}%.",
    choices: [
      {
        label: "🚨 CORRER AGORA PARA A CAPSULA DA MEMORIA",
        detail: "Transicao imediata para o Escape presencial",
        to: "restart",
        tone: "warning"
      }
    ]
  },

  ending_legend: {
    speaker: "Diretoria SME",
    chapter: "Ato Final | Elite",
    theme: "cyber",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/cg_diplomat_handshake.jpg",
    showRanking: true,
    text:
      "Performance de elite. Sua equipe entrou no nivel maximo com score {{impactScore}} e abriu bonus para a fase fisica.",
    choices: [
      {
        label: "🚨 CORRER AGORA PARA A CAPSULA DA MEMORIA",
        detail: "Entrada premium no Escape presencial",
        to: "restart",
        tone: "warning"
      }
    ]
  },

  ending_fail: {
    speaker: "Diretoria SME",
    chapter: "Ato Final",
    theme: "distopic",
    backdrop: "civic-bunker",
    image: "./assets/hq-4k/bg_rua_alagada_neon.jpg",
    npc: "./assets/hq-4k/npc_mentor_sujo.png",
    showRanking: true,
    text:
      "A cidade foi mantida em estado minimo. Score de impacto: {{impactScore}} e bateria final: {{battery}}%. Ainda ha trabalho duro pela frente.",
    choices: [
      {
        label: "🚨 CORRER AGORA PARA A CAPSULA DA MEMORIA",
        detail: "Escape presencial decide o resultado final",
        to: "restart",
        tone: "warning"
      }
    ]
  },

  restart: {
    speaker: "G.E.T. MOVEL",
    chapter: "Ciclo",
    theme: "clean",
    backdrop: "orbital-dawn",
    image: "./assets/hq-4k/bg_title_screen.jpg",
    text:
      "Ciclo encerrado. Equipe pronta para nova rodada com outro grupo de estudantes.",
    choices: [
      {
        label: "Iniciar novo grupo",
        detail: "Reset completo de perfil e bateria",
        to: "title",
        reset: true
      }
    ]
  }
};


