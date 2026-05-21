import { writeFileSync } from 'fs';

// ============================================================================
// GENERATE-GLOBAL-DATA.MJS
// Generates ~850 international UAP/UFO documents for the UAP Vault project
// ============================================================================

const NOW = new Date().toISOString();

// ── Seeded PRNG for deterministic output ────────────────────────────────────
let _seed = 42;
function seededRandom() {
  _seed = (_seed * 16807 + 0) % 2147483647;
  return (_seed - 1) / 2147483646;
}
function pick(arr) { return arr[Math.floor(seededRandom() * arr.length)]; }
function randInt(min, max) { return Math.floor(seededRandom() * (max - min + 1)) + min; }
function randFloat(min, max, decimals = 4) {
  return parseFloat((seededRandom() * (max - min) + min).toFixed(decimals));
}

// ── Slug helper ─────────────────────────────────────────────────────────────
function makeSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Month helpers ───────────────────────────────────────────────────────────
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const MONTHS_PT = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];

// ============================================================================
// ANCHOR CASES — Real, historically accurate cases
// ============================================================================

const anchorCases = [
  // ─── BRAZIL ───────────────────────────────────────────────────────────────
  {
    country: 'BR',
    source_program: 'OPERACAO_PRATO',
    agency: 'FAB',
    incident_year: 1977,
    incident_date: 'OCT 1977',
    location_name: 'Colares, Pará',
    location_region: 'Pará, Brasil',
    lat: -0.9367,
    lng: -48.5325,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Operation Saucer (Operação Prato) — Colares Light Phenomena Investigation',
    title_pt: 'Operação Prato — Investigação dos Fenômenos Luminosos de Colares',
    summary_en: 'Classified Brazilian Air Force investigation (1977-1978) into anomalous luminous phenomena terrorizing the population of Colares island, Pará. Captain Uyrangê Hollanda led a team that documented over 300 witness accounts and captured photographs of unidentified aerial objects emitting focused beams of light. Witnesses reported physical effects including puncture marks and blood extraction. The operation was officially classified for decades before partial declassification in 2004-2005.',
    summary_pt: 'Investigação classificada da Força Aérea Brasileira (1977-1978) sobre fenômenos luminosos anômalos que aterrorizavam a população da ilha de Colares, Pará. O Capitão Uyrangê Hollanda liderou uma equipe que documentou mais de 300 relatos de testemunhas e capturou fotografias de objetos aéreos não identificados emitindo feixes de luz focalizados. Testemunhas relataram efeitos físicos incluindo marcas de perfuração e extração de sangue. A operação foi oficialmente classificada por décadas antes da desclassificação parcial em 2004-2005.',
    analysis_en: 'One of the most extensively documented military UAP investigations in South American history. The physical trace evidence and number of military witnesses make this case particularly significant.',
    analysis_pt: 'Uma das investigações militares de UAP mais extensamente documentadas na história da América do Sul. As evidências físicas e o número de testemunhas militares tornam este caso particularmente significativo.',
    tags: ['fab', 'operacao-prato', 'colares', '1977', 'physical-effects', 'military-investigation'],
    official_id_prefix: 'FAB-OP',
  },
  {
    country: 'BR',
    source_program: 'OPERACAO_PRATO',
    agency: 'FAB',
    incident_year: 1986,
    incident_date: '19 MAY 1986',
    location_name: 'São Paulo, Rio de Janeiro, Minas Gerais',
    location_region: 'Sudeste, Brasil',
    lat: -23.5505,
    lng: -46.6333,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Official UFO Night of Brazil — Fighter Jet Scramble Over Multiple Cities',
    title_pt: 'Noite Oficial dos OVNIs no Brasil — Caças Scramble Sobre Múltiplas Cidades',
    summary_en: 'On May 19, 1986, approximately 21 unidentified objects were tracked on radar and visually confirmed over several major Brazilian cities. The Brazilian Air Force scrambled F-5E and Mirage III fighters from multiple bases. Pilots reported objects performing extraordinary maneuvers including sudden stops, rapid acceleration, and formation flying. Air Force Minister Brigadeiro Octávio Moreira Lima held a historic press conference acknowledging the events. Radar data from CINDACTA I and II confirmed the objects.',
    summary_pt: 'Em 19 de maio de 1986, aproximadamente 21 objetos não identificados foram rastreados por radar e confirmados visualmente sobre diversas grandes cidades brasileiras. A Força Aérea Brasileira decolou caças F-5E e Mirage III de múltiplas bases. Pilotos relataram objetos realizando manobras extraordinárias incluindo paradas repentinas, aceleração rápida e voo em formação. O Ministro da Aeronáutica Brigadeiro Octávio Moreira Lima realizou uma histórica coletiva de imprensa reconhecendo os eventos. Dados de radar do CINDACTA I e II confirmaram os objetos.',
    analysis_en: 'Unprecedented case where a national air force publicly acknowledged UAP encounters. Multiple military radar systems and trained fighter pilots corroborated the sightings simultaneously.',
    analysis_pt: 'Caso sem precedentes em que uma força aérea nacional reconheceu publicamente encontros com UAP. Múltiplos sistemas de radar militares e pilotos de caça treinados corroboraram os avistamentos simultaneamente.',
    tags: ['fab', 'noite-oficial-ovnis', '1986', 'fighter-jets', 'radar-confirmed', 'multiple-witnesses'],
    official_id_prefix: 'FAB-NO',
  },
  {
    country: 'BR',
    source_program: 'OPERACAO_PRATO',
    agency: 'FAB',
    incident_year: 1996,
    incident_date: '20 JAN 1996',
    location_name: 'Varginha, Minas Gerais',
    location_region: 'Minas Gerais, Brasil',
    lat: -21.5510,
    lng: -45.4333,
    media_type: 'mixed',
    classification: 'unresolved',
    title_en: 'Varginha Incident — Alleged Non-Human Entity Recovery',
    title_pt: 'Caso Varginha — Suposta Recuperação de Entidade Não-Humana',
    summary_en: 'Series of events in January 1996 in Varginha, Minas Gerais involving alleged sightings and capture of anomalous entities by Brazilian military and fire department personnel. Three young women reported a close encounter with a non-human creature on January 20. Multiple witnesses including military personnel reported subsequent sightings. Brazilian Army\'s Escola de Sargentos das Armas (ESA) was reportedly involved in containment operations. The case remains one of the most debated UAP incidents in Latin American history.',
    summary_pt: 'Série de eventos em janeiro de 1996 em Varginha, Minas Gerais envolvendo supostos avistamentos e captura de entidades anômalas por militares brasileiros e bombeiros. Três jovens mulheres relataram um encontro imediato com uma criatura não-humana em 20 de janeiro. Múltiplas testemunhas incluindo militares relataram avistamentos subsequentes. A Escola de Sargentos das Armas (ESA) do Exército Brasileiro esteve supostamente envolvida em operações de contenção. O caso permanece como um dos incidentes UAP mais debatidos na história latino-americana.',
    analysis_en: 'Extensive witness testimony from military and civilian sources. Physical evidence claims remain contested. Brazilian government has neither confirmed nor fully denied the events.',
    analysis_pt: 'Extenso testemunho de fontes militares e civis. Alegações de evidências físicas permanecem contestadas. O governo brasileiro não confirmou nem negou totalmente os eventos.',
    tags: ['fab', 'varginha', '1996', 'close-encounter', 'entity-recovery', 'military'],
    official_id_prefix: 'FAB-VG',
  },
  {
    country: 'BR',
    source_program: 'OPERACAO_PRATO',
    agency: 'FAB',
    incident_year: 1958,
    incident_date: '16 JAN 1958',
    location_name: 'Ilha da Trindade, Atlântico Sul',
    location_region: 'Espírito Santo, Brasil',
    lat: -20.5067,
    lng: -29.3150,
    media_type: 'image',
    classification: 'unresolved',
    title_en: 'Trindade Island Photographs — Navy UFO Documentation',
    title_pt: 'Fotografias da Ilha da Trindade — Documentação OVNI da Marinha',
    summary_en: 'On January 16, 1958, photographer Almiro Baraúna captured a series of photographs showing a Saturn-shaped object maneuvering over Ilha da Trindade (Trindade Island) in the South Atlantic while aboard the Brazilian Navy vessel Almirante Saldanha. The photographs were witnessed by approximately 48 crew members and were analyzed by the Brazilian Navy\'s photographic laboratory, which concluded they had not been tampered with. President Juscelino Kubitschek authorized the public release of the images.',
    summary_pt: 'Em 16 de janeiro de 1958, o fotógrafo Almiro Baraúna capturou uma série de fotografias mostrando um objeto em forma de Saturno manobrand sobre a Ilha da Trindade no Atlântico Sul, enquanto estava a bordo do navio da Marinha Brasileira Almirante Saldanha. As fotografias foram testemunhadas por aproximadamente 48 tripulantes e foram analisadas pelo laboratório fotográfico da Marinha Brasileira, que concluiu que não haviam sido adulteradas. O Presidente Juscelino Kubitschek autorizou a divulgação pública das imagens.',
    analysis_en: 'Photographic evidence authenticated by Brazilian Navy laboratory. Multiple military witnesses aboard a naval vessel. One of the best-documented photographic UAP cases of the 1950s.',
    analysis_pt: 'Evidência fotográfica autenticada pelo laboratório da Marinha Brasileira. Múltiplas testemunhas militares a bordo de um navio naval. Um dos casos fotográficos de UAP mais bem documentados da década de 1950.',
    tags: ['fab', 'trindade', '1958', 'photographic-evidence', 'navy', 'authenticated'],
    official_id_prefix: 'FAB-TR',
  },
  {
    country: 'BR',
    source_program: 'SIOANI',
    agency: 'FAB',
    incident_year: 1969,
    incident_date: '1969',
    location_name: 'Multiple Locations, Brazil',
    location_region: 'Brasil',
    lat: -15.7801,
    lng: -47.9292,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'SIOANI/Operation Saucer — Systematic UFO Investigation System',
    title_pt: 'SIOANI/Operação Pires — Sistema de Investigação Sistemática de OVNIs',
    summary_en: 'The Sistema de Investigação de Objetos Aéreos Não Identificados (SIOANI) was established in 1969 by the Brazilian Air Force as a systematic program to collect, analyze, and catalog reports of unidentified aerial objects across Brazil. Operating from the IV COMAR (Fourth Regional Air Command) in São Paulo, SIOANI standardized reporting procedures and conducted field investigations. The program compiled hundreds of reports before being officially discontinued, though its files were later incorporated into subsequent FAB investigations.',
    summary_pt: 'O Sistema de Investigação de Objetos Aéreos Não Identificados (SIOANI) foi estabelecido em 1969 pela Força Aérea Brasileira como um programa sistemático para coletar, analisar e catalogar relatos de objetos aéreos não identificados em todo o Brasil. Operando a partir do IV COMAR (Quarto Comando Aéreo Regional) em São Paulo, o SIOANI padronizou procedimentos de relato e conduziu investigações de campo. O programa compilou centenas de relatos antes de ser oficialmente descontinuado, embora seus arquivos tenham sido posteriormente incorporados a investigações subsequentes da FAB.',
    analysis_en: 'First formal institutional framework for UAP investigation in Brazil. Established standardized data collection protocols that influenced later programs.',
    analysis_pt: 'Primeiro marco institucional formal para investigação de UAP no Brasil. Estabeleceu protocolos padronizados de coleta de dados que influenciaram programas posteriores.',
    tags: ['fab', 'sioani', '1969', 'systematic-investigation', 'institutional'],
    official_id_prefix: 'FAB-SI',
  },

  // ─── FRANCE ───────────────────────────────────────────────────────────────
  {
    country: 'FR',
    source_program: 'GEIPAN',
    agency: 'GEIPAN',
    incident_year: 1981,
    incident_date: '08 JAN 1981',
    location_name: 'Trans-en-Provence, Var',
    location_region: 'Provence-Alpes-Côte d\'Azur, France',
    lat: 43.5081,
    lng: 6.1258,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Trans-en-Provence Physical Trace Case — GEPAN Investigation',
    title_pt: 'Caso Trans-en-Provence — Vestígios Físicos Investigados pelo GEPAN',
    summary_en: 'On January 8, 1981, farmer Renato Nicolaï observed a disc-shaped object land briefly on his property near Trans-en-Provence. GEPAN (predecessor to GEIPAN) conducted a thorough scientific investigation, collecting soil and vegetation samples from the landing site. Laboratory analysis by INRA (French National Institute for Agricultural Research) revealed biochemical changes in the vegetation, including chlorophyll degradation and structural alterations consistent with exposure to an intense electromagnetic field or radiation. The investigation was led by Jean-Jacques Velasco.',
    summary_pt: 'Em 8 de janeiro de 1981, o agricultor Renato Nicolaï observou um objeto em forma de disco pousar brevemente em sua propriedade perto de Trans-en-Provence. O GEPAN (predecessor do GEIPAN) conduziu uma investigação científica completa, coletando amostras de solo e vegetação do local de pouso. A análise laboratorial pelo INRA (Instituto Nacional Francês de Pesquisa Agronômica) revelou alterações bioquímicas na vegetação, incluindo degradação de clorofila e alterações estruturais consistentes com exposição a um campo eletromagnético intenso ou radiação. A investigação foi liderada por Jean-Jacques Velasco.',
    analysis_en: 'Considered one of the most scientifically rigorous UAP investigations ever conducted. The INRA laboratory analysis of physical traces remains unique in the field.',
    analysis_pt: 'Considerado uma das investigações de UAP mais cientificamente rigorosas já realizadas. A análise laboratorial de vestígios físicos do INRA permanece única no campo.',
    tags: ['geipan', 'trans-en-provence', '1981', 'physical-traces', 'scientific-analysis', 'landing'],
    official_id_prefix: 'GEIPAN-TEP',
  },
  {
    country: 'FR',
    source_program: 'GEIPAN',
    agency: 'GEIPAN',
    incident_year: 1965,
    incident_date: '01 JUL 1965',
    location_name: 'Valensole, Alpes-de-Haute-Provence',
    location_region: 'Provence-Alpes-Côte d\'Azur, France',
    lat: 43.8369,
    lng: 5.9833,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Valensole Close Encounter — Lavender Field Landing',
    title_pt: 'Encontro Imediato de Valensole — Pouso no Campo de Lavanda',
    summary_en: 'On July 1, 1965, farmer Maurice Masse encountered a landed egg-shaped craft and two small humanoid entities in his lavender field near Valensole. Masse reported being paralyzed by a device pointed at him by one of the entities. Physical traces were found at the landing site, including compacted soil and damaged lavender plants. Lavender refused to grow at the exact landing spot for years afterward. The case was investigated by French gendarmerie and later reviewed by GEPAN/GEIPAN.',
    summary_pt: 'Em 1º de julho de 1965, o agricultor Maurice Masse encontrou uma nave em forma de ovo pousada e duas pequenas entidades humanoides em seu campo de lavanda perto de Valensole. Masse relatou ter sido paralisado por um dispositivo apontado para ele por uma das entidades. Vestígios físicos foram encontrados no local de pouso, incluindo solo compactado e plantas de lavanda danificadas. A lavanda recusou-se a crescer no ponto exato do pouso por anos depois. O caso foi investigado pela gendarmerie francesa e posteriormente revisado pelo GEPAN/GEIPAN.',
    analysis_en: 'Classic close encounter case with physical trace evidence and long-term environmental effects at the landing site. Masse was considered a highly credible witness by investigators.',
    analysis_pt: 'Caso clássico de encontro imediato com evidências de vestígios físicos e efeitos ambientais de longo prazo no local de pouso. Masse foi considerado uma testemunha altamente credível pelos investigadores.',
    tags: ['geipan', 'valensole', '1965', 'close-encounter', 'physical-traces', 'entity'],
    official_id_prefix: 'GEIPAN-VAL',
  },
  {
    country: 'FR',
    source_program: 'GEIPAN',
    agency: 'GEIPAN',
    incident_year: 1990,
    incident_date: '05 NOV 1990',
    location_name: 'Multiple Regions, France',
    location_region: 'France',
    lat: 46.6034,
    lng: 1.8883,
    media_type: 'document',
    classification: 'resolved_natural',
    title_en: 'November 5, 1990 France-Wide Wave — Belgian Wave Observations from France',
    title_pt: 'Onda de 5 de Novembro de 1990 — Observações da Onda Belga a Partir da França',
    summary_en: 'On November 5, 1990, thousands of witnesses across France reported luminous formations moving silently across the sky, coinciding with the broader Belgian UFO wave. GEIPAN received hundreds of reports describing triangular formations of lights. While many sightings were later attributed to the re-entry of a Russian Proton rocket booster, a subset of reports described structured craft with characteristics inconsistent with space debris re-entry, including hovering, sharp directional changes, and low-altitude passes.',
    summary_pt: 'Em 5 de novembro de 1990, milhares de testemunhas em toda a França relataram formações luminosas movendo-se silenciosamente pelo céu, coincidindo com a mais ampla onda belga de OVNIs. O GEIPAN recebeu centenas de relatos descrevendo formações triangulares de luzes. Embora muitos avistamentos tenham sido posteriormente atribuídos à reentrada de um propulsor de foguete russo Proton, um subconjunto de relatos descreveu naves estruturadas com características inconsistentes com reentrada de detritos espaciais, incluindo pairar, mudanças bruscas de direção e passagens em baixa altitude.',
    analysis_en: 'Mass sighting event with mixed explanations. Demonstrates the complexity of separating prosaic explanations from genuinely anomalous reports during wave events.',
    analysis_pt: 'Evento de avistamento em massa com explicações mistas. Demonstra a complexidade de separar explicações prosaicas de relatos genuinamente anômalos durante eventos em onda.',
    tags: ['geipan', 'belgian-wave', '1990', 'mass-sighting', 'triangular', 'wave-event'],
    official_id_prefix: 'GEIPAN-BW',
  },

  // ─── UNITED KINGDOM ──────────────────────────────────────────────────────
  {
    country: 'GB',
    source_program: 'MOD_FOI',
    agency: 'MOD',
    incident_year: 1980,
    incident_date: '26 DEC 1980',
    location_name: 'Rendlesham Forest, Suffolk',
    location_region: 'Suffolk, England',
    lat: 52.0833,
    lng: 1.4333,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Rendlesham Forest Incident — NATO Base Encounter (RAF Woodbridge/Bentwaters)',
    title_pt: 'Incidente da Floresta de Rendlesham — Encontro na Base da OTAN (RAF Woodbridge/Bentwaters)',
    summary_en: 'Series of unexplained sightings reported by US Air Force personnel stationed at RAF Woodbridge near Rendlesham Forest, Suffolk, over several nights in late December 1980. Deputy Base Commander Lt. Colonel Charles Halt led a team into the forest and documented anomalous lights and a triangular craft on the ground. Halt recorded a contemporaneous audio tape. Radiation readings at the landing site registered significantly above background levels. The incident involved multiple trained military observers over consecutive nights and is documented in Halt\'s official memorandum to the MOD.',
    summary_pt: 'Série de avistamentos inexplicáveis relatados por pessoal da Força Aérea dos EUA estacionado na RAF Woodbridge, perto da Floresta de Rendlesham, Suffolk, durante várias noites no final de dezembro de 1980. O Vice-Comandante da Base, Tenente-Coronel Charles Halt, liderou uma equipe na floresta e documentou luzes anômalas e uma nave triangular no solo. Halt gravou uma fita de áudio contemporânea. Leituras de radiação no local de pouso registraram valores significativamente acima dos níveis de fundo. O incidente envolveu múltiplos observadores militares treinados durante noites consecutivas e está documentado no memorando oficial de Halt ao MOD.',
    analysis_en: 'Often called "Britain\'s Roswell." Multiple military witnesses, physical trace evidence, radiation readings, and official documentation make this one of the most compelling UAP cases in history.',
    analysis_pt: 'Frequentemente chamado de "Roswell Britânico." Múltiplas testemunhas militares, evidências de vestígios físicos, leituras de radiação e documentação oficial tornam este um dos casos UAP mais convincentes da história.',
    tags: ['mod', 'rendlesham', '1980', 'nato', 'physical-traces', 'radiation', 'military-witnesses'],
    official_id_prefix: 'MOD-RF',
  },
  {
    country: 'GB',
    source_program: 'MOD_FOI',
    agency: 'MOD',
    incident_year: 1993,
    incident_date: '31 MAR 1993',
    location_name: 'Cosford, West Midlands',
    location_region: 'West Midlands, England',
    lat: 52.6400,
    lng: -2.3056,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Cosford Incident — Multiple Base Sightings Across Central England',
    title_pt: 'Incidente de Cosford — Avistamentos em Múltiplas Bases na Inglaterra Central',
    summary_en: 'On March 30-31, 1993, a wave of UAP sightings was reported across central England, including observations by military personnel at RAF Cosford and RAF Shawbury. The meteorological officer at RAF Shawbury described a large triangular craft that directed a beam of light onto the ground and moved slowly before accelerating away at extraordinary speed. Nick Pope, then manning the MOD\'s UFO desk, investigated the case and described it as one of the most significant in MOD files.',
    summary_pt: 'Em 30-31 de março de 1993, uma onda de avistamentos de UAP foi relatada em toda a Inglaterra central, incluindo observações por pessoal militar na RAF Cosford e RAF Shawbury. O oficial meteorologista da RAF Shawbury descreveu uma grande nave triangular que direcionou um feixe de luz ao solo e se moveu lentamente antes de acelerar a uma velocidade extraordinária. Nick Pope, então responsável pela mesa de OVNIs do MOD, investigou o caso e o descreveu como um dos mais significativos nos arquivos do MOD.',
    analysis_en: 'Multiple trained military observers across different bases reported consistent descriptions. The meteorological officer\'s testimony was particularly detailed and considered highly credible.',
    analysis_pt: 'Múltiplos observadores militares treinados em diferentes bases relataram descrições consistentes. O testemunho do oficial meteorologista foi particularmente detalhado e considerado altamente credível.',
    tags: ['mod', 'cosford', '1993', 'triangular', 'military-witnesses', 'wave-event'],
    official_id_prefix: 'MOD-CF',
  },
  {
    country: 'GB',
    source_program: 'PROJECT_CONDIGN',
    agency: 'MOD',
    incident_year: 2000,
    incident_date: '2000',
    location_name: 'London, United Kingdom',
    location_region: 'England',
    lat: 51.5074,
    lng: -0.1278,
    media_type: 'pdf',
    classification: 'unknown',
    title_en: 'Project Condign — Classified MOD UAP Study (Unidentified Aerial Phenomena in the UK Air Defence Region)',
    title_pt: 'Projeto Condign — Estudo Classificado do MOD sobre UAP (Fenômenos Aéreos Não Identificados na Região de Defesa Aérea do Reino Unido)',
    summary_en: 'Project Condign was a secret MOD study completed in 2000, examining unidentified aerial phenomena reports in the UK from 1959 to 1997. The 460-page report concluded that UAP do exist as physical phenomena but attributed them to atmospheric plasma formations ("buoyant plasma formations"). The study recommended that UAP be investigated for potential military applications. Declassified in 2006 under Freedom of Information, the report acknowledged that some UAP exhibited characteristics beyond current scientific understanding.',
    summary_pt: 'O Projeto Condign foi um estudo secreto do MOD concluído em 2000, examinando relatos de fenômenos aéreos não identificados no Reino Unido de 1959 a 1997. O relatório de 460 páginas concluiu que UAP existem como fenômenos físicos mas os atribuiu a formações de plasma atmosférico ("formações de plasma flutuantes"). O estudo recomendou que UAP fossem investigados para potenciais aplicações militares. Desclassificado em 2006 sob a Lei de Liberdade de Informação, o relatório reconheceu que alguns UAP exibiram características além do entendimento científico atual.',
    analysis_en: 'The most comprehensive official UK government study on UAP. Despite attributing phenomena to plasma, the report acknowledged genuinely anomalous characteristics in some cases.',
    analysis_pt: 'O estudo oficial mais abrangente do governo do Reino Unido sobre UAP. Apesar de atribuir fenômenos ao plasma, o relatório reconheceu características genuinamente anômalas em alguns casos.',
    tags: ['mod', 'project-condign', '2000', 'classified-study', 'declassified', 'systematic'],
    official_id_prefix: 'MOD-PC',
  },

  // ─── CHILE ────────────────────────────────────────────────────────────────
  {
    country: 'CL',
    source_program: 'CEFAA',
    agency: 'CEFAA',
    incident_year: 2014,
    incident_date: '11 NOV 2014',
    location_name: 'Off Coast of Santiago, Chile',
    location_region: 'Región Metropolitana, Chile',
    lat: -33.4489,
    lng: -71.6627,
    media_type: 'video',
    classification: 'unresolved',
    title_en: 'Chilean Navy Helicopter FLIR Video — Unidentified Aerial Object',
    title_pt: 'Vídeo FLIR do Helicóptero da Marinha Chilena — Objeto Aéreo Não Identificado',
    summary_en: 'On November 11, 2014, a Chilean Navy helicopter equipped with a Wescam MX-15 HD Forward Looking Infrared (FLIR) camera captured approximately 9 minutes of footage of an unidentified aerial object during a routine coastal patrol. The object appeared to discharge a trail of hot material twice during the observation. CEFAA investigated the case for over two years, consulting nuclear chemists, astrophysicists, image analysts, and aeronautics experts. No conventional explanation was found and the case was classified as unresolved.',
    summary_pt: 'Em 11 de novembro de 2014, um helicóptero da Marinha Chilena equipado com uma câmera FLIR (Infravermelho de Visão Frontal) Wescam MX-15 HD capturou aproximadamente 9 minutos de filmagem de um objeto aéreo não identificado durante uma patrulha costeira de rotina. O objeto aparentemente descarregou uma trilha de material quente duas vezes durante a observação. O CEFAA investigou o caso por mais de dois anos, consultando químicos nucleares, astrofísicos, analistas de imagem e especialistas em aeronáutica. Nenhuma explicação convencional foi encontrada e o caso foi classificado como não resolvido.',
    analysis_en: 'Military-grade FLIR footage analyzed by multidisciplinary scientific panel over two-year investigation. One of the most thoroughly vetted military UAP videos released by any government.',
    analysis_pt: 'Filmagem FLIR de grau militar analisada por painel científico multidisciplinar ao longo de dois anos de investigação. Um dos vídeos militares de UAP mais rigorosamente avaliados divulgados por qualquer governo.',
    tags: ['cefaa', 'chilean-navy', '2014', 'flir', 'video-evidence', 'military'],
    official_id_prefix: 'CEFAA-NV',
  },
  {
    country: 'CL',
    source_program: 'CEFAA',
    agency: 'CEFAA',
    incident_year: 2012,
    incident_date: '05 APR 2012',
    location_name: 'El Bosque Air Base, Santiago',
    location_region: 'Región Metropolitana, Chile',
    lat: -33.5617,
    lng: -70.6844,
    media_type: 'video',
    classification: 'unresolved',
    title_en: 'El Bosque Air Base UAP — Air Show Flyby Captured on Multiple Cameras',
    title_pt: 'UAP na Base Aérea El Bosque — Passagem Capturada por Múltiplas Câmeras Durante Show Aéreo',
    summary_en: 'During an air show at El Bosque Air Base on April 5, 2012, a small, fast-moving metallic object was captured on video by multiple attendees as it flew past performing aircraft at high speed. The object was not visible to the naked eye and was only discovered upon review of the footage. CEFAA analyzed the videos and concluded the object was a genuine unknown, moving at speeds estimated between 4,000 and 6,000 mph with no visible means of propulsion.',
    summary_pt: 'Durante um show aéreo na Base Aérea El Bosque em 5 de abril de 2012, um pequeno objeto metálico de movimento rápido foi capturado em vídeo por múltiplos presentes enquanto passava por aeronaves em performance em alta velocidade. O objeto não era visível a olho nu e foi descoberto apenas na revisão das filmagens. O CEFAA analisou os vídeos e concluiu que o objeto era um genuíno desconhecido, movendo-se a velocidades estimadas entre 6.400 e 9.600 km/h sem meios visíveis de propulsão.',
    analysis_en: 'Multiple independent video sources captured the same object, enabling triangulation analysis. Speed estimates far exceed conventional aircraft capabilities.',
    analysis_pt: 'Múltiplas fontes de vídeo independentes capturaram o mesmo objeto, permitindo análise de triangulação. Estimativas de velocidade excedem em muito as capacidades de aeronaves convencionais.',
    tags: ['cefaa', 'el-bosque', '2012', 'air-show', 'high-speed', 'multiple-cameras'],
    official_id_prefix: 'CEFAA-EB',
  },

  // ─── CANADA ───────────────────────────────────────────────────────────────
  {
    country: 'CA',
    source_program: 'DND_INVESTIGATION',
    agency: 'DND',
    incident_year: 1967,
    incident_date: '04 OCT 1967',
    location_name: 'Shag Harbour, Nova Scotia',
    location_region: 'Nova Scotia, Canada',
    lat: 43.4600,
    lng: -65.7200,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Shag Harbour Incident — Underwater UAP Recovery Operation',
    title_pt: 'Incidente de Shag Harbour — Operação de Recuperação de UAP Subaquático',
    summary_en: 'On October 4, 1967, multiple witnesses including RCMP officers observed a large illuminated object descend and crash into the waters of Shag Harbour, Nova Scotia. A yellow foam was observed on the water surface. Canadian Coast Guard, RCMP, and military divers conducted a search operation but no wreckage or conventional explanation was found. The incident was classified as a UFO by the Canadian government in official documents — one of the few cases where a government used the term officially. Reports suggest a subsequent underwater search operation involving the Canadian Navy and possibly US naval assets.',
    summary_pt: 'Em 4 de outubro de 1967, múltiplas testemunhas incluindo oficiais da RCMP observaram um grande objeto iluminado descer e colidir com as águas de Shag Harbour, Nova Escócia. Uma espuma amarela foi observada na superfície da água. Guarda Costeira Canadense, RCMP e mergulhadores militares conduziram uma operação de busca mas nenhum destroço ou explicação convencional foi encontrado. O incidente foi classificado como OVNI pelo governo canadense em documentos oficiais — um dos poucos casos em que um governo usou o termo oficialmente. Relatos sugerem uma operação subsequente de busca subaquática envolvendo a Marinha Canadense e possivelmente ativos navais dos EUA.',
    analysis_en: 'One of the best-documented UAP water entry cases. Official government classification as "UFO" is rare. Multiple law enforcement witnesses and military involvement add significant credibility.',
    analysis_pt: 'Um dos casos de entrada de UAP na água mais bem documentados. Classificação governamental oficial como "OVNI" é rara. Múltiplas testemunhas das forças policiais e envolvimento militar adicionam credibilidade significativa.',
    tags: ['dnd', 'shag-harbour', '1967', 'underwater', 'ufo-crash', 'rcmp', 'military'],
    official_id_prefix: 'DND-SH',
  },
  {
    country: 'CA',
    source_program: 'DND_INVESTIGATION',
    agency: 'DND',
    incident_year: 1967,
    incident_date: '20 MAY 1967',
    location_name: 'Falcon Lake, Manitoba',
    location_region: 'Manitoba, Canada',
    lat: 49.6833,
    lng: -95.2500,
    media_type: 'mixed',
    classification: 'unresolved',
    title_en: 'Falcon Lake Incident — Physical Injury from UAP Encounter',
    title_pt: 'Incidente de Falcon Lake — Lesão Física em Encontro com UAP',
    summary_en: 'On May 20, 1967, Stefan Michalak encountered two disc-shaped objects near Falcon Lake, Manitoba while prospecting for quartz. One landed nearby and Michalak approached it, observing an open hatch emitting warm air and hearing voices inside. When the hatch closed, he touched the craft and his glove melted. A grid-like exhaust vent blasted hot gas onto his chest, leaving a distinctive grid-pattern burn. He suffered radiation sickness symptoms including nausea, diarrhea, and weight loss for weeks. The burn pattern on his chest was documented by physicians and remains one of the most compelling physical evidence cases in UAP history.',
    summary_pt: 'Em 20 de maio de 1967, Stefan Michalak encontrou dois objetos em forma de disco perto de Falcon Lake, Manitoba, enquanto procurava quartzo. Um pousou próximo e Michalak se aproximou, observando uma escotilha aberta emitindo ar quente e ouvindo vozes dentro. Quando a escotilha fechou, ele tocou a nave e sua luva derreteu. Uma saída de exaustão em forma de grade soprou gás quente em seu peito, deixando uma queimadura distinta em padrão de grade. Ele sofreu sintomas de doença por radiação incluindo náusea, diarreia e perda de peso por semanas. O padrão de queimadura em seu peito foi documentado por médicos e permanece como uma das evidências físicas mais convincentes na história de UAP.',
    analysis_en: 'Extensively investigated by RCMP, Canadian military, and US authorities. Physical burns medically documented. Soil samples from the site showed elevated radiation. The case file spans over 300 pages of official documentation.',
    analysis_pt: 'Extensivamente investigado pela RCMP, militares canadenses e autoridades americanas. Queimaduras físicas documentadas medicamente. Amostras de solo do local mostraram radiação elevada. O arquivo do caso abrange mais de 300 páginas de documentação oficial.',
    tags: ['dnd', 'falcon-lake', '1967', 'physical-injury', 'radiation', 'burn-marks', 'close-encounter'],
    official_id_prefix: 'DND-FL',
  },

  // ─── ADDITIONAL BRAZIL ANCHORS ────────────────────────────────────────────
  {
    country: 'BR',
    source_program: 'OPERACAO_PRATO',
    agency: 'FAB',
    incident_year: 2008,
    incident_date: '20 AUG 2008',
    location_name: 'Brasília, Distrito Federal',
    location_region: 'Distrito Federal, Brasil',
    lat: -15.7801,
    lng: -47.9292,
    media_type: 'document',
    classification: 'unknown',
    title_en: 'Brazilian Government UFO Hearing — Congressional Testimonies',
    title_pt: 'Audiência OVNI do Governo Brasileiro — Depoimentos Congressionais',
    summary_en: 'In August 2008, the Brazilian government held landmark hearings on unidentified aerial phenomena, with testimony from military officers involved in historical cases including Operation Saucer and the 1986 Official UFO Night. The Brazilian Committee of Ufologists (CBU) presented documented cases from FAB archives. These hearings led to significant document releases and increased transparency in Brazil\'s approach to the UAP phenomenon.',
    summary_pt: 'Em agosto de 2008, o governo brasileiro realizou audiências históricas sobre fenômenos aéreos não identificados, com depoimentos de oficiais militares envolvidos em casos históricos incluindo a Operação Prato e a Noite Oficial dos OVNIs de 1986. O Comitê Brasileiro de Ufólogos (CBU) apresentou casos documentados dos arquivos da FAB. Essas audiências levaram a significativas liberações de documentos e maior transparência na abordagem brasileira ao fenômeno UAP.',
    analysis_en: 'Historic milestone in government transparency on UAP. Official military testimony before congress confirmed multiple previously classified cases.',
    analysis_pt: 'Marco histórico na transparência governamental sobre UAP. Testemunho militar oficial perante o congresso confirmou múltiplos casos anteriormente classificados.',
    tags: ['fab', 'hearing', '2008', 'congressional', 'transparency', 'declassification'],
    official_id_prefix: 'FAB-CH',
  },

  // ─── ADDITIONAL UK ANCHORS ────────────────────────────────────────────────
  {
    country: 'GB',
    source_program: 'MOD_FOI',
    agency: 'MOD',
    incident_year: 1956,
    incident_date: '13 AUG 1956',
    location_name: 'RAF Lakenheath-Bentwaters, Suffolk',
    location_region: 'Suffolk, England',
    lat: 52.4093,
    lng: 0.5610,
    media_type: 'document',
    classification: 'unresolved',
    title_en: 'Lakenheath-Bentwaters Radar-Visual Case — RAF/USAF Joint Encounter',
    title_pt: 'Caso Radar-Visual de Lakenheath-Bentwaters — Encontro Conjunto RAF/USAF',
    summary_en: 'On August 13-14, 1956, multiple radar stations and visual observers at RAF Bentwaters and RAF Lakenheath tracked unidentified objects performing extraordinary maneuvers. A RAF Venom night fighter was scrambled and obtained radar lock on the target, which then maneuvered behind the fighter in a tactically advantageous position. Ground radar confirmed the object\'s position behind the fighter. The Condon Committee later called this "the most puzzling and unusual case in the radar-visual files."',
    summary_pt: 'Em 13-14 de agosto de 1956, múltiplas estações de radar e observadores visuais na RAF Bentwaters e RAF Lakenheath rastrearam objetos não identificados realizando manobras extraordinárias. Um caça noturno RAF Venom foi decolado e obteve travamento de radar no alvo, que então manobrou para trás do caça em uma posição taticamente vantajosa. O radar terrestre confirmou a posição do objeto atrás do caça. O Comitê Condon posteriormente chamou este "o caso mais intrigante e incomum nos arquivos radar-visuais."',
    analysis_en: 'Multiple independent radar systems confirmed observations. Tactical maneuvering against a military fighter suggests intelligent control. Endorsed as genuinely anomalous by the Condon Committee.',
    analysis_pt: 'Múltiplos sistemas de radar independentes confirmaram observações. Manobras táticas contra um caça militar sugerem controle inteligente. Endossado como genuinamente anômalo pelo Comitê Condon.',
    tags: ['mod', 'lakenheath', '1956', 'radar-visual', 'fighter-intercept', 'condon-committee'],
    official_id_prefix: 'MOD-LB',
  },

  // ─── ADDITIONAL FRANCE ANCHORS ────────────────────────────────────────────
  {
    country: 'FR',
    source_program: 'COMETA',
    agency: 'GEIPAN',
    incident_year: 1999,
    incident_date: '1999',
    location_name: 'Paris, France',
    location_region: 'Île-de-France, France',
    lat: 48.8566,
    lng: 2.3522,
    media_type: 'pdf',
    classification: 'unknown',
    title_en: 'COMETA Report — French Generals and Scientists Assess the UFO Phenomenon',
    title_pt: 'Relatório COMETA — Generais e Cientistas Franceses Avaliam o Fenômeno OVNI',
    summary_en: 'The COMETA Report, published in 1999, was an independent study by a group of retired French generals, admirals, scientists, and engineers examining the UFO phenomenon. Chaired by General Denis Letty, the committee concluded that approximately 5% of UAP cases remained genuinely unexplained and that the extraterrestrial hypothesis deserved serious consideration. The report was presented to French President Jacques Chirac and Prime Minister Lionel Jospin. It remains one of the most authoritative assessments of the UAP phenomenon by high-ranking military and scientific officials.',
    summary_pt: 'O Relatório COMETA, publicado em 1999, foi um estudo independente por um grupo de generais aposentados, almirantes, cientistas e engenheiros franceses examinando o fenômeno OVNI. Presidido pelo General Denis Letty, o comitê concluiu que aproximadamente 5% dos casos UAP permaneciam genuinamente inexplicáveis e que a hipótese extraterrestre merecia consideração séria. O relatório foi apresentado ao Presidente Francês Jacques Chirac e ao Primeiro Ministro Lionel Jospin. Permanece como uma das avaliações mais autoritárias do fenômeno UAP por oficiais militares e científicos de alto escalão.',
    analysis_en: 'Landmark document in UAP research. Authored by high-ranking military and scientific officials with security clearances. Recommended increased transparency and international cooperation.',
    analysis_pt: 'Documento marcante na pesquisa de UAP. Redigido por oficiais militares e científicos de alto escalão com autorizações de segurança. Recomendou maior transparência e cooperação internacional.',
    tags: ['geipan', 'cometa', '1999', 'official-report', 'military-assessment', 'scientific'],
    official_id_prefix: 'GEIPAN-COM',
  },

  // ─── ADDITIONAL CHILE ANCHORS ─────────────────────────────────────────────
  {
    country: 'CL',
    source_program: 'CEFAA',
    agency: 'CEFAA',
    incident_year: 2010,
    incident_date: '2010',
    location_name: 'Santiago, Chile',
    location_region: 'Región Metropolitana, Chile',
    lat: -33.4489,
    lng: -70.6693,
    media_type: 'document',
    classification: 'unknown',
    title_en: 'CEFAA Institutional Report — Chile\'s Official UAP Investigation Framework',
    title_pt: 'Relatório Institucional CEFAA — Marco Oficial de Investigação UAP do Chile',
    summary_en: 'Report documenting the establishment and operations of CEFAA (Committee for the Study of Anomalous Aerial Phenomena), Chile\'s official government body for UAP investigation under the DGAC (Directorate General of Civil Aeronautics). CEFAA operates with a scientific advisory panel that includes physicists, astronomers, meteorologists, and aerospace engineers. The committee maintains protocols for pilot and air traffic controller reporting and has investigated hundreds of cases since its establishment.',
    summary_pt: 'Relatório documentando o estabelecimento e operações do CEFAA (Comitê de Estudos de Fenômenos Aéreos Anômalos), o órgão oficial do governo chileno para investigação de UAP sob a DGAC (Direção Geral de Aeronáutica Civil). O CEFAA opera com um painel consultivo científico que inclui físicos, astrônomos, meteorologistas e engenheiros aeroespaciais. O comitê mantém protocolos para relatos de pilotos e controladores de tráfego aéreo e investigou centenas de casos desde sua criação.',
    analysis_en: 'Chile maintains one of the most transparent and scientifically rigorous governmental UAP investigation programs in the world.',
    analysis_pt: 'O Chile mantém um dos programas governamentais de investigação de UAP mais transparentes e cientificamente rigorosos do mundo.',
    tags: ['cefaa', 'institutional', '2010', 'framework', 'scientific-panel', 'aviation-safety'],
    official_id_prefix: 'CEFAA-IR',
  },

  // ─── ADDITIONAL CANADA ANCHORS ────────────────────────────────────────────
  {
    country: 'CA',
    source_program: 'DND_INVESTIGATION',
    agency: 'DND',
    incident_year: 1952,
    incident_date: '1952',
    location_name: 'Shirley Bay, Ontario',
    location_region: 'Ontario, Canada',
    lat: 45.3630,
    lng: -75.8830,
    media_type: 'document',
    classification: 'unknown',
    title_en: 'Project Magnet & Project Second Storey — Canadian Government UFO Programs',
    title_pt: 'Projeto Magnet e Projeto Second Storey — Programas Governamentais Canadenses sobre OVNIs',
    summary_en: 'Project Magnet (1950-1954) was established by Wilbert B. Smith under the Department of Transport to investigate UFOs and their potential propulsion systems, including magnetic theory. Smith set up a detection station at Shirley Bay near Ottawa. Project Second Storey (1952-1954) was a parallel classified committee under the Defence Research Board that reviewed UFO reports and coordinated with US authorities. Together, these programs represent Canada\'s early systematic approach to UAP investigation at the government level.',
    summary_pt: 'O Projeto Magnet (1950-1954) foi estabelecido por Wilbert B. Smith sob o Departamento de Transporte para investigar OVNIs e seus potenciais sistemas de propulsão, incluindo teoria magnética. Smith instalou uma estação de detecção em Shirley Bay, perto de Ottawa. O Projeto Second Storey (1952-1954) foi um comitê classificado paralelo sob o Conselho de Pesquisa de Defesa que revisava relatos de OVNIs e coordenava com autoridades dos EUA. Juntos, esses programas representam a abordagem sistemática inicial do Canadá à investigação de UAP em nível governamental.',
    analysis_en: 'Early Canadian government institutional frameworks for UAP research. Project Magnet uniquely explored potential propulsion physics based on UAP observations.',
    analysis_pt: 'Primeiros marcos institucionais do governo canadense para pesquisa de UAP. O Projeto Magnet explorou de forma única a potencial física de propulsão baseada em observações de UAP.',
    tags: ['dnd', 'project-magnet', '1952', 'project-second-storey', 'research-program', 'propulsion'],
    official_id_prefix: 'DND-PM',
  },
];


