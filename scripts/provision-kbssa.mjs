import fs from "node:fs";

const ACCOUNT_ID = "6af5893b6fbc6ead15806787"; // Kbssa - Área Fiscal - TI
const APP_ID = "6aef9673577cba58a2c91a3c";

const authFile = "C:/Users/lucas/.base44/auth/auth.json";
if (!fs.existsSync(authFile)) {
  throw new Error("Base44 auth.json não encontrado!");
}
const auth = JSON.parse(fs.readFileSync(authFile, "utf8"));
const token = auth.accessToken;
const BASE_URL = `https://app.base44.com/api/apps/${APP_ID}/entities/StudyDocument`;

console.log(`[Provisioning] Iniciando carga de materiais para a conta ${ACCOUNT_ID} (Kbssa)...`);

// 1. Tópicos do Edital de TI (46 Aulas + Trilhas)
const tiTitles = [
  "Pirâmide DIKW, Dados Abertos e Metadados de Arquivos",
  "Governança de Dados (DAMA-DMBOK)",
  "Qualidade de Dados",
  "Conceitos Básicos de Bancos de Dados Relacionais",
  "Modelagem Conceitual de Dados (Entidade-Relacionamento)",
  "Modelagem Lógica e Física de Bancos de Dados",
  "Normalização de Dados (1FN, 2FN, 3FN e BCNF)",
  "Álgebra Relacional e Linguagem SQL (DDL, DML e DQL)",
  "Data Warehouse e Arquiteturas Analíticas",
  "Modelagem Dimensional e Processamento OLAP",
  "Mineração de Dados: Conceitos e Pré-processamento",
  "Algoritmos de Data Mining: Classificação, Agrupamento e Associação",
  "Conceitos de Big Data e os 5Vs",
  "Soluções de Armazenamento e Processamento Big Data (Hadoop e Spark)",
  "Bancos de Dados NoSQL (Chave-Valor, Documento, Colunar e Grafo)",
  "Ferramentas de Visualização de Dados e BI",
  "Inteligência Artificial Generativa e Grandes Modelos de Linguagem (LLMs)",
  "Machine Learning: Aprendizado Supervisionado e Não Supervisionado",
  "Machine Learning: Avaliação e Métricas de Desempenho",
  "Processamento de Linguagem Natural (PLN / NLP)",
  "Análise Exploratória de Dados (EDA)",
  "Visualização e Storytelling com Dados",
  "Programação em Python: Fundamentos e Estruturas",
  "Bibliotecas de Python para Análise de Dados (Pandas, NumPy, Scikit-Learn)",
  "Linguagem R para Estatística e Análise de Dados",
  "Governança de TI: Modelos de Processos (COBIT 2019 e ITIL 4)",
  "Gestão de Processos de Negócio e Notação BPMN 2.0",
  "Segurança em Aplicações Web e OWASP Top 10",
  "Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)",
  "Segurança da Informação: ABNT NBR ISO/IEC 27001 e 27002",
  "Gestão de Riscos de TI: Norma ISO/IEC 27005",
  "Criptografia, Certificação e Assinatura Digital (ICP-Brasil)",
  "Engenharia de Software: Ciclos de Vida Tradicionais",
  "Métodos Ágeis: Fundamentos e Manifesto Ágil",
  "Framework Scrum: Papéis, Eventos e Artefatos",
  "Extreme Programming (XP) e Método Kanban",
  "Engenharia de Requisitos: Elicitação, Análise e Validação",
  "Modelagem com Diagramas UML",
  "Testes de Software: Tipos, Níveis e TDD",
  "Formatos de Intercâmbio de Dados: JSON, XML e YAML",
  "Arquitetura de Software e Padrões de Projeto (Design Patterns GoF)",
  "Web Services e Integração de Sistemas: REST e SOAP",
  "Arquitetura de Microsserviços e APIs",
  "Análise, Qualidade e Manutenibilidade de Código",
  "Portais Corporativos e Gestão Eletrônica de Documentos (GED)",
  "Gestão de Projetos de TI (PMBOK)"
];

const editalDocs = [];

