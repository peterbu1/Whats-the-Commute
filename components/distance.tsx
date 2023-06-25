import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

const secondsPerDay = 60 * 60 * 24;
const averageCarbonEmissionPerMile = 0.4047;

type DistanceProps = {
  leg: google.maps.DirectionsLeg;
};

export default function Distance({ leg }: DistanceProps) {
  if (!leg.distance || !leg.duration) return null;

  const [milesPerGallon, setMilesPerGallon] = useState(23);
  const [gasGallonCost, setGasGallonCost] = useState(3.5);
  const [commutesPerWeek, setCommutesPerWeek] = useState(5);

  const handleMPGChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMilesPerGallon(Number(event.target.value));
  };

  const handleGasCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGasGallonCost(Number(event.target.value));
  };

  const handleCommutesPerWeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommutesPerWeek(Number(event.target.value));
  };

  const distanceInMiles = leg.distance.value / 1609.34;
  const daysPerYear = commutesPerWeek * 52 * 2; // Multiply by 2 for round trips
  const days = Math.floor((daysPerYear * leg.duration.value) / secondsPerDay);
  const costPerCommute = (distanceInMiles / milesPerGallon) * gasGallonCost;
  const annualGasCost = costPerCommute * daysPerYear;
  const carbonFootprint = (distanceInMiles * averageCarbonEmissionPerMile * daysPerYear).toFixed(2);

  return (
    <div>
      <p>
        This home is <span className="highlight">{(leg.distance.value / 1609.34).toFixed(2)} miles</span> away
        from your office. That would take{' '}
        <span className="highlight">{leg.duration.text}</span> each direction.
      </p>

      <p>
        That's <span className="highlight">{days} days</span> in your car each year at a cost of{' '}
        <span className="highlight">${annualGasCost.toFixed(2)}</span>.
      </p>

      <p>
        Your carbon footprint for this commute is approximately{' '}
        <span className="highlight">{carbonFootprint} pounds of CO2</span>.
      </p>

      <div>
        <label htmlFor="mpg-input">Miles Per Gallon:</label>
        <input id="mpg-input" type="number" value={milesPerGallon} onChange={handleMPGChange} />
      </div>

      <div>
        <label htmlFor="gas-cost-input">Gas Gallon Cost:</label>
        <input id="gas-cost-input" type="number" value={gasGallonCost} onChange={handleGasCostChange} />
      </div>

      <div>
        <label htmlFor="commutes-per-week-input">Commutes Per Week:</label>
        <input
          id="commutes-per-week-input"
          type="number"
          value={commutesPerWeek}
          onChange={handleCommutesPerWeekChange}
        />
      </div>

      <span className="info-icon">
        <FontAwesomeIcon icon={faCircleInfo} />
        <span className="tooltip">
          The calculation is based on commuting {commutesPerWeek} times a week, {daysPerYear} times a year.
          <br />
          Cost breakdown:
          <br />
          - Gas cost per commute: ${(leg.distance.value / 1609.34 / milesPerGallon * gasGallonCost).toFixed(2)}
          <br />
          - Annual gas cost: ${new Intl.NumberFormat().format(annualGasCost)}
        </span>
      </span>
    </div>
  );
}
