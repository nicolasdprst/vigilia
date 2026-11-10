import type { Citation, Conversation, LegalDocument, MatterFolder } from '../types'

export const folders: MatterFolder[] = [
  { id: 'delmas', name: 'Contrat de distribution', client: 'Delmas Industrie', reference: 'DOS-2025-0142', color: '#287B70', documentIds: ['distribution', 'avenant-territoire', 'avenant-objectifs', 'mise-en-demeure', 'pv-reunion'], updatedAt: 'Aujourd’hui, 09:42' },
  { id: 'orion', name: 'Bail commercial', client: 'Orion Conseil', reference: 'DOS-2025-0098', color: '#B9A477', documentIds: ['bail', 'echeances'], updatedAt: '4 nov. 2026' },
  { id: 'helios', name: 'Accord de confidentialité', client: 'Helios Technologies', reference: 'DOS-2026-0021', color: '#56708f', documentIds: ['nda'], updatedAt: '29 oct. 2026' },
]

export const documents: LegalDocument[] = [
  {
    id: 'distribution', folderId: 'delmas', title: 'Contrat de distribution exclusive', type: 'Contrat', fileType: 'PDF', pages: 28, size: '2,4 Mo', author: 'Cabinet Montreuil & Associés', createdAt: '14 mars 2024', viewedAt: 'Il y a 12 min', status: 'ready',
    passages: [
      { id: 'dist-p1', page: 1, title: 'Entre les soussignés', text: "Le présent contrat est conclu entre Delmas Industrie SAS, ci-après le Fournisseur, et Nova Distribution SARL, ci-après le Distributeur. Il organise la distribution exclusive des produits professionnels de la gamme Delmas sur le territoire défini à l'annexe 1." },
      { id: 'dist-p12', page: 12, title: 'Article 8 — Durée', text: "Le présent contrat est conclu pour une durée initiale de trois ans à compter du 1er avril 2024. Il sera ensuite renouvelé par périodes successives d'un an, sauf dénonciation par l'une des parties dans les conditions prévues à l'article 12." },
      { id: 'dist-p18', page: 18, title: 'Article 12.1 — Résiliation pour convenance', text: "À l'issue de la période initiale, chaque partie pourra résilier le contrat sans motif, par lettre recommandée avec accusé de réception, sous réserve du respect d'un préavis de six mois. La résiliation prendra effet au dernier jour du mois civil au cours duquel expire le préavis." },
      { id: 'dist-p19', page: 19, title: 'Article 12.2 — Résiliation pour manquement', text: "En cas de manquement grave ou répété par une partie à l'une de ses obligations contractuelles, l'autre partie pourra résilier le contrat de plein droit trente jours après l'envoi d'une mise en demeure restée sans effet. La mise en demeure devra identifier précisément le manquement et viser le présent article." },
      { id: 'dist-p20', page: 20, title: 'Article 12.3 — Résiliation immédiate', text: "La résiliation pourra intervenir sans préavis en cas de cessation d'activité, de liquidation judiciaire, d'atteinte grave à la réputation de la marque ou de violation de l'obligation de confidentialité prévue à l'article 15, sous réserve des dispositions légales impératives." },
      { id: 'dist-p22', page: 22, title: 'Article 13 — Effets de la résiliation', text: "À la date d'effet de la résiliation, le Distributeur cessera tout usage des signes distinctifs du Fournisseur. Les commandes acceptées avant cette date seront exécutées, sauf accord écrit contraire. Le stock résiduel pourra être écoulé pendant quatre-vingt-dix jours." },
    ],
  },
  {
    id: 'avenant-territoire', folderId: 'delmas', title: 'Avenant n° 1 — Révision territoriale', type: 'Avenant', fileType: 'PDF', pages: 4, size: '620 Ko', author: 'Sophie Martin', createdAt: '2 sept. 2024', viewedAt: 'Hier', status: 'ready',
    passages: [
      { id: 'av1-p2', page: 2, title: 'Article 2 — Territoire', text: "À compter du 1er octobre 2024, le territoire exclusif est étendu aux régions Bretagne et Pays de la Loire. Les autres stipulations du contrat, notamment celles relatives à sa durée et à sa résiliation, demeurent inchangées." },
      { id: 'av1-p4', page: 4, title: 'Signatures', text: "Fait à Lyon, le 2 septembre 2024, en deux exemplaires originaux. Pour Delmas Industrie : Claire Delmas. Pour Nova Distribution : Julien Moreau." },
    ],
  },
  {
    id: 'avenant-objectifs', folderId: 'delmas', title: 'Avenant n° 2 — Objectifs commerciaux', type: 'Avenant', fileType: 'DOCX', pages: 5, size: '184 Ko', author: 'Sophie Martin', createdAt: '17 janv. 2025', viewedAt: '3 nov. 2026', status: 'ready',
    passages: [
      { id: 'av2-p2', page: 2, title: 'Objectifs annuels', text: "Le chiffre d'affaires net annuel minimum est fixé à 1 200 000 euros pour l'exercice 2025. L'objectif sera révisé chaque année par accord écrit au plus tard le 31 janvier." },
      { id: 'av2-p4', page: 4, title: 'Conséquence du défaut', text: "Le défaut d'atteinte de l'objectif sur deux trimestres consécutifs constitue un manquement susceptible de mise en demeure. Il ne permet pas, à lui seul, une résiliation immédiate et demeure soumis à la procédure de l'article 12.2 du contrat." },
    ],
  },
  {
    id: 'mise-en-demeure', folderId: 'delmas', title: 'Mise en demeure — Objectifs T2/T3', type: 'Courrier', fileType: 'PDF', pages: 3, size: '740 Ko', author: 'Cabinet Montreuil & Associés', createdAt: '6 oct. 2025', viewedAt: '31 oct. 2026', status: 'ready',
    passages: [
      { id: 'med-p1', page: 1, title: 'Objet', text: "Nous constatons que les objectifs minimaux n'ont pas été atteints au deuxième et au troisième trimestre 2025. La présente vaut mise en demeure au sens de l'article 12.2 du contrat de distribution exclusive." },
      { id: 'med-p2', page: 2, title: 'Délai de régularisation', text: "Nous vous demandons de transmettre, dans un délai de trente jours à compter de la réception du présent courrier, un plan correctif chiffré et les justificatifs des actions commerciales engagées." },
    ],
  },
  {
    id: 'pv-reunion', folderId: 'delmas', title: 'Procès-verbal — Réunion du 12 septembre 2025', type: 'Procès-verbal', fileType: 'PDF', pages: 6, size: '1,1 Mo', author: 'Élodie Bernard', createdAt: '15 sept. 2025', viewedAt: '28 oct. 2026', status: 'ready',
    passages: [
      { id: 'pv-p3', page: 3, title: 'Situation commerciale', text: "Nova Distribution reconnaît un retard de 18 % sur l'objectif cumulé. Les parties conviennent d'un plan de relance jusqu'au 31 décembre 2025, sans renonciation du Fournisseur à ses droits contractuels." },
      { id: 'pv-p5', page: 5, title: 'Actions convenues', text: "Le Distributeur adressera un reporting bimensuel. Une nouvelle réunion de suivi est fixée au 15 décembre 2025. Aucune modification de la procédure de résiliation n'est décidée." },
    ],
  },
  {
    id: 'bail', folderId: 'orion', title: 'Bail commercial — 18 rue Royale', type: 'Contrat', fileType: 'PDF', pages: 22, size: '3,2 Mo', author: 'Étude Lemaire', createdAt: '3 juin 2023', viewedAt: '4 nov. 2026', status: 'ready',
    passages: [
      { id: 'bail-p2', page: 2, title: 'Désignation', text: "Les locaux loués sont situés 18 rue Royale à Lille et comprennent 310 mètres carrés de bureaux ainsi que six emplacements de stationnement en sous-sol." },
      { id: 'bail-p14', page: 14, title: 'Loyer et indexation', text: "Le loyer annuel hors taxes et hors charges est fixé à 84 000 euros. Il sera indexé chaque année au 1er juillet selon la variation de l'indice des loyers des activités tertiaires." },
    ],
  },
  {
    id: 'echeances', folderId: 'orion', title: 'État des échéances et indexations', type: 'Annexe', fileType: 'PDF', pages: 3, size: '390 Ko', author: 'Orion Conseil', createdAt: '1 juil. 2026', viewedAt: '30 oct. 2026', status: 'ready',
    passages: [{ id: 'ech-p1', page: 1, title: 'Échéancier 2026', text: "Les loyers sont payables trimestriellement d'avance aux 1er janvier, 1er avril, 1er juillet et 1er octobre. Le montant trimestriel après indexation 2026 s'élève à 22 146 euros hors taxes." }],
  },
  {
    id: 'nda', folderId: 'helios', title: 'Accord de confidentialité bilatéral', type: 'Contrat', fileType: 'PDF', pages: 9, size: '980 Ko', author: 'Direction juridique Helios', createdAt: '18 févr. 2026', viewedAt: '29 oct. 2026', status: 'ready',
    passages: [
      { id: 'nda-p3', page: 3, title: 'Informations confidentielles', text: "Sont confidentielles toutes informations techniques, commerciales, financières ou stratégiques communiquées par écrit, oralement ou par accès aux systèmes, qu'elles soient ou non marquées confidentielles." },
      { id: 'nda-p7', page: 7, title: 'Durée', text: "Les obligations de confidentialité demeureront en vigueur pendant cinq ans à compter de chaque divulgation. Les secrets d'affaires resteront protégés aussi longtemps qu'ils conserveront cette qualification." },
    ],
  },
]

