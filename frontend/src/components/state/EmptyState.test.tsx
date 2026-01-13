import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/utils'
import EmptyState from './EmptyState'
import { Plus } from 'lucide-react'

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        icon={Plus}
        title="Test Title"
        description="Test Description"
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        icon={Plus}
        title="Test Title"
        description="Test Description"
        action={{
          label: 'Click Me',
          onClick: handleClick,
        }}
      />
    )

    const button = screen.getByRole('button', { name: 'Click Me' })
    expect(button).toBeInTheDocument()
  })

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        icon={Plus}
        title="Test Title"
        description="Test Description"
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should call action onClick when button is clicked', () => {
    const handleClick = vi.fn()
    render(
      <EmptyState
        icon={Plus}
        title="Test Title"
        description="Test Description"
        action={{
          label: 'Click Me',
          onClick: handleClick,
        }}
      />
    )

    const button = screen.getByRole('button', { name: 'Click Me' })
    button.click()

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