// ============================================================================
// PROCEDURAL GENERATION DATA
// ============================================================================

// ── BRAZIL LOCATIONS ────────────────────────────────────────────────────────
const brLocations = [
  { name: 'São Paulo, SP', region: 'São Paulo, Brasil', lat: -23.5505, lng: -46.6333 },
  { name: 'Rio de Janeiro, RJ', region: 'Rio de Janeiro, Brasil', lat: -22.9068, lng: -43.1729 },
  { name: 'Brasília, DF', region: 'Distrito Federal, Brasil', lat: -15.7801, lng: -47.9292 },
  { name: 'Belo Horizonte, MG', region: 'Minas Gerais, Brasil', lat: -19.9191, lng: -43.9386 },
  { name: 'Salvador, BA', region: 'Bahia, Brasil', lat: -12.9714, lng: -38.5124 },
  { name: 'Manaus, AM', region: 'Amazonas, Brasil', lat: -3.1190, lng: -60.0217 },
  { name: 'Recife, PE', region: 'Pernambuco, Brasil', lat: -8.0476, lng: -34.8770 },
  { name: 'Porto Alegre, RS', region: 'Rio Grande do Sul, Brasil', lat: -30.0346, lng: -51.2177 },
  { name: 'Curitiba, PR', region: 'Paraná, Brasil', lat: -25.4284, lng: -49.2733 },
  { name: 'Fortaleza, CE', region: 'Ceará, Brasil', lat: -3.7172, lng: -38.5433 },
  { name: 'Belém, PA', region: 'Pará, Brasil', lat: -1.4558, lng: -48.5024 },
  { name: 'Goiânia, GO', region: 'Goiás, Brasil', lat: -16.6799, lng: -49.2550 },
  { name: 'Campinas, SP', region: 'São Paulo, Brasil', lat: -22.9099, lng: -47.0626 },
  { name: 'São José dos Campos, SP', region: 'São Paulo, Brasil', lat: -23.2237, lng: -45.9009 },
  { name: 'Florianópolis, SC', region: 'Santa Catarina, Brasil', lat: -27.5954, lng: -48.5480 },
  { name: 'Natal, RN', region: 'Rio Grande do Norte, Brasil', lat: -5.7945, lng: -35.2110 },
  { name: 'Campo Grande, MS', region: 'Mato Grosso do Sul, Brasil', lat: -20.4697, lng: -54.6201 },
  { name: 'Petrópolis, RJ', region: 'Rio de Janeiro, Brasil', lat: -22.5112, lng: -43.1779 },
  { name: 'Ribeirão Preto, SP', region: 'São Paulo, Brasil', lat: -21.1704, lng: -47.8103 },
  { name: 'Itajubá, MG', region: 'Minas Gerais, Brasil', lat: -22.4256, lng: -45.4528 },
];

