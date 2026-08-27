import api from './api';

export const getNotes = async () => {
  const response = await api.get('/notes');
  return response.data;
};

const buildNotePayload = ({ title, content, tags, type, media }) => {
  if (!media) {
    return { data: { title, content, tags, type }, headers: undefined };
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content || '');
  formData.append('tags', tags || '');
  formData.append('type', type || 'text');
  const extension = media.type.split('/')[1] || 'webm';
  formData.append('media', media, `recording.${extension}`);

  return { data: formData, headers: { 'Content-Type': 'multipart/form-data' } };
};

export const createNote = async (noteData) => {
  const { data, headers } = buildNotePayload(noteData);
  const response = await api.post('/notes', data, headers ? { headers } : undefined);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const { data, headers } = buildNotePayload(noteData);
  const response = await api.put(`/notes/${id}`, data, headers ? { headers } : undefined);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};
