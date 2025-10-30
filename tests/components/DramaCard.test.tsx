import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DramaCard from '@/components/DramaCard'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

// Mock DramaVoting component
vi.mock('@/components/DramaVoting', () => ({
  default: () => <div data-testid="drama-voting">Voting Component</div>,
}))

const mockDrama = {
  id: '1',
  title: 'Test Drama',
  details: 'This is a test drama with details',
  severity: 3,
  createdAt: new Date('2024-01-15'),
  isFinished: false,
  participants: [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
  ],
}

describe('DramaCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
  })

  it('should render drama title and participants', () => {
    render(<DramaCard drama={mockDrama} />)

    expect(screen.getByText('Test Drama')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('should show severity badge', () => {
    render(<DramaCard drama={mockDrama} />)

    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument()
  })

  it('should not show details when collapsed', () => {
    render(<DramaCard drama={mockDrama} />)

    expect(screen.queryByText('This is a test drama with details')).not.toBeInTheDocument()
  })

  it('should show details when expanded via toggle button', async () => {
    render(<DramaCard drama={mockDrama} />)

    const toggleButton = screen.getByTitle('Expand')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText('This is a test drama with details')).toBeInTheDocument()
    })
  })

  it('should hide details when collapsed via toggle button', async () => {
    render(<DramaCard drama={mockDrama} />)

    // First expand
    const expandButton = screen.getByTitle('Expand')
    fireEvent.click(expandButton)

    await waitFor(() => {
      expect(screen.getByText('This is a test drama with details')).toBeInTheDocument()
    })

    // Then collapse
    const collapseButton = screen.getByTitle('Collapse')
    fireEvent.click(collapseButton)

    await waitFor(() => {
      expect(screen.queryByText('This is a test drama with details')).not.toBeInTheDocument()
    })
  })

  it('should show voting component when expanded', async () => {
    render(<DramaCard drama={mockDrama} />)

    expect(screen.queryByTestId('drama-voting')).not.toBeInTheDocument()

    const toggleButton = screen.getByTitle('Expand')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByTestId('drama-voting')).toBeInTheDocument()
    })
  })

  it('should display finished badge for finished dramas', () => {
    const finishedDrama = { ...mockDrama, isFinished: true }
    render(<DramaCard drama={finishedDrama} />)

    expect(screen.getByText('✓ FINISHED')).toBeInTheDocument()
  })

  it('should show pending badge when not all voted', () => {
    const pendingDrama = {
      ...mockDrama,
      totalParticipants: 5,
      totalVotes: 2,
      allVoted: false,
    }
    render(<DramaCard drama={pendingDrama} />)

    expect(screen.getByText('⏳ PENDING')).toBeInTheDocument()
  })

  it('should call delete API when delete button clicked', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
    } as Response)

    render(<DramaCard drama={mockDrama} />)

    const deleteButton = screen.getByTitle('Delete drama')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/dramas/${mockDrama.id}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  it('should show alert on delete failure', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
    } as Response)

    render(<DramaCard drama={mockDrama} />)

    const deleteButton = screen.getByTitle('Delete drama')
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to delete drama. Please try again.')
    })
  })

  it('should toggle finish status when finish button clicked', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
    } as Response)

    render(<DramaCard drama={mockDrama} />)

    const finishButton = screen.getByTitle('Mark as finished')
    fireEvent.click(finishButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/dramas/${mockDrama.id}/finish`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ isFinished: true }),
        })
      )
    })
  })

  it('should display created date when expanded', async () => {
    render(<DramaCard drama={mockDrama} />)

    const toggleButton = screen.getByTitle('Expand')
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByText(/Created: Jan/i)).toBeInTheDocument()
    })
  })

  it('should have edit link', () => {
    render(<DramaCard drama={mockDrama} />)

    const editLink = screen.getByTitle('Edit drama')
    expect(editLink).toHaveAttribute('href', `/drama/edit/${mockDrama.id}`)
  })
})