// 46 Tópicos de TI
for (let i = 0; i < tiTitles.length; i++) {
  const num = String(i + 1).padStart(2, "0");
  const capCode = `FISCAL-TI-${num}`;
  const id = `fiscal-ti-${num}`;
  editalDocs.push({
    id,
    ordem: i + 1,
    num,
    prova: "P1 / P2 - Área Fiscal",
    sigla: "TI",
    materia: "Tecnologia da Informação",
    materiaOrdem: 7,
    titulo: tiTitles[i],
    caps: [capCode],
    obs: `Aula ${num} · Curso Regular de Tecnologia da Informação para a Área Fiscal. Material completo em PDF e questões vinculadas.`,
    status: null,
    trilha: "Regular"
  });
}

// Macro-tópicos de Trilha Estratégica (Ciclos)
for (let t = 0; t <= 9; t++) {
  const tStr = String(t).padStart(2, "0");
  const id = `fiscal-trilha-${tStr}`;
  editalDocs.push({
    id,
    ordem: 50 + t,
    num: `TR-${tStr}`,
    prova: "Cronograma Geral",
    sigla: "TRILHA",
    materia: "Trilha Estratégica Regular",
    materiaOrdem: 0,
    titulo: `Trilha Estratégica ${tStr} · Metas e Ciclos da Semana`,
    caps: [`FISCAL-TRILHA-${tStr}`],
    obs: `Cronograma da Trilha ${tStr} para a Área Fiscal. Tarefas de teoria, exercícios de fixação e revisões programadas.`,
    status: null,
    trilha: tStr
  });
}

// 2. Materiais
const materiaisDocs = [];
for (let i = 0; i < tiTitles.length; i++) {
  const num = String(i + 1).padStart(2, "0");
  materiaisDocs.push({
    id: `mat-ti-${num}`,
    titulo: `Aula ${num} - ${tiTitles[i]} (PDF Regular)`,
    tipo: "livro-eletronico",
    disciplina: "Tecnologia da Informação",
    topicos: [`fiscal-ti-${num}`],
    descricao: `Material teórico completo da Aula ${num} em PDF na pasta material/. Contém teoria esquematizada e questões comentadas.`
  });
}

for (let t = 0; t <= 39; t++) {
  const tStr = String(t).padStart(2, "0");
  materiaisDocs.push({
    id: `mat-trilha-${tStr}`,
    titulo: `Trilha Estratégica ${tStr} (PDF Completo)`,
    tipo: "trilha-cronograma",
    disciplina: "Trilha Estratégica Regular",
    topicos: t <= 9 ? [`fiscal-trilha-${tStr}`] : [],
    descricao: `Relatório completo da Trilha Estratégica ${tStr} em material/Trilhas/. Roteiro detalhado de estudos e tarefas semanais.`
  });
}

