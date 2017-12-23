export const computeCycle = (skew, hour, cycleTrough) => {
  const computedHour = hour - cycleTrough;

  return Math.sin(
    (computedHour*2*Math.PI/24) +
    (skew*Math.sin(computedHour*2*Math.PI/24))
  );
};

export const computeLine = mean => {
  return computeCycle + mean;
};
