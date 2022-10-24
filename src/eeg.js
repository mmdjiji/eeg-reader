/**
 * @name validate
 * @param data with length 104
 * @return true / false
 */
const validate = (data) => {
  let sum = 0;
  for(let i = 7; i <= 102; ++i) {
    sum += data[i];
  }
  return ((data[0] === 170 && data[1] === 170 && data[2] === 131) && ((4294967295 - sum) & 255) === data[103]);
}

/**
 * @name getData
 * @param data with length 104
 * @return { ch1, ch2 }
 */
const getData = (data) => {

  if(!validate(data)) return;
  const ch1 = [];
  const ch2 = [];

  for(let i = 0; i < 16; ++i) {
    const offset = i * 6 + 7;
    let value1 = (data[offset] << 16) + (data[offset+1] << 8) + (data[offset+2]);
    let value2 = (data[offset+3] << 16) + (data[offset+4] << 8) + (data[offset+5]);
    if(value1 > 8388607) value1 -= 16777216;
    if(value2 > 8388607) value2 -= 16777216;

    ch1.push(value1);
    ch2.push(value2);
  }

  return { ch1, ch2 };
}

export { getData };