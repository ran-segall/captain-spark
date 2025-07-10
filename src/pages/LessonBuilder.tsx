import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const PASSWORD = import.meta.env.VITE_CMS_PASSWORD;

type Course = {
  id: string;
  title: string;
  description: string;
  order: number;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  order: number;
  tag?: string;
};

type Slide = {
  id: string;
  lesson_id: string;
  type: 'video' | 'quiz';
  order: number;
  video_url?: string;
  quiz_question?: string;
  quiz_audio_url?: string;
  quiz_heading?: string;
  quiz_answers?: { text: string; image_url?: string; is_correct: boolean }[];
  quiz_correct_quote?: string;
  quiz_correct_audio_url?: string;
  quiz_wrong_quote?: string;
  quiz_wrong_audio_url?: string;
};

const LessonBuilder: React.FC = () => {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');

  // Course state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCourse, setEditCourse] = useState({ title: '', description: '', order: 1 });

  // Lesson state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({ course_id: '', title: '', order: 1, tag: '' });
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editLesson, setEditLesson] = useState<Partial<Lesson>>({ course_id: '', title: '', order: 1, tag: '' });

  // Slide state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideLoading, setSlideLoading] = useState(false);
  const [slideError, setSlideError] = useState<string | null>(null);
  const [newSlide, setNewSlide] = useState<Partial<Slide>>({ lesson_id: '', type: 'video', order: 1 });
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editSlide, setEditSlide] = useState<Partial<Slide>>({ lesson_id: '', type: 'video', order: 1 });

  // File upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Helper: sanitize names for folder
  function sanitizeName(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  // Helper: get folder for lesson
  function getLessonFolder(lesson: Lesson | Partial<Lesson>, course: Course | undefined) {
    const courseName = course && course.title ? sanitizeName(course.title) : 'course';
    const lessonName = lesson && lesson.title ? sanitizeName(lesson.title) : 'lesson';
    return `${courseName}-${lessonName}-${lesson.id || uuidv4()}`;
  }

  // Helper: upload file to Supabase Storage
  const uploadFile = async (file: File, path: string) => {
    setUploading(true);
    setUploadError(null);
    const { error } = await supabase.storage.from('content').upload(path, file, { upsert: true });
    setUploading(false);
    if (error) {
      setUploadError(error.message);
      return null;
    }
    // Get public URL
    const { data: urlData } = supabase.storage.from('content').getPublicUrl(path);
    return urlData?.publicUrl || null;
  };

  // Fetch courses
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    supabase
      .from('courses')
      .select('*')
      .order('order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setCourses(data || []);
        setLoading(false);
      });
  }, [authed]);

  // Fetch lessons
  useEffect(() => {
    if (!authed) return;
    setLessonLoading(true);
    supabase
      .from('lessons')
      .select('*')
      .order('order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setLessonError(error.message);
        else setLessons(data || []);
        setLessonLoading(false);
      });
  }, [authed]);

  // Fetch slides
  useEffect(() => {
    if (!authed) return;
    setSlideLoading(true);
    supabase
      .from('slides')
      .select('*')
      .order('order', { ascending: true })
      .then(({ data, error }) => {
        if (error) setSlideError(error.message);
        else setSlides(data || []);
        setSlideLoading(false);
      });
  }, [authed]);

  // Delete course
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) setError(error.message);
    else setCourses(prev => prev.filter(c => c.id !== id));
    setLoading(false);
  };

  // Start editing
  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setEditCourse({ title: course.title, description: course.description, order: course.order });
  };

  // Save edit
  const handleEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('courses')
      .update({ ...editCourse })
      .eq('id', id)
      .select();
    if (error) setError(error.message);
    else setCourses(prev => prev.map(c => (c.id === id ? { ...c, ...editCourse } : c)));
    setEditingId(null);
    setLoading(false);
  };

  // Change order
  const moveCourse = async (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= courses.length) return;
    const reordered = [...courses];
    const temp = reordered[idx];
    reordered[idx] = reordered[idx + dir];
    reordered[idx + dir] = temp;
    // Update order in DB
    setLoading(true);
    setError(null);
    await Promise.all(
      reordered.map((c, i) =>
        supabase.from('courses').update({ order: i + 1 }).eq('id', c.id)
      )
    );
    setCourses(reordered.map((c, i) => ({ ...c, order: i + 1 })));
    setLoading(false);
  };

  // Create lesson
  const handleCreateLesson = async () => {
    setLessonLoading(true);
    setLessonError(null);
    const { error } = await supabase
      .from('lessons')
      .insert([{ ...newLesson }])
      .select();
    if (error) setLessonError(error.message);
    // No data returned, so just refetch or optimistically update if needed
    setNewLesson({ course_id: '', title: '', order: 1, tag: '' });
    setLessonLoading(false);
  };

  // Delete lesson
  const handleDeleteLesson = async (id: string) => {
    setLessonLoading(true);
    setLessonError(null);
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) setLessonError(error.message);
    else setLessons(prev => prev.filter(l => l.id !== id));
    setLessonLoading(false);
  };

  // Start editing lesson
  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditLesson({ course_id: lesson.course_id, title: lesson.title, order: lesson.order, tag: lesson.tag || '' });
  };

  // Save edit lesson
  const handleEditLesson = async (id: string) => {
    setLessonLoading(true);
    setLessonError(null);
    const { error } = await supabase
      .from('lessons')
      .update({ ...editLesson })
      .eq('id', id)
      .select();
    if (error) setLessonError(error.message);
    else setLessons(prev => prev.map(l => (l.id === id ? { ...l, ...editLesson } : l)));
    setEditingLessonId(null);
    setLessonLoading(false);
  };

  // Change lesson order within course
  const moveLesson = async (courseId: string, idx: number, dir: -1 | 1) => {
    const courseLessons = lessons.filter(l => l.course_id === courseId);
    if (idx + dir < 0 || idx + dir >= courseLessons.length) return;
    const reordered = [...courseLessons];
    const temp = reordered[idx];
    reordered[idx] = reordered[idx + dir];
    reordered[idx + dir] = temp;
    setLessonLoading(true);
    setLessonError(null);
    await Promise.all(
      reordered.map((l, i) =>
        supabase.from('lessons').update({ order: i + 1 }).eq('id', l.id)
      )
    );
    setLessons(prev => [
      ...prev.filter(l => l.course_id !== courseId),
      ...reordered.map((l, i) => ({ ...l, order: i + 1 })),
    ]);
    setLessonLoading(false);
  };

  // Create slide
  const handleCreateSlide = async () => {
    setSlideLoading(true);
    setSlideError(null);
    const { error } = await supabase
      .from('slides')
      .insert([{ ...newSlide }])
      .select();
    if (error) setSlideError(error.message);
    // No data returned, so just refetch or optimistically update if needed
    setNewSlide({ lesson_id: '', type: 'video', order: 1 });
    setSlideLoading(false);
  };

  // Delete slide
  const handleDeleteSlide = async (id: string) => {
    setSlideLoading(true);
    setSlideError(null);
    const { error } = await supabase.from('slides').delete().eq('id', id);
    if (error) setSlideError(error.message);
    else setSlides(prev => prev.filter(s => s.id !== id));
    setSlideLoading(false);
  };

  // Start editing slide
  const startEditSlide = (slide: Slide) => {
    setEditingSlideId(slide.id);
    setEditSlide({ ...slide });
  };

  // Save edit slide
  const handleEditSlide = async (id: string) => {
    setSlideLoading(true);
    setSlideError(null);
    const { error } = await supabase
      .from('slides')
      .update({ ...editSlide })
      .eq('id', id)
      .select();
    if (error) setSlideError(error.message);
    else setSlides(prev => prev.map(s => (s.id === id ? { ...s, ...editSlide, type: editSlide.type as 'video' | 'quiz' } : s)));
    setEditingSlideId(null);
    setSlideLoading(false);
  };

  // Change slide order within lesson
  const moveSlide = async (lessonId: string, idx: number, dir: -1 | 1) => {
    const lessonSlides = slides.filter(s => s.lesson_id === lessonId);
    if (idx + dir < 0 || idx + dir >= lessonSlides.length) return;
    const reordered = [...lessonSlides];
    const temp = reordered[idx];
    reordered[idx] = reordered[idx + dir];
    reordered[idx + dir] = temp;
    setSlideLoading(true);
    setSlideError(null);
    await Promise.all(
      reordered.map((s, i) =>
        supabase.from('slides').update({ order: i + 1 }).eq('id', s.id)
      )
    );
    setSlides(prev => [
      ...prev.filter(s => s.lesson_id !== lessonId),
      ...reordered.map((s, i) => ({ ...s, order: i + 1, type: s.type as 'video' | 'quiz' })),
    ]);
    setSlideLoading(false);
  };

  if (!authed) {
    return (
      <div style={{ padding: 32 }}>
        <h2>LessonBuilder CMS</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={() => { if (input === PASSWORD) setAuthed(true); }}>Login</button>
        {input && input !== PASSWORD && <div style={{ color: 'red' }}>Wrong password</div>}
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 600 }}>
      <h2>LessonBuilder CMS</h2>
      <h3>Courses</h3>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {courses.map((c, idx) => (
          <li key={c.id} style={{ marginBottom: 8 }}>
            {editingId === c.id ? (
              <>
                <input
                  value={editCourse.title}
                  onChange={e => setEditCourse(ec => ({ ...ec, title: e.target.value }))}
                  placeholder="Title"
                />
                <input
                  value={editCourse.description}
                  onChange={e => setEditCourse(ec => ({ ...ec, description: e.target.value }))}
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={editCourse.order}
                  onChange={e => setEditCourse(ec => ({ ...ec, order: Number(e.target.value) }))}
                  placeholder="Order"
                  style={{ width: 60 }}
                />
                <button onClick={() => handleEdit(c.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <b>{c.title}</b> ({c.description}) [Order: {c.order}]
                <button onClick={() => moveCourse(idx, -1)} disabled={idx === 0}>↑</button>
                <button onClick={() => moveCourse(idx, 1)} disabled={idx === courses.length - 1}>↓</button>
                <button onClick={() => startEdit(c)}>Edit</button>
                <button onClick={() => handleDelete(c.id)}>Delete</button>
              </>
            )}
            {/* Lessons for this course */}
            <div style={{ marginLeft: 24 }}>
              <h4>Lessons</h4>
              {lessonLoading && <div>Loading...</div>}
              {lessonError && <div style={{ color: 'red' }}>{lessonError}</div>}
              <ul>
                {lessons.filter(l => l.course_id === c.id).sort((a, b) => a.order - b.order).map((l, lidx, arr) => (
                  <li key={l.id} style={{ marginBottom: 4 }}>
                    {editingLessonId === l.id ? (
                      <>
                        <input
                          value={typeof editLesson.title === 'string' ? editLesson.title : ''}
                          onChange={e => setEditLesson(el => ({ ...el, title: e.target.value }))}
                          placeholder="Lesson Title"
                        />
                        <input
                          type="number"
                          value={typeof editLesson.order === 'number' ? editLesson.order : 1}
                          onChange={e => setEditLesson(el => ({ ...el, order: Number(e.target.value) }))}
                          placeholder="Order"
                          style={{ width: 60 }}
                        />
                        <input
                          value={typeof editLesson.tag === 'string' ? editLesson.tag : ''}
                          onChange={e => setEditLesson(el => ({ ...el, tag: e.target.value }))}
                          placeholder="Tag (e.g. Earning Money)"
                          style={{ width: 160 }}
                        />
                        <button onClick={() => handleEditLesson(l.id)}>Save</button>
                        <button onClick={() => setEditingLessonId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        {l.title} {l.tag ? <span style={{ background: '#ffeccc', borderRadius: 16, padding: '2px 12px', marginLeft: 8, fontSize: 14 }}>{l.tag}</span> : null} [Order: {l.order}]
                        <button onClick={() => moveLesson(c.id, lidx, -1)} disabled={lidx === 0}>↑</button>
                        <button onClick={() => moveLesson(c.id, lidx, 1)} disabled={lidx === arr.length - 1}>↓</button>
                        <button onClick={() => startEditLesson(l)}>Edit</button>
                        <button onClick={() => handleDeleteLesson(l.id)}>Delete</button>
                      </>
                    )}
                    {/* Slides for this lesson */}
                    <div style={{ marginLeft: 24 }}>
                      <h5>Slides</h5>
                      {slideLoading && <div>Loading...</div>}
                      {slideError && <div style={{ color: 'red' }}>{slideError}</div>}
                      <ul>
                        {slides.filter(s => s.lesson_id === l.id).sort((a, b) => a.order - b.order).map((s, sidx, sarr) => (
                          <li key={s.id} style={{ marginBottom: 4 }}>
                            {editingSlideId === s.id ? (
                              <>
                                <select
                                  value={editSlide.type === 'video' || editSlide.type === 'quiz' ? editSlide.type : 'video'}
                                  onChange={e => setEditSlide(es => ({ ...es, type: e.target.value as 'video' | 'quiz' }))}
                                >
                                  <option value="video">Video</option>
                                  <option value="quiz">Quiz</option>
                                </select>
                                <input
                                  type="number"
                                  value={typeof editSlide.order === 'number' ? editSlide.order : 1}
                                  onChange={e => setEditSlide(es => ({ ...es, order: Number(e.target.value) }))}
                                  placeholder="Order"
                                  style={{ width: 60 }}
                                />
                                {/* Video upload for video slide */}
                                {editSlide.type === 'video' && (
                                  <div>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={async e => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const lesson = lessons.find(l => l.id === editSlide.lesson_id);
                                        const course = lesson ? courses.find(c => c.id === lesson.course_id) : undefined;
                                        const folder = lesson ? getLessonFolder(lesson, course) : `lesson-${editSlide.lesson_id}`;
                                        const path = `${folder}/videos/${uuidv4()}-${file.name}`;
                                        const url = await uploadFile(file, path);
                                        if (url) setEditSlide(es => ({ ...es, video_url: url }));
                                      }}
                                    />
                                    {editSlide.video_url ? <a href={editSlide.video_url} target="_blank" rel="noopener noreferrer">View Video</a> : null}
                                  </div>
                                )}
                                {/* Quiz fields and uploads */}
                                {editSlide.type === 'quiz' && (
                                  <div style={{ marginTop: 8 }}>
                                    <input
                                      value={typeof editSlide.quiz_question === 'string' ? editSlide.quiz_question : ''}
                                      onChange={e => setEditSlide(es => ({ ...es, quiz_question: e.target.value }))}
                                      placeholder="Quiz Question"
                                    />
                                    {/* Audio upload for question */}
                                    <input
                                      type="file"
                                      accept="audio/*"
                                      onChange={async e => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const lesson = lessons.find(l => l.id === editSlide.lesson_id);
                                        const course = lesson ? courses.find(c => c.id === lesson.course_id) : undefined;
                                        const folder = lesson ? getLessonFolder(lesson, course) : `lesson-${editSlide.lesson_id}`;
                                        const path = `${folder}/quiz-audio/${uuidv4()}-${file.name}`;
                                        const url = await uploadFile(file, path);
                                        if (url) setEditSlide(es => ({ ...es, quiz_audio_url: url }));
                                      }}
                                    />
                                    {editSlide.quiz_audio_url ? <a href={editSlide.quiz_audio_url} target="_blank" rel="noopener noreferrer">Play Audio</a> : null}
                                    <input
                                      value={typeof editSlide.quiz_heading === 'string' ? editSlide.quiz_heading : ''}
                                      onChange={e => setEditSlide(es => ({ ...es, quiz_heading: e.target.value }))}
                                      placeholder="Quiz Heading"
                                    />
                                    {/* Quiz answers management */}
                                    <QuizAnswersEditor
                                      answers={Array.isArray(editSlide.quiz_answers) ? editSlide.quiz_answers : []}
                                      setAnswers={answers => setEditSlide(es => ({ ...es, quiz_answers: answers }))}
                                      lessonId={editSlide.lesson_id || ''}
                                      lessons={lessons}
                                      courses={courses}
                                      sanitizeName={sanitizeName}
                                      uploadFile={uploadFile}
                                    />
                                    {/* Audio for correct/wrong */}
                                    <div style={{ marginTop: 8 }}>
                                      <input
                                        value={typeof editSlide.quiz_correct_quote === 'string' ? editSlide.quiz_correct_quote : ''}
                                        onChange={e => setEditSlide(es => ({ ...es, quiz_correct_quote: e.target.value }))}
                                        placeholder="Correct Quote"
                                      />
                                      <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={async e => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const lesson = lessons.find(l => l.id === editSlide.lesson_id);
                                          const course = lesson ? courses.find(c => c.id === lesson.course_id) : undefined;
                                          const folder = lesson ? getLessonFolder(lesson, course) : `lesson-${editSlide.lesson_id}`;
                                          const path = `${folder}/quiz-correct-audio/${uuidv4()}-${file.name}`;
                                          const url = await uploadFile(file, path);
                                          if (url) setEditSlide(es => ({ ...es, quiz_correct_audio_url: url }));
                                        }}
                                      />
                                      {editSlide.quiz_correct_audio_url ? <a href={editSlide.quiz_correct_audio_url} target="_blank" rel="noopener noreferrer">Play Correct Audio</a> : null}
                                      <input
                                        value={typeof editSlide.quiz_wrong_quote === 'string' ? editSlide.quiz_wrong_quote : ''}
                                        onChange={e => setEditSlide(es => ({ ...es, quiz_wrong_quote: e.target.value }))}
                                        placeholder="Wrong Quote"
                                      />
                                      <input
                                        type="file"
                                        accept="audio/*"
                                        onChange={async e => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          const lesson = lessons.find(l => l.id === editSlide.lesson_id);
                                          const course = lesson ? courses.find(c => c.id === lesson.course_id) : undefined;
                                          const folder = lesson ? getLessonFolder(lesson, course) : `lesson-${editSlide.lesson_id}`;
                                          const path = `${folder}/quiz-wrong-audio/${uuidv4()}-${file.name}`;
                                          const url = await uploadFile(file, path);
                                          if (url) setEditSlide(es => ({ ...es, quiz_wrong_audio_url: url }));
                                        }}
                                      />
                                      {editSlide.quiz_wrong_audio_url ? <a href={editSlide.quiz_wrong_audio_url} target="_blank" rel="noopener noreferrer">Play Wrong Audio</a> : null}
                                    </div>
                                  </div>
                                )}
                                {uploading && <div>Uploading...</div>}
                                {uploadError && <div style={{ color: 'red' }}>{uploadError}</div>}
                                <button onClick={() => handleEditSlide(s.id)}>Save</button>
                                <button onClick={() => setEditingSlideId(null)}>Cancel</button>
                              </>
                            ) : (
                              <>
                                {s.type} [Order: {s.order}]
                                <button onClick={() => moveSlide(l.id, sidx, -1)} disabled={sidx === 0}>↑</button>
                                <button onClick={() => moveSlide(l.id, sidx, 1)} disabled={sidx === sarr.length - 1}>↓</button>
                                <button onClick={() => startEditSlide(s)}>Edit</button>
                                <button onClick={() => handleDeleteSlide(s.id)}>Delete</button>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                      <div style={{ marginTop: 8 }}>
                        {(() => {
                          let selectValue = 'video';
                          if (newSlide.lesson_id === l.id && (newSlide.type === 'video' || newSlide.type === 'quiz')) {
                            selectValue = newSlide.type;
                          }
                          return (
                            <select
                              value={selectValue}
                              onChange={e => setNewSlide(ns => ({ ...ns, lesson_id: l.id, type: e.target.value as 'video' | 'quiz' }))}
                            >
                              <option value="video">Video</option>
                              <option value="quiz">Quiz</option>
                            </select>
                          );
                        })()}
                        <input
                          type="number"
                          value={newSlide.lesson_id === l.id && typeof newSlide.order === 'number' ? newSlide.order : 1}
                          onChange={e => setNewSlide(ns => ({ ...ns, lesson_id: l.id, order: Number(e.target.value) }))}
                          placeholder="Order"
                          style={{ width: 60 }}
                        />
                        <button
                          onClick={handleCreateSlide}
                          disabled={newSlide.lesson_id !== l.id || !newSlide.type || typeof newSlide.order !== 'number'}
                        >Add Slide</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: 8 }}>
                <input
                  value={newLesson.course_id === c.id ? (typeof newLesson.title === 'string' ? newLesson.title : '') : ''}
                  onChange={e => setNewLesson(nl => ({ ...nl, course_id: c.id, title: e.target.value }))}
                  placeholder="New Lesson Title"
                />
                <input
                  type="number"
                  value={newLesson.course_id === c.id && typeof newLesson.order === 'number' ? newLesson.order : 1}
                  onChange={e => setNewLesson(nl => ({ ...nl, course_id: c.id, order: Number(e.target.value) }))}
                  placeholder="Order"
                  style={{ width: 60 }}
                />
                <input
                  value={newLesson.course_id === c.id ? (typeof newLesson.tag === 'string' ? newLesson.tag : '') : ''}
                  onChange={e => setNewLesson(nl => ({ ...nl, course_id: c.id, tag: e.target.value }))}
                  placeholder="Tag (e.g. Earning Money)"
                  style={{ width: 160 }}
                />
                <button
                  onClick={() => {
                    handleCreateLesson();
                    setNewLesson({ course_id: c.id, title: '', order: 1, tag: '' });
                  }}
                  disabled={!newLesson.title || newLesson.course_id !== c.id}
                >Add Lesson</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// QuizAnswersEditor component for managing quiz answers with image upload
function QuizAnswersEditor({ answers, setAnswers, lessonId, lessons, courses, sanitizeName, uploadFile }: {
  answers: { text: string; image_url?: string; is_correct: boolean }[];
  setAnswers: (a: { text: string; image_url?: string; is_correct: boolean }[]) => void;
  lessonId: string;
  lessons: Lesson[];
  courses: Course[];
  sanitizeName: (name: string) => string;
  uploadFile: (file: File, path: string) => Promise<string | null>;
}) {
  const [newAnswer, setNewAnswer] = useState({ text: '', is_correct: false });
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  // Find lesson and course for folder naming
  const lesson = lessons.find(l => l.id === lessonId);
  const course = lesson ? courses.find(c => c.id === lesson.course_id) : undefined;
  return (
    <div style={{ marginTop: 8 }}>
      <div>Answers:</div>
      <ul>
        {answers.map((a, idx) => (
          <li key={idx}>
            <input
              value={typeof a.text === 'string' ? a.text : ''}
              onChange={e => {
                const updated = [...answers];
                updated[idx].text = e.target.value;
                setAnswers(updated);
              }}
              placeholder={`Answer ${idx + 1}`}
            />
            <input
              type="checkbox"
              checked={a.is_correct}
              onChange={e => {
                const updated = answers.map((ans, i) => ({ ...ans, is_correct: i === idx ? e.target.checked : false }));
                setAnswers(updated);
              }}
            /> Correct
            <input
              type="file"
              accept="image/*"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingIdx(idx);
                let folder = `lesson-${lessonId}`;
                if (lesson) folder = `${sanitizeName(course?.title || 'course')}-${sanitizeName(lesson.title || 'lesson')}-${lesson.id}`;
                const path = `${folder}/quiz-answer-images/${uuidv4()}-${file.name}`;
                const url = await uploadFile(file, path);
                setUploadingIdx(null);
                if (url) {
                  const updated = [...answers];
                  updated[idx].image_url = url;
                  setAnswers(updated);
                }
              }}
            />
            {uploadingIdx === idx && <span>Uploading...</span>}
            {a.image_url ? <a href={a.image_url} target="_blank" rel="noopener noreferrer">View Image</a> : null}
            <button onClick={() => setAnswers(answers.filter((_, i) => i !== idx))}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <input
          value={typeof newAnswer.text === 'string' ? newAnswer.text : ''}
          onChange={e => setNewAnswer(na => ({ ...na, text: e.target.value }))}
          placeholder="New Answer"
        />
        <input
          type="checkbox"
          checked={newAnswer.is_correct}
          onChange={e => setNewAnswer(na => ({ ...na, is_correct: e.target.checked }))}
        /> Correct
        <button
          onClick={() => {
            if (!newAnswer.text || typeof newAnswer.text !== 'string') return;
            setAnswers([
              ...answers.map(a => ({ ...a, is_correct: false })),
              { ...newAnswer },
            ]);
            setNewAnswer({ text: '', is_correct: false });
          }}
        >Add Answer</button>
      </div>
    </div>
  );
}

export default LessonBuilder; 