import { format } from 'date-fns';
import PageHeading from '../components/PageHeading';
import GotchaDayCard from '../components/GotchaDayCard';
import AgeCard from '../components/AgeCard';
import PictureOfTheDay from '../components/PictureOfTheDay';
import UpNextCard from '../components/UpNextCard';
import TodayDiaryCard from '../components/TodayDiaryCard';
import Confetti from '../components/Confetti';
import { isAnniversary, parseLocalDate } from '../lib/dates';
import { greetingFor } from '../lib/greeting';
import { NEMO } from '../lib/nemo';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useToday } from '../lib/useToday';

export default function HomePage() {
  const today = useToday();
  useDocumentTitle(null);
  const celebrating =
    isAnniversary(parseLocalDate(NEMO.gotchaDay), today) || isAnniversary(parseLocalDate(NEMO.birthday), today);

  return (
    <>
      {celebrating && <Confetti />}
      <PageHeading
        title={`${greetingFor(new Date().getHours())}, ${NEMO.name}!`}
        subtitle={`${format(today, 'EEEE, MMMM d')} · everything about my favorite ${NEMO.breed}.`}
      />
      <div className="dashboard">
        <div className="area-gotcha"><GotchaDayCard today={today} /></div>
        <div className="area-age"><AgeCard today={today} /></div>
        <div className="area-photo"><PictureOfTheDay today={today} /></div>
        <div className="area-next"><UpNextCard today={today} /></div>
        <div className="area-diary"><TodayDiaryCard today={today} /></div>
      </div>
    </>
  );
}