// ── FRANCE LOCATIONS ────────────────────────────────────────────────────────
const frLocations = [
  { name: 'Paris', region: 'Île-de-France, France', lat: 48.8566, lng: 2.3522 },
  { name: 'Lyon', region: 'Auvergne-Rhône-Alpes, France', lat: 45.7640, lng: 4.8357 },
  { name: 'Marseille', region: 'Provence-Alpes-Côte d\'Azur, France', lat: 43.2965, lng: 5.3698 },
  { name: 'Toulouse', region: 'Occitanie, France', lat: 43.6047, lng: 1.4442 },
  { name: 'Nice', region: 'Provence-Alpes-Côte d\'Azur, France', lat: 43.7102, lng: 7.2620 },
  { name: 'Bordeaux', region: 'Nouvelle-Aquitaine, France', lat: 44.8378, lng: -0.5792 },
  { name: 'Strasbourg', region: 'Grand Est, France', lat: 48.5734, lng: 7.7521 },
  { name: 'Nantes', region: 'Pays de la Loire, France', lat: 47.2184, lng: -1.5536 },
  { name: 'Rennes', region: 'Bretagne, France', lat: 48.1173, lng: -1.6778 },
  { name: 'Grenoble', region: 'Auvergne-Rhône-Alpes, France', lat: 45.1885, lng: 5.7245 },
  { name: 'Dijon', region: 'Bourgogne-Franche-Comté, France', lat: 47.3220, lng: 5.0415 },
  { name: 'Clermont-Ferrand', region: 'Auvergne-Rhône-Alpes, France', lat: 45.7772, lng: 3.0870 },
  { name: 'Montpellier', region: 'Occitanie, France', lat: 43.6108, lng: 3.8767 },
  { name: 'Lille', region: 'Hauts-de-France, France', lat: 50.6292, lng: 3.0573 },
  { name: 'Rouen', region: 'Normandie, France', lat: 49.4432, lng: 1.0999 },
];

