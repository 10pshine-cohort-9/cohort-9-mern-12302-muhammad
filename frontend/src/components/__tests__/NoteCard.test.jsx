import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NoteCard from '../NoteCard';

jest.mock('../../hooks/useAuthenticatedMedia', () => jest.fn(() => null));

const baseNote = {
  id: 1,
  title: 'Grocery list',
  content: '<p>Milk, eggs</p>',
  tags: 'home, errands',
  type: 'text',
  updated_at: '2026-01-15T10:00:00.000Z',
};

describe('NoteCard', () => {
  it('renders the note title, content preview and tags', () => {
    render(<NoteCard note={baseNote} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('Grocery list')).toBeInTheDocument();
    expect(screen.getByText('Milk, eggs')).toBeInTheDocument();
    expect(screen.getByText('home')).toBeInTheDocument();
    expect(screen.getByText('errands')).toBeInTheDocument();
  });

  it('shows a placeholder when the note has no content', () => {
    render(<NoteCard note={{ ...baseNote, content: '<p><br></p>' }} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('No content')).toBeInTheDocument();
  });

  it('strips disallowed tags/attributes from the content preview', () => {
    const note = { ...baseNote, content: '<p onclick="alert(1)"><script>alert(1)</script><b>Bold</b></p>' };
    render(<NoteCard note={note} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText('Bold').tagName).toBe('B');
    expect(document.querySelector('script')).not.toBeInTheDocument();
  });

  it('calls onEdit with the note when the edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<NoteCard note={baseNote} onEdit={onEdit} onDelete={jest.fn()} />);

    fireEvent.click(screen.getByTitle('Edit Note'));

    expect(onEdit).toHaveBeenCalledWith(baseNote);
  });

  it('calls onDelete with the note id when the delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<NoteCard note={baseNote} onEdit={jest.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByTitle('Delete Note'));

    expect(onDelete).toHaveBeenCalledWith(baseNote.id);
  });
});
