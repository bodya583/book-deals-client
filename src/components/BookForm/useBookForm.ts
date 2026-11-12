import { useState, useEffect, useRef } from 'react';
import type { Book, BookFormData, Genre } from '../../types/book';
import { getGenres } from '../../api/booksApi';
import { uploadBookCover } from '../../api/uploadApi';
import { useTranslation, dictionaries } from '../../i18n';

interface UseBookFormParams {
  mode: 'create' | 'edit';
  initialBook?: Book | null;
  onClose: () => void;
  onSubmit: (formData: BookFormData) => Promise<void>;
}

export const useBookForm = ({ mode, initialBook, onClose, onSubmit }: UseBookFormParams) => {
  const { t, language: currentLang, tApiError } = useTranslation();
  const defaultPopular = dictionaries.en.bookForm.popularGenres;

  const [title, setTitle] = useState(mode === 'edit' && initialBook ? initialBook.title || '' : '');
  const [author, setAuthor] = useState(mode === 'edit' && initialBook ? initialBook.author || '' : '');
  const [description, setDescription] = useState(
    mode === 'edit' && initialBook ? initialBook.description || '' : ''
  );
  const [coverURL, setCoverURL] = useState(
    mode === 'edit' && initialBook ? initialBook.coverURL || '' : ''
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [language, setLanguage] = useState(
    mode === 'edit' && initialBook?.language ? initialBook.language : ''
  );
  const [year, setYear] = useState(
    mode === 'edit' && initialBook?.year ? String(initialBook.year) : ''
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    mode === 'edit' && initialBook?.genres ? initialBook.genres.map((g) => g.name) : []
  );
  const [availableGenres, setAvailableGenres] = useState<string[]>(defaultPopular);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    getGenres()
      .then((data: Genre[]) => {
        if (isMounted && data?.length > 0) {
          setAvailableGenres(data.map((g) => g.name));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [loading, onClose]);

  const toggleGenre = (genreName: string) =>
    setSelectedGenres((prev) =>
      prev.includes(genreName) ? prev.filter((g) => g !== genreName) : [...prev, genreName]
    );

  const removeGenre = (genreName: string) =>
    setSelectedGenres((prev) => prev.filter((g) => g !== genreName));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setPreviewError(false);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setCoverURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearCover = () => {
    setSelectedFile(null);
    setCoverURL('');
    setSelectedFileName('');
    setPreviewError(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError(t('bookForm.errTitleRequired'));
    if (!author.trim()) return setError(t('bookForm.errAuthorRequired'));

    setError('');
    setLoading(true);
    try {
      let finalCoverURL = coverURL.trim();
      if (selectedFile) {
        setLoadingStatus(t('bookForm.uploadingCover'));
        try {
          const uploadRes = await uploadBookCover(selectedFile);
          finalCoverURL = uploadRes.url;
        } catch (uploadErr: any) {
          const msg = uploadErr?.response?.data?.message || uploadErr?.message || t('bookForm.errUploadFailed');
          setError(tApiError(msg));
          return;
        }
      } else if (finalCoverURL.startsWith('data:')) {
        finalCoverURL = '';
      }

      setLoadingStatus(t('bookForm.savingBook'));
      await onSubmit({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        coverURL: finalCoverURL,
        language: language.trim() || undefined,
        year: year.trim() && !isNaN(parseInt(year.trim(), 10)) ? parseInt(year.trim(), 10) : undefined,
        genres: selectedGenres,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('bookForm.errSaveFailed');
      setError(tApiError(msg));
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return {
    currentLang,
    fields: { title, setTitle, author, setAuthor, description, setDescription, language, setLanguage, year, setYear },
    genres: { selected: selectedGenres, available: availableGenres, toggle: toggleGenre, remove: removeGenre },
    cover: { url: coverURL, fileName: selectedFileName, previewError, setPreviewError, fileInputRef, handleFileChange, clear: clearCover },
    status: { loading, loadingStatus, error },
    handleSubmit,
  };
};