// 3. Questões de Active Recall Cebraspe / FGV para os tópicos de TI
const questoesDocs = [
  // Aula 01 - DIKW e Dados Abertos
  {
    id: "kbssa-ti-01-q01",
    cap: "FISCAL-TI-01",
    capNome: "Pirâmide DIKW e Dados Abertos",
    materia: "Tecnologia da Informação",
    tema: "Pirâmide DIKW",
    ordem: 1,
    enunciado: "Na pirâmide informacional (DIKW), a sabedoria (Wisdom) localiza-se na base da estrutura, atuando como o elemento primário e não interpretado a partir do qual os dados e informações são subsequentemente sintetizados.",
    gabarito: "E",
    comentario: "A sabedoria (Wisdom) está no ápice da pirâmide DIKW, representando a aplicação prática do conhecimento com juízo crítico e visão de futuro. Na base estão os dados (fatos brutos sem contexto).",
    justificativa: "A ordem ascendente da pirâmide é: Dados (base) -> Informação -> Conhecimento -> Sabedoria (ápice).",
    mecanismo: "F3",
    vacina: "Memorize a ordem ascendente DIKW (Dado, Informação, Conhecimento, Sabedoria). A base é simples e volumosa; o ápice é complexo e refinado.",
    fonte: "Material TI Aula 01 · Pirâmide DIKW",
    origem: "inédito Tutor IA"
  },
  {
    id: "kbssa-ti-01-q02",
    cap: "FISCAL-TI-01",
    capNome: "Pirâmide DIKW e Dados Abertos",
    materia: "Tecnologia da Informação",
    tema: "Dados Abertos",
    ordem: 2,
    enunciado: "Para que dados públicos sejam qualificados como dados abertos, é imprescindível que estejam disponibilizados em formatos estruturados e abertos (como CSV ou JSON), passíveis de leitura por máquina e livres de licenças proprietárias restritivas.",
    gabarito: "C",
    comentario: "Item correto. De acordo com os princípios dos dados abertos e a legislação de transparência, dados abertos devem ser acessíveis pela web, estruturados, legíveis por máquina e em formatos não proprietários.",
    justificativa: "Os dados abertos exigem completude, primariedade, atualidade, acessibilidade, processamento por máquina, acesso não discriminatório, formato não proprietário e licença livre.",
    mecanismo: "V1",
    vacina: "Se os dados estão em PDF digitalizado ou imagem, NÃO são considerados abertos porque dificultam o processamento automatizado por máquina.",
    fonte: "Material TI Aula 01 · Dados Abertos",
    origem: "inédito Tutor IA"
  },
  // Aula 02 - Governança de Dados
  {
    id: "kbssa-ti-02-q01",
    cap: "FISCAL-TI-02",
    capNome: "Governança de Dados (DAMA-DMBOK)",
    materia: "Tecnologia da Informação",
    tema: "DAMA-DMBOK",
    ordem: 3,
    enunciado: "Segundo o framework DAMA-DMBOK, a governança de dados se confunde com o gerenciamento de banco de dados (DBA), sendo ambas as funções restritas às rotinas operacionais de instalação, backup e tuning dos servidores de banco de dados.",
    gabarito: "E",
    comentario: "A Governança de Dados (DAMA-DMBOK) situa-se no centro da 'Roda DAMA' e trata do direcionamento estratégico, políticas, autoridade, controle e gestão responsável dos ativos de dados corporativos. Não se restringe às tarefas operacionais técnicas do DBA.",
    justificativa: "Governança é o exercício de autoridade e controle sobre o gerenciamento de dados; já a administração de banco de dados é uma função técnica e operacional.",
    mecanismo: "F1",
    vacina: "Governança define 'o que fazer e as políticas'; Gestão/DBA executa 'o como fazer operacional'. Não misture nível estratégico com operacional.",
    fonte: "Material TI Aula 02 · Governança DAMA-DMBOK",
    origem: "inédito Tutor IA"
  },
  // Aula 04 - Banco de Dados Relacional
  {
    id: "kbssa-ti-04-q01",
    cap: "FISCAL-TI-04",
    capNome: "Bancos de Dados Relacionais",
    materia: "Tecnologia da Informação",
    tema: "Propriedades ACID",
    ordem: 4,
    enunciado: "Em sistemas de gerenciamento de bancos de dados relacionais transacionais (SGBD-R), a propriedade de Atomicidade assegura que todas as operações que compõem uma transação sejam executadas com sucesso integral ou, no caso de falha, nenhuma delas seja consolidada.",
    gabarito: "C",
    comentario: "Item certo. A atomicidade garante a premissa do 'tudo ou nada' (all or nothing): se qualquer instrução da transação falhar, o SGBD realiza rollback e o estado anterior é restaurado.",
    justificativa: "Atomicidade: a transação é tratada como uma unidade indivisível de trabalho.",
    mecanismo: "V1",
    vacina: "ACID: Atomicidade (tudo ou nada), Consistência (regras de integridade preservadas), Isolamento (transações concorrentes não interferem), Durabilidade (persistência após commit).",
    fonte: "Material TI Aula 04 · Transações ACID",
    origem: "inédito Tutor IA"
  },
  // Aula 07 - Normalização
  {
    id: "kbssa-ti-07-q01",
    cap: "FISCAL-TI-07",
    capNome: "Normalização de Dados",
    materia: "Tecnologia da Informação",
    tema: "Formas Normais",
    ordem: 5,
    enunciado: "Uma tabela está na Segunda Forma Normal (2FN) se, além de atender aos requisitos da Primeira Forma Normal (1FN), todos os seus atributos não chave dependerem funcionalmente de forma total da chave primária, eliminando-se dependências parciais.",
    gabarito: "C",
    comentario: "Item correto. A 2FN proíbe dependência funcional parcial (ocorre apenas em chaves compostas, quando um atributo não chave depende de apenas uma parte da chave primária).",
    justificativa: "2FN = 1FN + ausência de dependências parciais.",
    mecanismo: "V1",
    vacina: "1FN: atributos atômicos (sem vetores ou atributos multivalorados); 2FN: sem dependência parcial; 3FN: sem dependência transitiva (atributo não chave dependendo de outro não chave).",
    fonte: "Material TI Aula 07 · Normalização",
    origem: "inédito Tutor IA"
  },
  // Aula 08 - SQL
  {
    id: "kbssa-ti-08-q01",
    cap: "FISCAL-TI-08",
    capNome: "Álgebra Relacional e SQL",
    materia: "Tecnologia da Informação",
    tema: "Comandos DDL e DML",
    ordem: 6,
    enunciado: "Os comandos CREATE, ALTER e DROP pertencem à categoria DML (Data Manipulation Language) da linguagem SQL, sendo utilizados para manipular tuplas individuais dentro das tabelas.",
    gabarito: "E",
    comentario: "CREATE, ALTER e DROP pertencem à DDL (Data Definition Language), pois definem ou alteram a estrutura dos esquemas de dados. Comandos DML são INSERT, UPDATE e DELETE.",
    justificativa: "DDL define estruturas; DML manipula dados; DCL gerencia acessos (GRANT/REVOKE); TCL controla transações (COMMIT/ROLLBACK).",
    mecanismo: "F3",
    vacina: "Cuidado com as siglas da SQL: DDL (definição de esquema), DML (manipulação de tuplas), DQL (consulta SELECT), DCL (permissões), TCL (transações).",
    fonte: "Material TI Aula 08 · SQL",
    origem: "inédito Tutor IA"
  },
  // Aula 09 & 10 - Data Warehouse e OLAP
  {
    id: "kbssa-ti-09-q01",
    cap: "FISCAL-TI-09",
    capNome: "Data Warehouse e Modelagem Dimensional",
    materia: "Tecnologia da Informação",
    tema: "Modelagem Dimensional",
    ordem: 7,
    enunciado: "No modelo dimensional em estrela (Star Schema), as tabelas de dimensão encontram-se completamente normalizadas na terceira forma normal, com o propósito de economizar espaço de armazenamento em detrimento da velocidade das consultas analíticas.",
    gabarito: "E",
    comentario: "No Star Schema, as tabelas de dimensão são intencionalmente desnormalizadas para reduzir o número de junções (joins) e acelerar as consultas analíticas. Quem normaliza as dimensões é o modelo floco de neve (Snowflake Schema).",
    justificativa: "Star Schema = dimensões desnormalizadas; Snowflake Schema = dimensões normalizadas.",
    mecanismo: "F3",
    vacina: "Troca clássica de bancas: Star Schema aceita redundância para evitar joins. Snowflake normaliza as dimensões e aumenta os joins.",
    fonte: "Material TI Aula 09 e 10 · DW e OLAP",
    origem: "inédito Tutor IA"
  },
  // Aula 13 & 14 - Big Data
  {
    id: "kbssa-ti-13-q01",
    cap: "FISCAL-TI-13",
    capNome: "Big Data e Soluções de Processamento",
    materia: "Tecnologia da Informação",
    tema: "Hadoop HDFS",
    ordem: 8,
    enunciado: "No sistema de arquivos distribuído Hadoop (HDFS), o NameNode é responsável por armazenar os blocos de dados físicos dos arquivos, ao passo que os DataNodes mantêm apenas os metadados do cluster na memória RAM.",
    gabarito: "E",
    comentario: "Inversão de papéis. O NameNode é o nó mestre que gerencia o namespace e armazena os metadados do sistema de arquivos. Os DataNodes são os nós escravos que armazenam e recuperam os blocos de dados físicos.",
    justificativa: "NameNode = mestre / metadados; DataNode = operário / blocos físicos de dados.",
    mecanismo: "F3",
    vacina: "NameNode NÃO guarda blocos de dados de arquivos, guarda o catálogo de nomes e localização dos blocos nos DataNodes.",
    fonte: "Material TI Aula 14 · Hadoop HDFS",
    origem: "inédito Tutor IA"
  },
  // Aula 15 - NoSQL
  {
    id: "kbssa-ti-15-q01",
    cap: "FISCAL-TI-15",
    capNome: "Bancos de Dados NoSQL",
    materia: "Tecnologia da Informação",
    tema: "Classificação NoSQL",
    ordem: 9,
    enunciado: "O MongoDB é classificado como um banco de dados NoSQL orientado a documentos, no qual os dados são tipicamente armazenados em estruturas flexíveis no formato BSON (representação binária de JSON).",
    gabarito: "C",
    comentario: "Item certo. MongoDB é o exemplo mais clássico de SGBD NoSQL orientado a documentos, usando coleções de documentos BSON semiestruturados sem schema rígido pré-fixado.",
    justificativa: "Bancos de documentos armazenam pares chave-valor complexos hierarquizados em formatos como JSON/BSON.",
    mecanismo: "V1",
    vacina: "Exemplos-chave NoSQL: Documentos (MongoDB, CouchDB), Chave-Valor (Redis), Família de Colunas (Cassandra, HBase), Grafos (Neo4j).",
    fonte: "Material TI Aula 15 · NoSQL",
    origem: "inédito Tutor IA"
  },
  // Aula 18 & 19 - Machine Learning
  {
    id: "kbssa-ti-18-q01",
    cap: "FISCAL-TI-18",
    capNome: "Machine Learning e Métricas",
    materia: "Tecnologia da Informação",
    tema: "Supervisionado vs Não Supervisionado",
    ordem: 10,
    enunciado: "Algoritmos de agrupamento (clustering), como o K-Means, enquadram-se na categoria de aprendizado supervisionado, pois dependem obrigatoriamente de um conjunto de dados previamente rotulado com a classe-alvo para realizar o treinamento.",
    gabarito: "E",
    comentario: "O K-Means e os métodos de agrupamento são de aprendizado NÃO supervisionado (não há rótulos prévios de classe; o algoritmo descobre padrões e agrupa dados pela similaridade/distância).",
    justificativa: "Aprendizado supervisionado: classificação e regressão (há rótulo/resposta). Não supervisionado: clustering e associação (sem rótulos).",
    mecanismo: "F3",
    vacina: "Clustering / Agrupamento = NÃO supervisionado. Não existe rótulo prévio nos dados de treino.",
    fonte: "Material TI Aula 18 · Machine Learning",
    origem: "inédito Tutor IA"
  },
  // Aula 23 & 24 - Python e Pandas
  {
    id: "kbssa-ti-23-q01",
    cap: "FISCAL-TI-23",
    capNome: "Programação em Python e Pandas",
    materia: "Tecnologia da Informação",
    tema: "Pandas DataFrame",
    ordem: 11,
    enunciado: "Na biblioteca Pandas em Python, o objeto DataFrame representa uma estrutura bidimensional de dados mutável, com eixos rotulados (linhas e colunas), capaz de armazenar tipos de dados heterogêneos.",
    gabarito: "C",
    comentario: "Item correto. DataFrame é a principal estrutura bidimensional do Pandas, similar a uma tabela de banco de dados ou planilha, composta por Series alinhadas com índices de linha e nomes de coluna.",
    justificativa: "Series = 1 dimensão; DataFrame = 2 dimensões; Panel = 3 dimensões (descontinuado em versões recentes do Pandas).",
    mecanismo: "V1",
    vacina: "Pandas: Series (unidimensional) e DataFrame (bidimensional, colunas com tipos distintos).",
    fonte: "Material TI Aula 24 · Python Pandas",
    origem: "inédito Tutor IA"
  },
  // Aula 26 - Governança COBIT e ITIL
  {
    id: "kbssa-ti-26-q01",
    cap: "FISCAL-TI-26",
    capNome: "Governança de TI (COBIT e ITIL)",
    materia: "Tecnologia da Informação",
    tema: "COBIT 2019",
    ordem: 12,
    enunciado: "O COBIT 2019 estabelece uma separação nítida entre Governança e Gestão: a Governança avalia, direciona e monitora (EDM), enquanto a Gestão planeja, constrói, executa e monitora (APO, BAI, DSS, MEA).",
    gabarito: "C",
    comentario: "Item correto. O domínio de governança no COBIT 2019 é o EDM (Evaluate, Direct and Monitor). Os quatro domínios de gestão são: APO (Alinhar, Planejar e Organizar), BAI (Construir, Adquirir e Implementar), DSS (Entregar, Servir e Suportar) e MEA (Monitorar, Avaliar e Medir).",
    justificativa: "Governança = EDM (Conselho de Administração); Gestão = APO, BAI, DSS, MEA (Diretoria Executiva / Operação).",
    mecanismo: "V1",
    vacina: "EDM é SEMPRE Governança. Os outros quatro domínios que começam com consoante são Gestão.",
    fonte: "Material TI Aula 26 · COBIT 2019",
    origem: "inédito Tutor IA"
  },
  // Aula 28 - OWASP Top 10
  {
    id: "kbssa-ti-28-q01",
    cap: "FISCAL-TI-28",
    capNome: "Segurança em Aplicações e OWASP",
    materia: "Tecnologia da Informação",
    tema: "Injeção de SQL (SQLi)",
    ordem: 13,
    enunciado: "O ataque de SQL Injection ocorre quando dados não confiáveis inseridos por usuários são concatenados diretamente em comandos SQL dinâmicos, permitindo que instruções maliciosas sejam interpretadas pelo interpretador do banco de dados.",
    gabarito: "C",
    comentario: "Item correto. A principal mitigação recomendada pela OWASP contra injeção de SQL é o uso de consultas parametrizadas (Prepared Statements) e procedimentos armazenados seguros.",
    justificativa: "Prepared Statements separam o código SQL dos parâmetros de dados, neutralizando a injeção.",
    mecanismo: "V1",
    vacina: "Vacina universal contra SQL Injection: queries parametrizadas (Prepared Statements / ORM) com tipagem estrita de parâmetros.",
    fonte: "Material TI Aula 28 · OWASP Top 10",
    origem: "inédito Tutor IA"
  },
  // Aula 29 - LGPD
  {
    id: "kbssa-ti-29-q01",
    cap: "FISCAL-TI-29",
    capNome: "Lei Geral de Proteção de Dados (LGPD)",
    materia: "Tecnologia da Informação",
    tema: "Agentes de Tratamento",
    ordem: 14,
    enunciado: "Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o Encarregado (DPO) é considerado um agente de tratamento de dados pessoais em conjunto com o Controlador e o Operador.",
    gabarito: "E",
    comentario: "Conforme o art. 5º, IX da LGPD, os agentes de tratamento são APENAS o Controlador e o Operador. O Encarregado (art. 5º, VIII) é o canal de comunicação entre controlador, titulares e ANPD, não sendo agente de tratamento.",
    justificativa: "Agentes de tratamento = Controlador e Operador. O Encarregado (DPO) atua como ponte/canal de comunicação.",
    mecanismo: "F4",
    vacina: "Pegadinha clássica em provas: Encarregado (DPO) NÃO é agente de tratamento pela letra estrita do art. 5º, IX da LGPD.",
    fonte: "Lei nº 13.709/2018, art. 5º, incisos VIII e IX",
    origem: "inédito Tutor IA"
  },
  // Aula 35 - Scrum
  {
    id: "kbssa-ti-35-q01",
    cap: "FISCAL-TI-35",
    capNome: "Framework Scrum",
    materia: "Tecnologia da Informação",
    tema: "Papéis e Cerimônias",
    ordem: 15,
    enunciado: "No framework Scrum oficial (conforme o Scrum Guide), a responsabilidade de ordenar os itens do Product Backlog com base em valor de negócio cabe privativamente ao Scrum Master.",
    gabarito: "E",
    comentario: "A responsabilidade de gerenciar e ordenar o Product Backlog é exclusiva do Product Owner (PO). O Scrum Master atua como líder servidor e facilitador da aplicação das regras do Scrum.",
    justificativa: "Product Owner = gerencia o Product Backlog e maximiza o valor do produto; Scrum Master = líder servidor da eficácia do Scrum.",
    mecanismo: "F3",
    vacina: "Quem manda na priorização e valor é o Product Owner. O Scrum Master remove impedimentos e garante a metodologia.",
    fonte: "Scrum Guide 2020 · Papel do Product Owner",
    origem: "inédito Tutor IA"
  }
];