// ── UK LOCATIONS ────────────────────────────────────────────────────────────
const gbLocations = [
  { name: 'London', region: 'England', lat: 51.5074, lng: -0.1278 },
  { name: 'Manchester', region: 'England', lat: 53.4808, lng: -2.2426 },
  { name: 'Birmingham', region: 'England', lat: 52.4862, lng: -1.8904 },
  { name: 'Edinburgh', region: 'Scotland', lat: 55.9533, lng: -3.1883 },
  { name: 'Glasgow', region: 'Scotland', lat: 55.8642, lng: -4.2518 },
  { name: 'Bristol', region: 'England', lat: 51.4545, lng: -2.5879 },
  { name: 'Cardiff', region: 'Wales', lat: 51.4816, lng: -3.1791 },
  { name: 'Liverpool', region: 'England', lat: 53.4084, lng: -2.9916 },
  { name: 'Leeds', region: 'England', lat: 53.8008, lng: -1.5491 },
  { name: 'Sheffield', region: 'England', lat: 53.3811, lng: -1.4701 },
  { name: 'Aberdeen', region: 'Scotland', lat: 57.1497, lng: -2.0943 },
  { name: 'Plymouth', region: 'England', lat: 50.3755, lng: -4.1427 },
  { name: 'Norwich', region: 'England', lat: 52.6309, lng: 1.2974 },
  { name: 'York', region: 'England', lat: 53.9591, lng: -1.0815 },
  { name: 'Warminster, Wiltshire', region: 'England', lat: 51.2047, lng: -2.1810 },
];

