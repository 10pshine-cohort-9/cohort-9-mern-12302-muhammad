import api from '../api';
import { getNotes, createNote, updateNote, deleteNote } from '../notes.service';

jest.mock('../api');

describe('notes.service', () => {
  it('getNotes fetches the notes list', async () => {
    const notes = [{ id: 1, title: 'First note' }];
    api.get.mockResolvedValueOnce({ data: notes });

    const result = await getNotes();

    expect(api.get).toHaveBeenCalledWith('/notes');
    expect(result).toEqual(notes);
  });

  it('createNote sends plain JSON when there is no media attachment', async () => {
    const noteData = { title: 'Todo', content: '<p>hi</p>', tags: 'a,b', type: 'text' };
    api.post.mockResolvedValueOnce({ data: { id: 1, ...noteData } });

    await createNote(noteData);

    expect(api.post).toHaveBeenCalledWith(
      '/notes',
      { title: 'Todo', content: '<p>hi</p>', tags: 'a,b', type: 'text', mediaAction: 'keep' },
      undefined
    );
  });

  it('createNote builds multipart form data when media is present', async () => {
    const media = new Blob(['fake-audio'], { type: 'audio/webm' });
    api.post.mockResolvedValueOnce({ data: { id: 2 } });

    await createNote({ title: 'Voice note', content: '', tags: '', type: 'voice', media });

    expect(api.post).toHaveBeenCalledTimes(1);
    const [url, formData, config] = api.post.mock.calls[0];
    expect(url).toBe('/notes');
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('title')).toBe('Voice note');
    expect(formData.get('type')).toBe('voice');
    expect(formData.get('mediaAction')).toBe('keep');
    expect(formData.get('media').name).toBe('recording.webm');
    expect(config.headers['Content-Type']).toBe('multipart/form-data');
  });

  it('updateNote puts to the note id endpoint', async () => {
    api.put.mockResolvedValueOnce({ data: { id: 5, title: 'Updated' } });

    const result = await updateNote(5, { title: 'Updated', content: '', tags: '', type: 'text' });

    expect(api.put).toHaveBeenCalledWith(
      '/notes/5',
      { title: 'Updated', content: '', tags: '', type: 'text', mediaAction: 'keep' },
      undefined
    );
    expect(result).toEqual({ id: 5, title: 'Updated' });
  });

  it('deleteNote calls delete on the note id endpoint', async () => {
    api.delete.mockResolvedValueOnce({ data: { success: true } });

    const result = await deleteNote(7);

    expect(api.delete).toHaveBeenCalledWith('/notes/7');
    expect(result).toEqual({ success: true });
  });
});
