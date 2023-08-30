import { range } from 'extensions/range';
import { factorial } from './combinatorics';

const getDividers = (dx: number, order: number): Array<number> => {
  const halvedOrder = Math.ceil(order / 2);
  const multiplier = dx ** (order - 1);
  return range(order).map(
    i => (-1) ** (order - i - 1) * multiplier * factorial(i + 1 <= halvedOrder ? order - i - 1 : i),
  );
};

const getInterpolationFunc = (points: Array<{ x: number; y: number }>, dividers: Array<number>) => {
  const multipliers = points.map((point, index) => point.y / dividers[index]);

  return (x: number) =>
    multipliers.reduce(
      (result, multiplier, index) =>
        result +
        multiplier *
          points.reduce((res, point, index2) => (index !== index2 ? res * (x - point.x) : res), 1),
      0,
    );
};

export const interpolate = (source: Float32Array, targetSize: number) => {
  const innerPoints = Math.round(targetSize / source.length - 1);
  const result = new Float32Array(targetSize);
  const values = [
    ...source.reduce(
      (acc, value, index) => [...acc, { x: index * (innerPoints + 1), y: value }],
      [] as Array<{ x: number; y: number }>,
    ),
    { x: source.length * (innerPoints + 1), y: 0.0 },
  ];
  const dividers = getDividers(innerPoints + 1, 4);

  let leftPrevEntry = { x: -(innerPoints + 1), y: 0.0 };
  let leftEntry = values[0];

  for (let i = 1; i < values.length - 1; i++) {
    const rightEntry = values[i];
    const rightNextEntry = values[i + 1];

    result[leftEntry.x] = leftEntry.y;
    const interpolationFunc = getInterpolationFunc(
      [leftPrevEntry, leftEntry, rightEntry, rightNextEntry],
      dividers,
    );
    for (let j = 1; j <= innerPoints; j += 1) {
      const pos = leftEntry.x + j;
      result[pos] = interpolationFunc(pos);
    }

    leftEntry = values[i];
    leftPrevEntry = values[i - 1];
  }

  return result;
};
