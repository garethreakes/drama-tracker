import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddFriendForm from '@/components/AddFriendForm'

describe('AddFriendForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('should render the form', () => {
    render(<AddFriendForm />)

    expect(screen.getByLabelText(/friend name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add friend/i })).toBeInTheDocument()
  })

  it('should disable submit button when name is empty', () => {
    render(<AddFriendForm />)

    const button = screen.getByRole('button', { name: /add friend/i })
    expect(button).toBeDisabled()
  })

  it('should enable submit button when name is entered', () => {
    render(<AddFriendForm />)

    const input = screen.getByLabelText(/friend name/i)
    const button = screen.getByRole('button', { name: /add friend/i })

    fireEvent.change(input, { target: { value: 'Alice' } })

    expect(button).not.toBeDisabled()
  })

  it('should show error message on failed submission', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'A person with this name already exists' }),
    } as Response)

    render(<AddFriendForm />)

    const input = screen.getByLabelText(/friend name/i)
    const button = screen.getByRole('button', { name: /add friend/i })

    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/a person with this name already exists/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess on successful submission', async () => {
    const onSuccess = vi.fn()

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Alice', createdAt: new Date() }),
    } as Response)

    render(<AddFriendForm onSuccess={onSuccess} />)

    const input = screen.getByLabelText(/friend name/i)
    const button = screen.getByRole('button', { name: /add friend/i })

    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should clear input on successful submission', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Alice', createdAt: new Date() }),
    } as Response)

    render(<AddFriendForm />)

    const input = screen.getByLabelText(/friend name/i) as HTMLInputElement
    const button = screen.getByRole('button', { name: /add friend/i })

    fireEvent.change(input, { target: { value: 'Alice' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })
})
