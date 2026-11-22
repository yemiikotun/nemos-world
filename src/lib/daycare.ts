/** Nemo's daycare locations and their webcam pages. */
export interface DaycareLocation {
  id: string;
  /** Section heading, e.g. "Nemo in NoMa" */
  title: string;
  /** Short place name used on the button, e.g. "NoMa" */
  place: string;
  /** Where it is, shown under the heading */
  area: string;
  webcamUrl: string;
}

export const DAYCARE_NAME = 'Playful Pack';

export const DAYCARE_LOCATIONS: DaycareLocation[] = [
  {
    id: 'noma',
    title: 'Nemo in NoMa',
    place: 'NoMa',
    area: 'Washington, DC',
    webcamUrl: 'https://playfulpack.com/locations/washington-dc/webcam',
  },
  {
    id: 'rosslyn',
    title: 'Nemo in Rosslyn',
    place: 'Rosslyn',
    area: 'Arlington, VA',
    webcamUrl: 'https://playfulpack.com/locations/arlington-va-rosslyn/webcam',
  },
];
