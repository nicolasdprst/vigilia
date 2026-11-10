import { afterEach, describe, expect, it, vi } from 'vitest'
import { localAssistantService, resilientAssistantService } from './localAssistant'

describe('localAssistantService', () => {
  afterEach(() => vi.restoreAllMocks())

  it('rend les identifiants de citations uniques pour chaque réponse', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(42)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      title: 'Réponse', intro: 'Introduction',
      sections: [{ heading: 'Règle', body: 'Texte [S1]', citations: ['S1'] }],
      sources: [{ id: 'S1', documentId: 'code', passageId: 'p1', page: 1, label: 'Article 1' }],
      meta: { mode: 'local' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    const answer = await localAssistantService.ask('Question juridique', 'legislation')

    expect(answer.sources?.[0].id).toBe('src-42-S1')
    expect(answer.sections[0].citations).toEqual(['src-42-S1'])
  })

  it('ne produit jamais de réponse de démonstration pour la législation', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(resilientAssistantService.ask('Question juridique', 'legislation'))
      .rejects.toThrow('Le serveur interne du cabinet ne répond pas')
  })
})
