// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import App from './App'

describe('démarrage de VIGILIA', () => {
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('monte et démonte l’application quand le backend local est absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    const view = render(<App />)
    expect(await screen.findByText(/Bonjour Maître Martin/i)).toBeTruthy()
    expect(() => view.unmount()).not.toThrow()
  })
})