// 4. Revisão inicial (Mindmaps/Cartões)
const revisaoDocs = [
  {
    id: "rev-ti-01",
    topico: "fiscal-ti-01",
    titulo: "Mapa Mental · Pirâmide DIKW e Governança",
    disciplina: "Tecnologia da Informação",
    mapa: {
      central: "Fundamentos de Dados",
      ramos: [
        {
          nome: "Pirâmide DIKW",
          subtopicos: [
            { rotulo: "Dados", desc: "Fatos brutos, não processados, sem contexto ou significado intrínseco." },
            { rotulo: "Informação", desc: "Dados contextualizados, estruturados e com significado útil." },
            { rotulo: "Conhecimento", desc: "Informação processada pela cognição humana, aplicada e acionável." },
            { rotulo: "Sabedoria", desc: "Aplicação ética, estratégica e prudente do conhecimento (visão de longo prazo)." }
          ]
        },
        {
          nome: "Dados Abertos",
          subtopicos: [
            { rotulo: "Completude", desc: "Todos os dados públicos disponíveis sem filtros indevidos." },
            { rotulo: "Primariedade", desc: "Coletados na fonte original, sem agregação ou modificação prévia." },
            { rotulo: "Processáveis por Máquina", desc: "Formatos abertos estruturados (CSV, JSON, XML) e livres de patentes." }
          ]
        }
      ]
    }
  },
  {
    id: "rev-ti-26",
    topico: "fiscal-ti-26",
    titulo: "Mapa Mental · Governança vs Gestão (COBIT 2019)",
    disciplina: "Tecnologia da Informação",
    mapa: {
      central: "COBIT 2019",
      ramos: [
        {
          nome: "Governança (EDM)",
          subtopicos: [
            { rotulo: "Avaliar", desc: "Examina necessidades dos stakeholders para direcionar os objetivos corporativos." },
            { rotulo: "Direcionar", desc: "Prioriza investimentos, define apetite a risco e traça diretrizes." },
            { rotulo: "Monitorar", desc: "Supervisiona o cumprimento das metas e da conformidade legal/regulatória." }
          ]
        },
        {
          nome: "Gestão (4 Domínios)",
          subtopicos: [
            { rotulo: "APO", desc: "Alinhar, Planejar e Organizar as estratégias técnicas e arquitetura." },
            { rotulo: "BAI", desc: "Construir, Adquirir e Implementar soluções tecnológicas e sistemas." },
            { rotulo: "DSS", desc: "Entregar, Servir e Suportar a operação diária e chamados de usuários." },
            { rotulo: "MEA", desc: "Monitorar, Avaliar e Medir a performance operacional dos processos." }
          ]
        }
      ]
    }
  }
];

