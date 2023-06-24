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
  setOffice: (position: google.maps.LatLngLiteral) => void;
  setHome?: (position: google.maps.LatLngLiteral) => void;
  
};

export default function Places({ setOffice, setHome }: PlacesProps) {
  const {
    ready,
    value: officeValue,
    setValue: setOfficeValue,
    suggestions: { status: officeStatus, data: officeData },
    clearSuggestions: clearOfficeSuggestions,
  } = usePlacesAutocomplete();

  const {
    value: homeValue,
    setValue: setHomeValue,
    suggestions: { status: homeStatus, data: homeData },
    clearSuggestions: clearHomeSuggestions,
  } = usePlacesAutocomplete();

  const handleOfficeSelect = async (val: string) => {
    setOfficeValue(val, false);
    clearOfficeSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);

    setOffice({ lat, lng });
  };

  const handleHomeSelect = async (val: string) => {
    setHomeValue(val, false);
    clearHomeSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);

    setHome({ lat, lng });
  };

  return (
    <>
      <div>
        <label htmlFor="office-input">Office Address:</label>
        <Combobox onSelect={handleOfficeSelect}>
          <ComboboxInput
            id="office-input"
            value={officeValue}
            onChange={(e) => setOfficeValue(e.target.value)}
            disabled={!ready}
            className="combobox-input"
            placeholder="Search office address"
          />
          <ComboboxPopover>
            <ComboboxList>
              {officeStatus === "OK" &&
                officeData.map(({ place_id, description }) => (
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
