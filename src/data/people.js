export const MAX_PEOPLE = 9;

export const QA_PASSWORDS = ['pram', 'pram2026'];

export function verifyQAPassword(input) {
  if (!input) return false;
  const clean = input.trim().toLowerCase();
  return QA_PASSWORDS.some((pw) => pw.toLowerCase() === clean);
}

export const PEOPLE = [
  { id: 1, name: 'Bindut', birthday: { day: 16, month: 11 }, birthYear: 2005, gender: 'female', emoji: '🌸' },
  { id: 2, name: 'Aceng', birthday: { day: 27, month: 12 }, birthYear: 2005, gender: 'male', emoji: '⚡' },
  { id: 3, name: 'Panca', birthday: { day: 18, month: 5 }, birthYear: 2005, gender: 'male', emoji: '🔥' },
  { id: 4, name: 'Vano', birthday: { day: 13, month: 6 }, birthYear: 2009, gender: 'male', emoji: '🚀' },
  { id: 5, name: 'Ruby', birthday: { day: 1, month: 3 }, birthYear: 2007, gender: 'female', emoji: '💎' },
  { id: 6, name: 'Moon', birthday: { day: 31, month: 12 }, birthYear: 2006, gender: 'male', emoji: '🌙' },
  { id: 7, name: 'Caca', birthday: { day: 13, month: 8 }, birthYear: 2010, gender: 'female', emoji: '🎀' },
  { id: 8, name: 'Lyly', birthday: { day: 2, month: 8 }, birthYear: 2011, gender: 'female', emoji: '🦋' },
  { id: 9, name: 'Almas', birthday: { day: 20, month: 5 }, birthYear: 2008, gender: 'male', emoji: '👑' },
];

export function isBirthdayToday(person, mockDate = null) {
  const targetDate = mockDate ? new Date(mockDate) : new Date();
  return targetDate.getDate() === person.birthday.day && (targetDate.getMonth() + 1) === person.birthday.month;
}

export function getAge(person, mockDate = null) {
  const today = mockDate ? new Date(mockDate) : new Date();
  let age = today.getFullYear() - person.birthYear;
  const monthDiff = (today.getMonth() + 1) - person.birthday.month;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < person.birthday.day)) {
    age--;
  }
  return age;
}

export function getBirthdayString(person) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return `${person.birthday.day} ${months[person.birthday.month - 1]}`;
}