// ── CHILE LOCATIONS ─────────────────────────────────────────────────────────
const clLocations = [
  { name: 'Santiago', region: 'Región Metropolitana, Chile', lat: -33.4489, lng: -70.6693 },
  { name: 'Valparaíso', region: 'Valparaíso, Chile', lat: -33.0472, lng: -71.6127 },
  { name: 'Concepción', region: 'Biobío, Chile', lat: -36.8270, lng: -73.0503 },
  { name: 'Antofagasta', region: 'Antofagasta, Chile', lat: -23.6509, lng: -70.3975 },
  { name: 'Temuco', region: 'La Araucanía, Chile', lat: -38.7396, lng: -72.5984 },
  { name: 'Arica', region: 'Arica y Parinacota, Chile', lat: -18.4783, lng: -70.3126 },
  { name: 'Punta Arenas', region: 'Magallanes, Chile', lat: -53.1638, lng: -70.9171 },
  { name: 'La Serena', region: 'Coquimbo, Chile', lat: -29.9027, lng: -71.2520 },
  { name: 'Iquique', region: 'Tarapacá, Chile', lat: -20.2141, lng: -70.1524 },
  { name: 'Puerto Montt', region: 'Los Lagos, Chile', lat: -41.4693, lng: -72.9424 },
];

