import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HabitForm from './HabitForm'

describe('HabitForm', () => {
  it('submits the entered habit payload', () => {
    const onAdd = vi.fn()
    render(<HabitForm onAdd={onAdd} />)

    fireEvent.change(screen.getByPlaceholderText('Habit name'), { target: { value: 'Read 20 pages' } })
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), { target: { value: 'Daily reading' } })
    fireEvent.click(screen.getByText('Add Habit'))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onAdd.mock.calls[0][0].name).toBe('Read 20 pages')
    expect(onAdd.mock.calls[0][0].description).toBe('Daily reading')
    expect(onAdd.mock.calls[0][0].completed).toBe(false)
  })
})
