export function generateRandomColor(inputString) {
  // Seed the random number generator based on the input string
  let seed = 0;
  for (let i = 0; i < inputString.length; i++) {
    seed += inputString.charCodeAt(i);
  }

  // Set the seed for the random number generator
  Math.seed = seed;

  // Generate random values for RGB
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  // Format the RGB values into a CSS color string
  const color = `rgb(${r}, ${g}, ${b})`;

  return color;
}