// ── CANADA LOCATIONS ────────────────────────────────────────────────────────
const caLocations = [
  { name: 'Ottawa, Ontario', region: 'Ontario, Canada', lat: 45.4215, lng: -75.6972 },
  { name: 'Toronto, Ontario', region: 'Ontario, Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Vancouver, British Columbia', region: 'British Columbia, Canada', lat: 49.2827, lng: -123.1207 },
  { name: 'Montreal, Quebec', region: 'Quebec, Canada', lat: 45.5017, lng: -73.5673 },
  { name: 'Calgary, Alberta', region: 'Alberta, Canada', lat: 51.0447, lng: -114.0719 },
  { name: 'Edmonton, Alberta', region: 'Alberta, Canada', lat: 53.5461, lng: -113.4938 },
  { name: 'Winnipeg, Manitoba', region: 'Manitoba, Canada', lat: 49.8951, lng: -97.1384 },
  { name: 'Halifax, Nova Scotia', region: 'Nova Scotia, Canada', lat: 44.6488, lng: -63.5752 },
  { name: 'Victoria, British Columbia', region: 'British Columbia, Canada', lat: 48.4284, lng: -123.3656 },
  { name: 'Saskatoon, Saskatchewan', region: 'Saskatchewan, Canada', lat: 52.1332, lng: -106.6700 },
  { name: 'St. John\'s, Newfoundland', region: 'Newfoundland and Labrador, Canada', lat: 47.5615, lng: -52.7126 },
  { name: 'Cold Lake, Alberta', region: 'Alberta, Canada', lat: 54.4642, lng: -110.1818 },
  { name: 'North Bay, Ontario', region: 'Ontario, Canada', lat: 46.3091, lng: -79.4608 },
];

// ── US LOCATIONS (additional ones NOT in pursue-data) ───────────────────────
const usLocations = [
  { name: 'Phoenix, Arizona', region: 'Arizona, USA', lat: 33.4484, lng: -112.0740 },
  { name: 'Area 51 vicinity, Nevada', region: 'Nevada, USA', lat: 37.2350, lng: -115.8111 },
  { name: 'Stephenville, Texas', region: 'Texas, USA', lat: 32.2207, lng: -98.2023 },
  { name: 'O\'Hare Airport, Chicago, Illinois', region: 'Illinois, USA', lat: 41.9742, lng: -87.9073 },
  { name: 'San Diego, California', region: 'California, USA', lat: 32.7157, lng: -117.1611 },
  { name: 'Langley AFB, Virginia', region: 'Virginia, USA', lat: 37.0833, lng: -76.3606 },
  { name: 'Kirtland AFB, New Mexico', region: 'New Mexico, USA', lat: 35.0488, lng: -106.5656 },
  { name: 'Malmstrom AFB, Montana', region: 'Montana, USA', lat: 47.5054, lng: -111.1830 },
  { name: 'Wright-Patterson AFB, Ohio', region: 'Ohio, USA', lat: 39.8261, lng: -84.0483 },
  { name: 'Minot AFB, North Dakota', region: 'North Dakota, USA', lat: 48.4159, lng: -101.3584 },
  { name: 'Jacksonville, Florida', region: 'Florida, USA', lat: 30.3322, lng: -81.6557 },
  { name: 'Norfolk, Virginia', region: 'Virginia, USA', lat: 36.8508, lng: -76.2859 },
  { name: 'Pacific Ocean, off San Diego', region: 'California, USA', lat: 32.0, lng: -118.5 },
  { name: 'Denver, Colorado', region: 'Colorado, USA', lat: 39.7392, lng: -104.9903 },
  { name: 'Seattle, Washington', region: 'Washington, USA', lat: 47.6062, lng: -122.3321 },
  { name: 'Las Vegas, Nevada', region: 'Nevada, USA', lat: 36.1699, lng: -115.1398 },
  { name: 'Eglin AFB, Florida', region: 'Florida, USA', lat: 30.4633, lng: -86.5258 },
  { name: 'Cape Canaveral, Florida', region: 'Florida, USA', lat: 28.3922, lng: -80.6077 },
  { name: 'Pensacola, Florida', region: 'Florida, USA', lat: 30.4213, lng: -87.2169 },
  { name: 'White Sands, New Mexico', region: 'New Mexico, USA', lat: 32.3833, lng: -106.4833 },
  { name: 'Nellis AFB, Nevada', region: 'Nevada, USA', lat: 36.2360, lng: -115.0341 },
  { name: 'Dayton, Ohio', region: 'Ohio, USA', lat: 39.7589, lng: -84.1916 },
  { name: 'Gulf of Mexico', region: 'Gulf Coast, USA', lat: 27.5, lng: -90.0 },
  { name: 'Pacific Northwest Coast', region: 'Pacific Northwest, USA', lat: 46.0, lng: -124.5 },
  { name: 'Chesapeake Bay, Virginia', region: 'Virginia, USA', lat: 37.0, lng: -76.1 },
];

// ── Template arrays for procedural generation ───────────────────────────────
const mediaTypes = ['video', 'pdf', 'image', 'document', 'mixed'];
const classifications = ['unresolved', 'resolved_natural', 'resolved_manmade', 'unknown'];

// Titles templates per country
const titleTemplates = {
  BR: {
    en: [
      '{agency} Declassified Report — Aerial Anomaly over {location}',
      'Unidentified Aerial Object Tracked Near {location}',
      '{agency} Investigation: Luminous Phenomenon at {location}',
      'FAB Radar Contact — Unknown Object Near {location}',
      'Anomalous Aerial Activity Report — {location} Region',
      'Pilot Encounter Report — Airspace Near {location}',
      '{agency} Case File: Unresolved Sighting at {location}',
      'Multiple Witness UAP Report — {location}',
      'Nocturnal Lights Over {location} — {agency} Documentation',
      'Close Range Observation — Unknown Craft Near {location}',
    ],
    pt: [
      '[{agency}] Relatório Desclassificado — Anomalia Aérea Sobre {location}',
      'Objeto Aéreo Não Identificado Rastreado Perto de {location}',
      '[{agency}] Investigação: Fenômeno Luminoso em {location}',
      'Contato Radar FAB — Objeto Desconhecido Perto de {location}',
      'Relatório de Atividade Aérea Anômala — Região de {location}',
      'Relatório de Encontro de Piloto — Espaço Aéreo Perto de {location}',
      '[{agency}] Arquivo de Caso: Avistamento Não Resolvido em {location}',
      'Relatório UAP com Múltiplas Testemunhas — {location}',
      'Luzes Noturnas Sobre {location} — Documentação {agency}',
      'Observação a Curta Distância — Nave Desconhecida Perto de {location}',
    ],
  },
  FR: {
    en: [
      'GEIPAN Case D: Unidentified Phenomenon at {location}',
      'French Air Force Radar Anomaly — {location} Sector',
      'GEIPAN Investigation: Luminous Object Over {location}',
      'Close Encounter Report — {location} Area',
      'GEIPAN Category D Case — {location} Observation',
      'Civil Aviation Pilot Report — UAP Near {location}',
      'Ground Trace Case — Physical Evidence Near {location}',
      'Multiple Radar Return — Unidentified Object at {location}',
      'GEIPAN Statistical Review — {location} Region Cluster',
      'Gendarmerie UAP Report — {location} Commune',
    ],
    pt: [
      'Caso D GEIPAN: Fenômeno Não Identificado em {location}',
      'Anomalia Radar da Força Aérea Francesa — Setor de {location}',
      'Investigação GEIPAN: Objeto Luminoso Sobre {location}',
      'Relatório de Encontro Imediato — Área de {location}',
      'Caso Categoria D GEIPAN — Observação em {location}',
      'Relatório de Piloto da Aviação Civil — UAP Perto de {location}',
      'Caso de Vestígio Terrestre — Evidência Física Perto de {location}',
      'Múltiplo Retorno Radar — Objeto Não Identificado em {location}',
      'Revisão Estatística GEIPAN — Cluster da Região de {location}',
      'Relatório UAP da Gendarmerie — Comuna de {location}',
    ],
  },
  GB: {
    en: [
      'MOD Declassified File — UAP Report from {location}',
      'RAF Radar Contact: Unidentified Object Near {location}',
      'MOD Investigation: Aerial Phenomenon at {location}',
      'DI55 Intelligence Assessment — {location} Incident',
      'MOD FOI Release: Sighting Report from {location}',
      'UK Air Defence Region — Unknown Track Near {location}',
      'Police Report: Unidentified Lights Over {location}',
      'MOD Case Review — Multiple Witnesses at {location}',
      'RAF Pilot Debrief — Encounter Near {location}',
      'Civil Aviation Report — UAP in {location} Corridor',
    ],
    pt: [
      'Arquivo Desclassificado MOD — Relatório UAP de {location}',
      'Contato Radar RAF: Objeto Não Identificado Perto de {location}',
      'Investigação MOD: Fenômeno Aéreo em {location}',
      'Avaliação de Inteligência DI55 — Incidente em {location}',
      'Liberação FOI do MOD: Relatório de Avistamento de {location}',
      'Região de Defesa Aérea do Reino Unido — Rastro Desconhecido Perto de {location}',
      'Relatório Policial: Luzes Não Identificadas Sobre {location}',
      'Revisão de Caso MOD — Múltiplas Testemunhas em {location}',
      'Debriefing de Piloto RAF — Encontro Perto de {location}',
      'Relatório da Aviação Civil — UAP no Corredor de {location}',
    ],
  },
  CL: {
    en: [
      'CEFAA Case File — Aerial Anomaly Reported at {location}',
      'Chilean Air Force Radar Contact Near {location}',
      'CEFAA Investigation: Unknown Object Over {location}',
      'Pilot Encounter Report — {location} Airspace',
      'CEFAA Scientific Panel Review — {location} Incident',
      'DGAC Report: UAP in Controlled Airspace Near {location}',
      'Multiple Witness Sighting — {location} Region',
      'CEFAA Photographic Analysis — Object at {location}',
    ],
    pt: [
      'Arquivo de Caso CEFAA — Anomalia Aérea Reportada em {location}',
      'Contato Radar da Força Aérea Chilena Perto de {location}',
      'Investigação CEFAA: Objeto Desconhecido Sobre {location}',
      'Relatório de Encontro de Piloto — Espaço Aéreo de {location}',
      'Revisão do Painel Científico CEFAA — Incidente em {location}',
      'Relatório DGAC: UAP em Espaço Aéreo Controlado Perto de {location}',
      'Avistamento com Múltiplas Testemunhas — Região de {location}',
      'Análise Fotográfica CEFAA — Objeto em {location}',
    ],
  },
  CA: {
    en: [
      'DND Declassified Report — UAP Observed Near {location}',
      'RCMP Report: Unidentified Object Over {location}',
      'Canadian Forces Investigation — {location} Incident',
      'Transport Canada Report: Aerial Anomaly at {location}',
      'DND Intelligence Assessment — {location} Region',
      'NORAD Track Record — Unknown Object Near {location}',
      'NRC UFO Report — Observation at {location}',
      'Canadian Coast Guard Report — UAP Near {location}',
    ],
    pt: [
      'Relatório Desclassificado DND — UAP Observado Perto de {location}',
      'Relatório RCMP: Objeto Não Identificado Sobre {location}',
      'Investigação das Forças Canadenses — Incidente em {location}',
      'Relatório do Transport Canada: Anomalia Aérea em {location}',
      'Avaliação de Inteligência DND — Região de {location}',
      'Registro de Rastro NORAD — Objeto Desconhecido Perto de {location}',
      'Relatório OVNI NRC — Observação em {location}',
      'Relatório da Guarda Costeira Canadense — UAP Perto de {location}',
    ],
  },
  US: {
    en: [
      '{agency} Declassified Document — Anomalous Object Near {location}',
      '{agency} Investigation File: UAP at {location}',
      'AARO Case Review — Unresolved Incident at {location}',
      '{agency} Report: Unknown Aerial Object Near {location}',
      'Military Encounter — Unidentified Object Over {location}',
      '{agency} Sensor Data: Anomalous Track at {location}',
      'Defense Intelligence Report — {location} UAP',
      '{agency} Assessment: Airspace Intrusion Near {location}',
      'Pilot Report: Fast-Moving Object at {location}',
      '{agency} FOIA Release — Incident at {location}',
    ],
    pt: [
      '[{agency}] Documento Desclassificado — Objeto Anômalo Perto de {location}',
      '[{agency}] Arquivo de Investigação: UAP em {location}',
      'Revisão de Caso AARO — Incidente Não Resolvido em {location}',
      '[{agency}] Relatório: Objeto Aéreo Desconhecido Perto de {location}',
      'Encontro Militar — Objeto Não Identificado Sobre {location}',
      '[{agency}] Dados de Sensor: Rastro Anômalo em {location}',
      'Relatório de Inteligência de Defesa — UAP em {location}',
      '[{agency}] Avaliação: Intrusão no Espaço Aéreo Perto de {location}',
      'Relatório de Piloto: Objeto Veloz em {location}',
      '[{agency}] Liberação FOIA — Incidente em {location}',
    ],
  },
};

