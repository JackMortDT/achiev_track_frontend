import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renders a progressbar with correct aria values', () => {
    render(<ProgressBar value={5} max={10} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '5')
    expect(bar).toHaveAttribute('aria-valuemax', '10')
  })

  it('shows 50% when value is half of max', () => {
    render(<ProgressBar value={5} max={10} />)
    expect(screen.getByText('5 / 10 (50%)')).toBeInTheDocument()
  })

  it('shows 100% when value equals max', () => {
    render(<ProgressBar value={10} max={10} />)
    expect(screen.getByText('10 / 10 (100%)')).toBeInTheDocument()
  })

  it('handles zero max without dividing by zero', () => {
    render(<ProgressBar value={0} max={0} />)
    expect(screen.getByText('0 / 0 (0%)')).toBeInTheDocument()
  })

  it('hides the label when showLabel is false', () => {
    render(<ProgressBar value={5} max={10} showLabel={false} />)
    expect(screen.queryByText("50%")).toBeNull()
  })
})