export const citations: Citation[] = [
  { id: 'cit-convenance', documentId: 'distribution', page: 18, passageId: 'dist-p18', label: 'Contrat, art. 12.1, p. 18' },
  { id: 'cit-manquement', documentId: 'distribution', page: 19, passageId: 'dist-p19', label: 'Contrat, art. 12.2, p. 19' },
  { id: 'cit-immediate', documentId: 'distribution', page: 20, passageId: 'dist-p20', label: 'Contrat, art. 12.3, p. 20' },
  { id: 'cit-effets', documentId: 'distribution', page: 22, passageId: 'dist-p22', label: 'Contrat, art. 13, p. 22' },
  { id: 'cit-objectifs', documentId: 'avenant-objectifs', page: 4, passageId: 'av2-p4', label: 'Avenant n° 2, p. 4' },
  { id: 'cit-mise', documentId: 'mise-en-demeure', page: 2, passageId: 'med-p2', label: 'Mise en demeure, p. 2' },
]

export const initialConversations: Conversation[] = [
  { id: 'conv-1', title: 'Conditions de résiliation', folderId: 'delmas', updatedAt: 'Aujourd’hui, 09:46', messages: [] },
  { id: 'conv-2', title: 'Échéances du bail commercial', folderId: 'orion', updatedAt: '4 nov. 2026', messages: [] },
  { id: 'conv-3', title: 'Durée de la confidentialité', folderId: 'helios', updatedAt: '29 oct. 2026', messages: [] },
]

export const suggestedQuestions = [
  'Quelles sont les conditions de résiliation prévues dans ce contrat ?',
  'Quelles obligations subsistent après la résiliation ?',
  'Le contrat prévoit-il une assurance cyber avec un plafond de cinq millions d’euros ?',
]

export const getDocument = (id: string) => documents.find((document) => document.id === id)
export const getFolder = (id: string) => folders.find((folder) => folder.id === id)
export const getCitation = (id: string) => citations.find((citation) => citation.id === id)
