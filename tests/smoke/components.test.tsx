import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

describe('Smoke Tests - Component Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    global.confirm = vi.fn(() => true)
    global.alert = vi.fn()
  })

  const mockDrama = {
    id: '1',
    title: 'Test Drama',
    details: 'Test details',
    severity: 3,
    createdAt: new Date('2024-01-15'),
    isFinished: false,
    participants: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
  }

  it('should render DramaCard without crashing', () => {
    render(<DramaCard drama={mockDrama} />)
    expect(screen.getByText('Test Drama')).toBeInTheDocument()
  })

  it('should render participant names', () => {
    render(<DramaCard drama={mockDrama} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('should show severity badge', () => {
    render(<DramaCard drama={mockDrama} />)
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument()
  })

  it('should render finished drama correctly', () => {
    const finishedDrama = { ...mockDrama, isFinished: true }
    render(<DramaCard drama={finishedDrama} />)
    expect(screen.getByText('✓ FINISHED')).toBeInTheDocument()
  })
})
