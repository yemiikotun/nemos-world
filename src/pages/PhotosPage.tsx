import PageHeading from '../components/PageHeading';
import PictureOfTheDay from '../components/PictureOfTheDay';
import PhotoGrid from '../components/PhotoGrid';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useToday } from '../lib/useToday';

export default function PhotosPage() {
  const today = useToday();
  useDocumentTitle('Photos');
  return (
    <>
      <PageHeading title="Photos" subtitle="A new picture of Nemo every day." />
      <PictureOfTheDay today={today} variant="hero" />
      <PhotoGrid />
    </>
  );
}
