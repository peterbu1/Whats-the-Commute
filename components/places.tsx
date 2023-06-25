import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

type PlacesProps = {
  setWork: (position: google.maps.LatLngLiteral) => void;
  setHome?: (position: google.maps.LatLngLiteral) => void;
  
};

export default function Places({ setWork, setHome }: PlacesProps) {
  const {
    ready,
    value: WorkValue,
    setValue: setWorkValue,
    suggestions: { status: workStatus, data: workData },
    clearSuggestions: clearWorkSuggestions,
  } = usePlacesAutocomplete();

  const {
    value: homeValue,
    setValue: setHomeValue,
    suggestions: { status: homeStatus, data: homeData },
    clearSuggestions: clearHomeSuggestions,
  } = usePlacesAutocomplete();

  const handleWorkSelect = async (val: string) => {
    setWorkValue(val, false);
    clearWorkSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);

    setWork({ lat, lng });
  };

  const handleHomeSelect = async (val: string) => {
    setHomeValue(val, false);
    clearHomeSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);

    if (setHome) {
      setHome({ lat, lng });
    }
  };

  return (
    <>
      <div>
        <label htmlFor="Work-input">Work Address:</label>
        <Combobox onSelect={handleWorkSelect}>
          <ComboboxInput
            id="Work-input"
            value={WorkValue}
            onChange={(e) => setWorkValue(e.target.value)}
            disabled={!ready}
            className="combobox-input"
            placeholder="Search work address"
          />
          <ComboboxPopover>
            <ComboboxList>
              {workStatus === "OK" &&
                workData.map(({ place_id, description }) => (
                  <ComboboxOption key={place_id} value={description} />
                ))}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </div>
      <div>
        <label htmlFor="home-input">Home Address:</label>
        <Combobox onSelect={handleHomeSelect}>
          <ComboboxInput
            id="home-input"
            value={homeValue}
            onChange={(e) => setHomeValue(e.target.value)}
            disabled={!ready}
            className="combobox-input"
            placeholder="Search home address"
          />
          <ComboboxPopover>
            <ComboboxList>
              {homeStatus === "OK" &&
                homeData.map(({ place_id, description }) => (
                  <ComboboxOption key={place_id} value={description} />
                ))}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
      </div>
    </>
  );
}