// Summary templates
const summaryTemplates = {
  BR: {
    en: [
      'Brazilian Air Force report documenting an unidentified aerial phenomenon observed near {location} in {year}. The incident was reported by {witness_type} and classified as {classification_text} after preliminary analysis. The FAB investigation recorded {detail}.',
      'Official FAB case file from {year} regarding anomalous aerial activity in the {location} area. {witness_count} witnesses provided consistent testimony of {detail}. The case remains in the {agency} archives.',
      '{agency} investigation into an anomalous luminous phenomenon observed over {location} on {date}. Witnesses described {detail}. The incident was documented as part of ongoing Brazilian aerial monitoring operations.',
    ],
    pt: [
      'Relatório da Força Aérea Brasileira documentando fenômeno aéreo não identificado observado perto de {location} em {year}. O incidente foi relatado por {witness_type_pt} e classificado como {classification_text_pt} após análise preliminar. A investigação da FAB registrou {detail_pt}.',
      'Arquivo oficial de caso da FAB de {year} sobre atividade aérea anômala na área de {location}. {witness_count} testemunhas forneceram depoimentos consistentes sobre {detail_pt}. O caso permanece nos arquivos da {agency}.',
      'Investigação da {agency} sobre fenômeno luminoso anômalo observado sobre {location} em {date}. Testemunhas descreveram {detail_pt}. O incidente foi documentado como parte das operações brasileiras de monitoramento aéreo.',
    ],
  },
  FR: {
    en: [
      'GEIPAN investigation file for case observed near {location} in {year}. The phenomenon was categorized as {classification_text} after analysis by the scientific panel. {detail}.',
      'Official GEIPAN report on aerial anomaly near {location}, {year}. Reported by {witness_type}. Investigation included {detail}. Classification: {classification_text}.',
      'French aerospace authority investigation of unidentified aerial phenomenon at {location}. The case from {year} involved {detail} and was reviewed by GEIPAN\'s scientific advisory board.',
    ],
    pt: [
      'Arquivo de investigação GEIPAN para caso observado perto de {location} em {year}. O fenômeno foi categorizado como {classification_text_pt} após análise pelo painel científico. {detail_pt}.',
      'Relatório oficial GEIPAN sobre anomalia aérea perto de {location}, {year}. Relatado por {witness_type_pt}. Investigação incluiu {detail_pt}. Classificação: {classification_text_pt}.',
      'Investigação da autoridade aeroespacial francesa de fenômeno aéreo não identificado em {location}. O caso de {year} envolveu {detail_pt} e foi revisado pelo conselho consultivo científico do GEIPAN.',
    ],
  },
  GB: {
    en: [
      'MOD declassified file regarding unidentified aerial phenomenon reported near {location} in {year}. {detail}. Case assessed by DI55 and classified as {classification_text}.',
      'UK Ministry of Defence investigation file from {year}. Incident near {location} reported by {witness_type}. {detail}. Released under Freedom of Information.',
      'British government UAP report from {year} concerning observations near {location}. {witness_count} witnesses described {detail}. MOD classification: {classification_text}.',
    ],
    pt: [
      'Arquivo desclassificado do MOD sobre fenômeno aéreo não identificado relatado perto de {location} em {year}. {detail_pt}. Caso avaliado pelo DI55 e classificado como {classification_text_pt}.',
      'Arquivo de investigação do Ministério da Defesa do Reino Unido de {year}. Incidente perto de {location} relatado por {witness_type_pt}. {detail_pt}. Liberado sob Lei de Liberdade de Informação.',
      'Relatório UAP do governo britânico de {year} sobre observações perto de {location}. {witness_count} testemunhas descreveram {detail_pt}. Classificação do MOD: {classification_text_pt}.',
    ],
  },
  CL: {
    en: [
      'CEFAA case file from {year} documenting aerial anomaly near {location}. Investigated by scientific advisory panel. {detail}. Case status: {classification_text}.',
      'Chilean DGAC report on unidentified aerial phenomenon observed near {location} in {year}. {witness_type} reported {detail}. CEFAA classification: {classification_text}.',
    ],
    pt: [
      'Arquivo de caso CEFAA de {year} documentando anomalia aérea perto de {location}. Investigado pelo painel consultivo científico. {detail_pt}. Status do caso: {classification_text_pt}.',
      'Relatório da DGAC chilena sobre fenômeno aéreo não identificado observado perto de {location} em {year}. {witness_type_pt} relatou {detail_pt}. Classificação CEFAA: {classification_text_pt}.',
    ],
  },
  CA: {
    en: [
      'Canadian Department of National Defence report from {year} regarding UAP near {location}. {detail}. Case classification: {classification_text}.',
      'DND investigation file on aerial anomaly reported near {location} in {year}. {witness_type} observed {detail}. Transport Canada was notified.',
    ],
    pt: [
      'Relatório do Departamento de Defesa Nacional do Canadá de {year} sobre UAP perto de {location}. {detail_pt}. Classificação do caso: {classification_text_pt}.',
      'Arquivo de investigação DND sobre anomalia aérea relatada perto de {location} em {year}. {witness_type_pt} observou {detail_pt}. O Transport Canada foi notificado.',
    ],
  },
  US: {
    en: [
      '{agency} investigation file from {year} documenting anomalous aerial activity near {location}. {detail}. Classified as {classification_text} by reviewing authorities.',
      'Official {agency} report on unidentified aerial phenomenon near {location}, {year}. {witness_type} reported {detail}. Case reviewed by AARO.',
      'Declassified {agency} document from {year} regarding UAP incident near {location}. {detail}. Assessment: {classification_text}.',
    ],
    pt: [
      'Arquivo de investigação {agency} de {year} documentando atividade aérea anômala perto de {location}. {detail_pt}. Classificado como {classification_text_pt} pelas autoridades revisoras.',
      'Relatório oficial {agency} sobre fenômeno aéreo não identificado perto de {location}, {year}. {witness_type_pt} relatou {detail_pt}. Caso revisado pelo AARO.',
      'Documento desclassificado {agency} de {year} sobre incidente UAP perto de {location}. {detail_pt}. Avaliação: {classification_text_pt}.',
    ],
  },
};

const witnessTypes = {
  en: ['military personnel', 'civilian pilot', 'multiple civilian witnesses', 'air traffic controllers', 'police officers', 'coast guard personnel', 'military radar operators', 'commercial airline crew', 'ground-based observers', 'security personnel'],
  pt: ['pessoal militar', 'piloto civil', 'múltiplas testemunhas civis', 'controladores de tráfego aéreo', 'oficiais de polícia', 'pessoal da guarda costeira', 'operadores de radar militar', 'tripulação de companhia aérea comercial', 'observadores em terra', 'pessoal de segurança'],
};

const details = {
  en: [
    'a bright luminous object performing non-ballistic maneuvers at estimated speed exceeding conventional aircraft capabilities',
    'radar returns from an object with no transponder signal that maintained a fixed position before departing at high speed',
    'a disc-shaped metallic object hovering silently before accelerating vertically at extreme velocity',
    'multiple luminous orbs in formation that split apart and reformed while moving against the prevailing wind direction',
    'a triangular craft with lights at each vertex that moved silently at low altitude over populated areas',
    'an elongated cylindrical object reflecting sunlight at an altitude estimated between 10,000 and 20,000 feet',
    'anomalous radar returns consistent with a solid object performing instantaneous acceleration beyond known aircraft performance',
    'a pulsating light source that changed color from white to red to green while maintaining stationary position for several minutes',
    'an unidentified object tracked on both primary and secondary radar that did not respond to radio communication attempts',
    'a fast-moving object that appeared to enter and exit the water without any observable splash or wake',
    'electromagnetic interference with electronic equipment coinciding with the observation of the aerial object',
    'a structured craft exhibiting characteristics inconsistent with any known aircraft or atmospheric phenomena',
  ],
  pt: [
    'um objeto luminoso brilhante realizando manobras não-balísticas a velocidade estimada excedendo capacidades de aeronaves convencionais',
    'retornos de radar de um objeto sem sinal de transponder que manteve posição fixa antes de partir em alta velocidade',
    'um objeto metálico em forma de disco pairando silenciosamente antes de acelerar verticalmente a velocidade extrema',
    'múltiplos orbes luminosos em formação que se separaram e se reformaram enquanto se moviam contra a direção do vento predominante',
    'uma nave triangular com luzes em cada vértice que se movia silenciosamente em baixa altitude sobre áreas povoadas',
    'um objeto cilíndrico alongado refletindo luz solar a uma altitude estimada entre 3.000 e 6.000 metros',
    'retornos de radar anômalos consistentes com um objeto sólido realizando aceleração instantânea além do desempenho conhecido de aeronaves',
    'uma fonte de luz pulsante que mudou de cor de branco para vermelho para verde enquanto mantinha posição estacionária por vários minutos',
    'um objeto não identificado rastreado tanto em radar primário quanto secundário que não respondeu a tentativas de comunicação por rádio',
    'um objeto em movimento rápido que pareceu entrar e sair da água sem qualquer respingo ou rastro observável',
    'interferência eletromagnética com equipamento eletrônico coincidindo com a observação do objeto aéreo',
    'uma nave estruturada exibindo características inconsistentes com qualquer aeronave conhecida ou fenômeno atmosférico',
  ],
};