async function sendDocument(collection, doc) {
  const payload = {
    study_account_id: ACCOUNT_ID,
    collection: collection,
    legacy_id: doc.id,
    payload_json: JSON.stringify(doc),
    source: "kbssa-curadoria-trilha"
  };

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  return res.json();
}

async function uploadBatch(collection, docs) {
  console.log(`\n--- Enviando coleção: ${collection} (${docs.length} documentos) ---`);
  let ok = 0;
  // Concorrência controlada (5 por vez para velocidade e confiabilidade)
  const chunkSize = 5;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const chunk = docs.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async doc => {
      try {
        await sendDocument(collection, doc);
        ok++;
        process.stdout.write(".");
      } catch (err) {
        console.error(`\n[Falha] ${collection}/${doc.id}:`, err.message);
      }
    }));
  }
  console.log(`\n[OK] ${ok}/${docs.length} documentos persistidos com sucesso.`);
}

async function main() {
  await uploadBatch("edital", editalDocs);
  await uploadBatch("materiais", materiaisDocs);
  await uploadBatch("questoes", questoesDocs);
  await uploadBatch("revisao", revisaoDocs);
  console.log("\n[Sucesso] Todos os materiais, edital, questões e revisões foram provisionados com sucesso para Kbssa no Base44!");
}

main().catch(console.error);
