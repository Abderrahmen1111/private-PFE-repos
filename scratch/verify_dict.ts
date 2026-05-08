import { DARIJA_TUNISIAN_DICTIONARY } from '../lib/darija-dictionary';

const words = ['nhb', 'nkl', 'haja'];
words.forEach(w => {
  console.log(`'${w}':`, DARIJA_TUNISIAN_DICTIONARY[w]);
});
