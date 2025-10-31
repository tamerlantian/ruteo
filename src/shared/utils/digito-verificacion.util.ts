export const digitoVerificacion = (nit: number | undefined): string => {
  if (!nit) {
    return '';
  }

  if (isNaN(nit)) {
    return '';
  }

  const arr: { [key: number]: number } = {
    1: 3,
    4: 17,
    7: 29,
    10: 43,
    13: 59,
    2: 7,
    5: 19,
    8: 37,
    11: 47,
    14: 67,
    3: 13,
    6: 23,
    9: 41,
    12: 53,
    15: 71,
  };

  let x = 0;
  let y = 0;
  const z = nit.toString().length;
  let dv: string | number = '';

  for (let i = 0; i < z; i++) {
    y = parseInt(nit.toString().charAt(i));
    x += y * arr[z - i];
  }

  y = x % 11;

  if (y > 1) {
    dv = 11 - y;
    return `${dv}`;
  } else {
    dv = y;
    return `${dv}`;
  }
};
