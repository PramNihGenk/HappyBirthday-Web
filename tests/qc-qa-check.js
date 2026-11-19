/**
 * tests/qc-qa-check.js
 * Automated QA & QC verification test suite for SurpriseWeb
 * Run via: node tests/qc-qa-check.js
 */

import { PEOPLE, isBirthdayToday, getAge, getBirthdayString, MAX_PEOPLE, verifyQAPassword } from '../src/data/people.js'
import fs from 'node:fs'
import path from 'node:path'

let passedCount = 0
let failedCount = 0

function assert(condition, testName, details = '') {
  if (condition) {
    passedCount++
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${testName}] ${details}`)
  } else {
    failedCount++
    console.log(`  \x1b[31m✖ FAIL\x1b[0m [${testName}] ${details}`)
  }
}

console.log('\n\x1b[36m=======================================================')
console.log('       🧪 SURPRISEWEB QA & QC AUTOMATED TEST RUNNER     ')
console.log('=======================================================\x1b[0m\n')

// ----------------------------------------------------
// SUITE 1: DATA INTEGRITY (9 FRIENDS)
// ----------------------------------------------------
console.log('\x1b[33m[SUITE 1: Data Integrity & 9 Sahabat Validation]\x1b[0m')

assert(PEOPLE.length === 9, 'TC-001: Total Friends Count', `Expected 9 people, got ${PEOPLE.length}`)
assert(MAX_PEOPLE === 9, 'TC-002: MAX_PEOPLE Constant', `Expected 9, got ${MAX_PEOPLE}`)

const currentNames = PEOPLE.map(p => p.name)
const has9ValidFriends = PEOPLE.length === 9 && currentNames.includes('Bindut') && currentNames.includes('Aceng')
assert(has9ValidFriends, 'TC-003: All Required 9 Friends Present', `Names: ${currentNames.join(', ')}`)

PEOPLE.forEach((p, idx) => {
  const hasId = typeof p.id === 'number'
  const hasName = typeof p.name === 'string' && p.name.length > 0
  const hasDay = p.birthday && p.birthday.day >= 1 && p.birthday.day <= 31
  const hasMonth = p.birthday && p.birthday.month >= 1 && p.birthday.month <= 12
  const hasBirthYear = typeof p.birthYear === 'number' && p.birthYear > 1990 && p.birthYear < 2030
  const hasValidGender = p.gender === 'female' || p.gender === 'male'
  const hasEmoji = typeof p.emoji === 'string' && p.emoji.length > 0

  const valid = hasId && hasName && hasDay && hasMonth && hasBirthYear && hasValidGender && hasEmoji
  assert(valid, `TC-004.${idx + 1}: Person #${p.id} (${p.name}) Schema Validation`, `Gender: ${p.gender}, Birthday: ${p.birthday.day}/${p.birthday.month}`)
})

// ----------------------------------------------------
// SUITE 2: BIRTHDAY LOCK & DATE SIMULATOR LOGIC
// ----------------------------------------------------
console.log('\n\x1b[33m[SUITE 2: Birthday Lock & Mock Date Logic]\x1b[0m')

const bindut = PEOPLE.find(p => p.name === 'Bindut') // 16 Nov
const aceng = PEOPLE.find(p => p.name === 'Aceng')   // 27 Dec

// Test Bindut on her exact birthday
const bindutBirthday = new Date(2026, 10, 16) // Month 10 = Nov in JS Date
assert(isBirthdayToday(bindut, bindutBirthday) === true, 'TC-005: Bindut Birthday Matching Date', 'Should return true on Nov 16')

// Test Bindut on a different date
const otherDay = new Date(2026, 0, 1) // Jan 1
assert(isBirthdayToday(bindut, otherDay) === false, 'TC-006: Bindut Non-Birthday Date (Lock Test)', 'Should return false on Jan 1')

// Test Aceng on his exact birthday
const acengBirthday = new Date(2026, 11, 27) // Month 11 = Dec in JS Date
assert(isBirthdayToday(aceng, acengBirthday) === true, 'TC-007: Aceng Birthday Matching Date', 'Should return true on Dec 27')
assert(isBirthdayToday(aceng, bindutBirthday) === false, 'TC-008: Aceng Non-Birthday Date (Lock Test)', 'Should return false on Nov 16')

// Test Birthday String formatting
assert(getBirthdayString(bindut) === '16 November', 'TC-009: Birthday String Indonesian Format', `Got: ${getBirthdayString(bindut)}`)
assert(getBirthdayString(aceng) === '27 Desember', 'TC-010: Birthday String Indonesian Format', `Got: ${getBirthdayString(aceng)}`)

// Test Age calculation
const ageOnBirthday = getAge(bindut, new Date(2026, 10, 16))
assert(ageOnBirthday === 21, 'TC-011: Age Calculation for 2005 Born in 2026', `Expected 21, got ${ageOnBirthday}`)

// ----------------------------------------------------
// SUITE 3: COMPONENT & DUAL-THEME ASSET INTEGRITY
// ----------------------------------------------------
console.log('\n\x1b[33m[SUITE 3: Components & Dual Theme Verification]\x1b[0m')

const baseDir = process.cwd()
const expectedFiles = [
  'src/App.jsx',
  'src/components/SelectPerson.jsx',
  'src/components/GiftStep.jsx',
  'src/components/WishesStep.jsx',
  'src/components/CandleStep.jsx',
  'src/components/ClosingStep.jsx',
  'src/components/QATestingPanel.jsx',
  'src/index.css',
  'src/utils/effects.js',
]

expectedFiles.forEach((fileRelPath, idx) => {
  const fullPath = path.join(baseDir, fileRelPath)
  const exists = fs.existsSync(fullPath)
  assert(exists, `TC-012.${idx + 1}: Required File Existence: ${fileRelPath}`, exists ? 'Found' : 'MISSING!')
})

// Check index.css for dual-theme & trophy & QA panel definitions
const cssContent = fs.readFileSync(path.join(baseDir, 'src/index.css'), 'utf-8')
assert(cssContent.includes('[data-theme="female"]'), 'TC-013: CSS Female Theme Defined', 'Contains [data-theme="female"]')
assert(cssContent.includes('[data-theme="male"]'), 'TC-014: CSS Male Theme Defined', 'Contains [data-theme="male"]')
assert(cssContent.includes('trophy-svg'), 'TC-015: CSS Cyber Trophy Defined', 'Contains .trophy-svg')
assert(cssContent.includes('qa-floating-trigger'), 'TC-016: CSS QA Testing Panel Defined', 'Contains .qa-floating-trigger')

// ----------------------------------------------------
// SUITE 4: QA & DEV PASSWORD GATE SECURITY
// ----------------------------------------------------
console.log('\n\x1b[33m[SUITE 4: QA & Dev Password Authentication Verification]\x1b[0m')

assert(verifyQAPassword('pram') === true, 'TC-017: Default Password "pram" Valid', 'Allows authorized login')
assert(verifyQAPassword('pram2026') === true, 'TC-018: Secondary Password "pram2026" Valid', 'Allows authorized login')
assert(verifyQAPassword('PRAM') === true, 'TC-019: Password Case-Insensitive Check', 'Allows uppercase PRAM')
assert(verifyQAPassword('salah123') === false, 'TC-020: Wrong Password Denied', 'Rejects unauthorized password')
assert(verifyQAPassword('') === false, 'TC-021: Empty Password Denied', 'Rejects empty input')

// ----------------------------------------------------
// SUMMARY REPORT
// ----------------------------------------------------
console.log('\n\x1b[36m=======================================================')
console.log(`  QA & QC RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`)
console.log('=======================================================\x1b[0m\n')

if (failedCount > 0) {
  process.exit(1)
} else {
  console.log('\x1b[32m✔ ALL QA & QC VERIFICATION CHECKS PASSED!\x1b[0m\n')
}
