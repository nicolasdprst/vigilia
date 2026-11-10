import type { AssistantAnswer } from '../types'

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

export interface AssistantService {
  ask(question: string, folderId: string): Promise<AssistantAnswer>
}

export const demoAssistantService: AssistantService = {
  async ask(question, folderId) {
    await wait(900)
    const normalized = question.toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

    if (folderId === 'delmas' && /(resili|mettre fin|rompre)/.test(normalized)) {
      return {
        title: 'Conditions de résiliation du contrat',
        intro: "Le contrat prévoit trois régimes de résiliation distincts. Leur application dépend du moment de la rupture et de la nature du motif invoqué.",
        sections: [
          { heading: 'Résiliation sans motif', body: "Après la période initiale de trois ans, chaque partie peut résilier sans avoir à justifier d’un motif. Elle doit notifier sa décision par lettre recommandée avec accusé de réception et respecter un préavis de six mois.", citations: ['cit-convenance'] },
          { heading: 'Résiliation pour manquement', body: "En cas de manquement grave ou répété, la résiliation intervient trente jours après une mise en demeure restée sans effet. Cette mise en demeure doit décrire précisément le manquement et viser l’article 12.2.", citations: ['cit-manquement', 'cit-objectifs'] },
          { heading: 'Résiliation immédiate', body: "Aucun préavis n’est requis en cas de cessation d’activité, de liquidation judiciaire, d’atteinte grave à la réputation de la marque ou de violation de la confidentialité, sous réserve des règles impératives applicables.", citations: ['cit-immediate'] },
          { heading: 'Conséquences principales', body: "Le distributeur doit cesser l’usage des signes distinctifs. Les commandes déjà acceptées sont en principe exécutées et le stock résiduel peut être écoulé pendant 90 jours.", citations: ['cit-effets'] },
        ],
        caution: "La qualification d’un manquement et le respect formel de la mise en demeure doivent être vérifiés au regard des faits du dossier.",
      }
    }

    if (folderId === 'delmas' && /(subsist|apres la resiliation|effet)/.test(normalized)) {
      return {
        title: 'Obligations après la résiliation',
        intro: 'Le contrat organise une période de sortie limitée et encadre la fin de la relation commerciale.',
        sections: [
          { heading: 'Marque et commandes', body: "Le distributeur cesse d’utiliser les signes distinctifs de Delmas Industrie. Les commandes acceptées avant la prise d’effet restent exécutées, sauf accord écrit contraire.", citations: ['cit-effets'] },
          { heading: 'Stock résiduel', body: "Le stock restant peut être écoulé pendant une période maximale de quatre-vingt-dix jours.", citations: ['cit-effets'] },
        ],
      }
    }

    if (folderId === 'orion' && /(loyer|echeance|bail|index)/.test(normalized)) {
      return {
        title: 'Échéances du bail commercial', intro: 'Le bail fixe un loyer annuel de 84 000 € HT, indexé chaque année au 1er juillet.',
        sections: [{ heading: 'Paiement', body: "Les loyers sont payables trimestriellement d’avance. Après indexation 2026, chaque échéance s’élève à 22 146 € HT.", citations: [] }],
      }
    }

    if (folderId === 'helios' && /(duree|confidential)/.test(normalized)) {
      return {
        title: 'Durée des obligations de confidentialité', intro: 'La durée dépend de la nature de l’information protégée.',
        sections: [{ heading: 'Durée contractuelle', body: "L’obligation générale s’applique pendant cinq ans à compter de chaque divulgation. Les secrets d’affaires restent protégés aussi longtemps qu’ils conservent cette qualification.", citations: [] }],
      }
    }

    return {
      title: 'Information non trouvée dans le dossier',
      intro: "Je n’ai trouvé aucun passage permettant d’établir cette information dans les documents sélectionnés.",
      sections: [{ heading: 'Documents vérifiés', body: "La recherche a porté sur l’ensemble des documents indexés du dossier. Je préfère ne pas formuler de réponse sans source documentaire suffisante.", citations: [] }],
      caution: "Vous pouvez reformuler la question, élargir le périmètre documentaire ou importer un document complémentaire.",
    }
  },
}
