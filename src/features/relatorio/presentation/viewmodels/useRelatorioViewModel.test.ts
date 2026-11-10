import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from '../../../../core/api/apiClient'
import type { RelatorioResultado } from '../../domain/entities/RelatorioResultado'
import type { RelatorioRepository } from '../../domain/repositories/RelatorioRepository'
import { useRelatorioViewModel } from './useRelatorioViewModel'

const result: RelatorioResultado = {
    colunas: ['mes', 'vendas'],
    linhas: [['Janeiro', 100]],
    estatisticas: {
        totalRegistros: 1,
        colunasNumericas: {
            vendas: { soma: 100, media: 100, minimo: 100, maximo: 100, desvioPadrao: 0 },
        },
    },
    graficoSugerido: { tipo: 'bar', eixoX: 'mes', eixoY: 'vendas' },
}

function createRepository(): RelatorioRepository {
    return { gerarRelatorioIA: vi.fn<RelatorioRepository['gerarRelatorioIA']>() }
}

describe('useRelatorioViewModel', () => {
    it('returns the generated report on success', async () => {
        const repository = createRepository()
        vi.mocked(repository.gerarRelatorioIA).mockResolvedValue(result)
        const { result: viewModel } = renderHook(() => useRelatorioViewModel(repository))

        await act(async () => viewModel.current.gerarRelatorio('  vendas por mês  '))

        expect(repository.gerarRelatorioIA).toHaveBeenCalledWith('vendas por mês')
        expect(viewModel.current.data).toEqual(result)
        expect(viewModel.current.loading).toBe(false)
        expect(viewModel.current.syncStatus).toBe('synced')
        expect(viewModel.current.error).toBeNull()
    })

    it('maps HTTP errors to localized messages', async () => {
        const repository = createRepository()
        vi.mocked(repository.gerarRelatorioIA).mockRejectedValue(new ApiRequestError('service unavailable', 503))
        const { result: viewModel } = renderHook(() => useRelatorioViewModel(repository))

        await act(async () => viewModel.current.gerarRelatorio('vendas'))

        expect(viewModel.current.error).toBe('O serviço de relatórios está indisponível no momento. Tente novamente mais tarde.')
        expect(viewModel.current.syncStatus).toBe('error')
        expect(viewModel.current.data).toBeNull()
    })

    it('maps invalid-question HTTP errors to a localized message', async () => {
        const repository = createRepository()
        vi.mocked(repository.gerarRelatorioIA).mockRejectedValue(new ApiRequestError('invalid question', 400))
        const { result: viewModel } = renderHook(() => useRelatorioViewModel(repository))

        await act(async () => viewModel.current.gerarRelatorio('vendas'))

        expect(viewModel.current.error).toBe('Não foi possível entender a pergunta. Reformule e tente novamente.')
        expect(viewModel.current.syncStatus).toBe('error')
    })

    it('rejects an empty question without calling the repository', async () => {
        const repository = createRepository()
        const { result: viewModel } = renderHook(() => useRelatorioViewModel(repository))

        await act(async () => viewModel.current.gerarRelatorio('   '))

        expect(repository.gerarRelatorioIA).not.toHaveBeenCalled()
        expect(viewModel.current.error).toBe('Digite uma pergunta para gerar o relatório.')
        expect(viewModel.current.syncStatus).toBe('error')
    })
})
