import { useParams, useSearchParams } from 'react-router-dom';
import LessonPlayer from './LessonPlayer';

const LessonPlayerWrapper = () => {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('user');
  if (!lessonId || !userId) return <div>Missing lesson or user ID</div>;
  return <LessonPlayer lessonId={lessonId} userId={userId} />;
};

export default LessonPlayerWrapper; 