const classificationText = {
  unresolved: { en: 'unresolved — no conventional explanation found', pt: 'não resolvido — nenhuma explicação convencional encontrada' },
  resolved_natural: { en: 'resolved — attributed to natural atmospheric phenomena', pt: 'resolvido — atribuído a fenômenos atmosféricos naturais' },
  resolved_manmade: { en: 'resolved — attributed to man-made object or technology', pt: 'resolvido — atribuído a objeto ou tecnologia artificial' },
  unknown: { en: 'unknown — insufficient data for definitive classification', pt: 'desconhecido — dados insuficientes para classificação definitiva' },
};

const brAgencies = ['FAB', 'FAB', 'FAB', 'SNI', 'COMDABRA'];
const usAgencies = ['DOW', 'FBI', 'NASA', 'STATE', 'ODNI', 'DOE', 'USAF', 'USN', 'CIA'];
const countrySourcePrograms = {
  BR: ['OPERACAO_PRATO', 'SIOANI', 'FAB_DESCLASSIFICACAO'],
  FR: ['GEIPAN', 'COMETA', 'SEPRA'],
  GB: ['MOD_FOI', 'PROJECT_CONDIGN', 'MOD_DESK'],
  CL: ['CEFAA'],
  CA: ['DND_INVESTIGATION', 'PROJECT_MAGNET', 'NRC_FILES'],
  US: ['AATIP', 'AARO', 'PROJECT_BLUE_BOOK', 'UAPTF', 'PURSUE'],
};

// ============================================================================
// PROCEDURAL DOCUMENT GENERATOR
// ============================================================================

function generateProceduralDoc(index, country, locations, agencyList) {
  const loc = pick(locations);
  const agency = pick(agencyList);
  const year = randInt(1947, 2025);
  const month = randInt(0, 11);
  const day = randInt(1, 28);
  const dateStr = `${String(day).padStart(2,'0')} ${MONTHS[month]} ${year}`;
  const mediaType = pick(mediaTypes);
  const classification = pick(classifications);
  const srcProgram = pick(countrySourcePrograms[country]);
  const witnessIdx = randInt(0, witnessTypes.en.length - 1);
  const detailIdx = randInt(0, details.en.length - 1);
  const witnessCount = randInt(2, 47);

  const templateIdx = randInt(0, (titleTemplates[country]?.en?.length || 1) - 1);
  const titleEn = (titleTemplates[country]?.en[templateIdx] || '{agency} Report — {location}')
    .replace(/{agency}/g, agency)
    .replace(/{location}/g, loc.name);
  const titlePt = (titleTemplates[country]?.pt[templateIdx] || '[{agency}] Relatório — {location}')
    .replace(/{agency}/g, agency)
    .replace(/{location}/g, loc.name);

  const summaryTemplateIdx = randInt(0, (summaryTemplates[country]?.en?.length || 1) - 1);
  const summaryEn = (summaryTemplates[country]?.en[summaryTemplateIdx] || 'UAP report from {location} in {year}.')
    .replace(/{agency}/g, agency)
    .replace(/{location}/g, loc.name)
    .replace(/{year}/g, String(year))
    .replace(/{date}/g, dateStr)
    .replace(/{witness_type}/g, witnessTypes.en[witnessIdx])
    .replace(/{witness_count}/g, String(witnessCount))
    .replace(/{detail}/g, details.en[detailIdx])
    .replace(/{classification_text}/g, classificationText[classification].en);

  const summaryPt = (summaryTemplates[country]?.pt[summaryTemplateIdx] || 'Relatório UAP de {location} em {year}.')
    .replace(/{agency}/g, agency)
    .replace(/{location}/g, loc.name)
    .replace(/{year}/g, String(year))
    .replace(/{date}/g, dateStr)
    .replace(/{witness_type_pt}/g, witnessTypes.pt[witnessIdx])
    .replace(/{witness_count}/g, String(witnessCount))
    .replace(/{detail_pt}/g, details.pt[detailIdx])
    .replace(/{classification_text_pt}/g, classificationText[classification].pt);

  // Build official_id
  const agencyPrefix = {
    BR: { FAB: 'FAB', SNI: 'SNI', COMDABRA: 'CMD' },
    FR: { GEIPAN: 'GPN' },
    GB: { MOD: 'MOD' },
    CL: { CEFAA: 'CEF' },
    CA: { DND: 'DND' },
    US: { DOW: 'DOW', FBI: 'FBI', NASA: 'NAS', STATE: 'STT', ODNI: 'ODN', DOE: 'DOE', USAF: 'UAF', USN: 'USN', CIA: 'CIA' },
  };
  const prefix = agencyPrefix[country]?.[agency] || agency.substring(0, 3).toUpperCase();
  const officialId = `${prefix}-${year}-${String(index).padStart(4, '0')}`;

  const slug = makeSlug(`${officialId}-${loc.name}-${year}`);

  // Slight lat/lng variation for realism
  const lat = loc.lat !== null ? randFloat(loc.lat - 0.5, loc.lat + 0.5) : null;
  const lng = loc.lng !== null ? randFloat(loc.lng - 0.5, loc.lng + 0.5) : null;

  const tagCountry = { BR: 'brazil', FR: 'france', GB: 'uk', CL: 'chile', CA: 'canada', US: 'usa' };

  return {
    id: `global-${index}`,
    slug,
    official_id: officialId,
    title_en: titleEn,
    title_pt: titlePt,
    summary_en: summaryEn,
    summary_pt: summaryPt,
    analysis_en: null,
    analysis_pt: null,
    agency,
    media_type: mediaType,
    classification,
    incident_date: dateStr,
    incident_year: year,
    release_date: '2026-05-20',
    location_name: loc.name,
    location_region: loc.region,
    lat,
    lng,
    original_url: null,
    thumbnail_url: null,
    pdf_url: null,
    video_url: null,
    tags: [agency.toLowerCase(), String(year), tagCountry[country] || country.toLowerCase(), 'global'],
    meta_description_en: `${agency} UAP report from ${loc.name}, ${year}`,
    meta_description_pt: `Relatório UAP ${agency} de ${loc.name}, ${year}`,
    is_published: true,
    view_count: 0,
    created_at: NOW,
    updated_at: NOW,
    country,
    source_program: srcProgram,
  };
}

// ============================================================================
// BUILD THE DATASET
// ============================================================================

const allDocs = [];
let globalIndex = 0;

// 1. Add anchor cases first
for (const anchor of anchorCases) {
  const officialId = `${anchor.official_id_prefix}-001`;
  const slug = makeSlug(`${officialId}-${anchor.location_name}-${anchor.incident_year}`);

  allDocs.push({
    id: `global-${globalIndex}`,
    slug,
    official_id: officialId,
    title_en: anchor.title_en,
    title_pt: anchor.title_pt,
    summary_en: anchor.summary_en,
    summary_pt: anchor.summary_pt,
    analysis_en: anchor.analysis_en,
    analysis_pt: anchor.analysis_pt,
    agency: anchor.agency,
    media_type: anchor.media_type,
    classification: anchor.classification,
    incident_date: anchor.incident_date,
    incident_year: anchor.incident_year,
    release_date: '2026-05-20',
    location_name: anchor.location_name,
    location_region: anchor.location_region,
    lat: anchor.lat,
    lng: anchor.lng,
    original_url: null,
    thumbnail_url: null,
    pdf_url: null,
    video_url: null,
    tags: anchor.tags,
    meta_description_en: `${anchor.agency} UAP report: ${anchor.title_en}`,
    meta_description_pt: `Relatório UAP ${anchor.agency}: ${anchor.title_pt}`,
    is_published: true,
    view_count: 0,
    created_at: NOW,
    updated_at: NOW,
    country: anchor.country,
    source_program: anchor.source_program,
  });
  globalIndex++;
}

console.log(`Added ${globalIndex} anchor cases.`);

// 2. Generate procedural documents per country to reach targets
// Target distribution: BR ~130, FR ~105, GB ~85, CL ~45, CA ~55, US ~400
// (anchor cases already contribute: BR 6, FR 4, GB 4, CL 3, CA 3, US 0 = 20)
const proceduralTargets = [
  { country: 'BR', locations: brLocations, agencies: brAgencies, count: 130 },
  { country: 'FR', locations: frLocations, agencies: ['GEIPAN'], count: 105 },
  { country: 'GB', locations: gbLocations, agencies: ['MOD'], count: 85 },
  { country: 'CL', locations: clLocations, agencies: ['CEFAA'], count: 45 },
  { country: 'CA', locations: caLocations, agencies: ['DND'], count: 55 },
  { country: 'US', locations: usLocations, agencies: usAgencies, count: 410 },
];

for (const target of proceduralTargets) {
  for (let i = 0; i < target.count; i++) {
    const doc = generateProceduralDoc(globalIndex, target.country, target.locations, target.agencies);
    allDocs.push(doc);
    globalIndex++;
  }
}

console.log(`Total documents generated: ${allDocs.length}`);

// 3. Ensure all slugs are unique
const slugSet = new Set();
for (const doc of allDocs) {
  let s = doc.slug;
  let counter = 2;
  while (slugSet.has(s)) {
    s = `${doc.slug}-${counter}`;
    counter++;
  }
  doc.slug = s;
  slugSet.add(s);
}

// 4. Verify uniqueness
const idSet = new Set(allDocs.map(d => d.id));
const slugSetFinal = new Set(allDocs.map(d => d.slug));
console.log(`Unique IDs: ${idSet.size} / ${allDocs.length}`);
console.log(`Unique slugs: ${slugSetFinal.size} / ${allDocs.length}`);

// 5. Country distribution summary
const countryDist = {};
for (const doc of allDocs) {
  countryDist[doc.country] = (countryDist[doc.country] || 0) + 1;
}
console.log('Country distribution:', JSON.stringify(countryDist, null, 2));

// 6. Write to file
writeFileSync('src/lib/global-uap-data.json', JSON.stringify(allDocs, null, 2));
console.log(`\nWritten to src/lib/global-uap-data.json (${allDocs.length} documents)`);
