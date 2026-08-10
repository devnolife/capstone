import { describe, expect, it } from 'vitest';
import {
  resolveProjectSubmissionDeadline,
  validateSemesterPeriod,
} from './semester';

describe('validateSemesterPeriod', () => {
  it('accepts a submission deadline inside the semester period', () => {
    const result = validateSemesterPeriod({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.999Z',
      submissionDeadline: '2026-10-31T15:59:59.999Z',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.submissionDeadline?.toISOString()).toBe('2026-10-31T15:59:59.999Z');
    }
  });

  it('accepts a semester without a submission deadline', () => {
    const result = validateSemesterPeriod({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.999Z',
      submissionDeadline: null,
    });

    expect(result.ok).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    const result = validateSemesterPeriod({
      startDate: '2026-12-31T00:00:00.000Z',
      endDate: '2026-08-01T00:00:00.000Z',
      submissionDeadline: null,
    });

    expect(result).toEqual({
      ok: false,
      error: 'Tanggal selesai harus setelah tanggal mulai',
    });
  });

  it('rejects a submission deadline outside the semester period', () => {
    const result = validateSemesterPeriod({
      startDate: '2026-08-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.999Z',
      submissionDeadline: '2027-01-01T00:00:00.000Z',
    });

    expect(result).toEqual({
      ok: false,
      error: 'Batas submission harus berada dalam periode semester',
    });
  });
});

describe('resolveProjectSubmissionDeadline', () => {
  const activeSemester = {
    name: 'Ganjil 2026/2027',
    tahunAkademik: '2026/2027',
    isActive: true,
    submissionDeadline: new Date('2026-10-31T15:59:59.999Z'),
  };

  it('returns the deadline when semester name and academic year match', () => {
    expect(
      resolveProjectSubmissionDeadline(
        { semester: 'Ganjil', tahunAkademik: '2026/2027' },
        [activeSemester],
      ),
    ).toEqual(activeSemester.submissionDeadline);
  });

  it('does not apply an active deadline to a project from another semester', () => {
    expect(
      resolveProjectSubmissionDeadline(
        { semester: 'Genap', tahunAkademik: '2026/2027' },
        [activeSemester],
      ),
    ).toBeNull();
  });
});
