import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HabitList from './HabitList'

describe('HabitList', () => {
  it('renders habits and calls callbacks', () => {
    const onToggle = vi.fn()
    const onDelete = vi.fn()
    render(
      <HabitList
        habits={[{ id: 1, name: 'Meditate', description: 'Morning session', completed: false, icon: '🧘', color: '#7C3AED', meta: { category: 'Mindfulness', frequency: 'daily' } }]}
        onToggle={onToggle}
        onDelete={onDelete}
      />
    )

    expect(screen.getByText('Meditate')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Mark'))
    fireEvent.click(screen.getByText('Delete'))

    expect(onToggle).toHaveBeenCalledWith(1)
    expect(onDelete).toHaveBeenCalledWith(1)
  })
})
