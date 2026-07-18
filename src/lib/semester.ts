interface SemesterPeriodInput {
  startDate: Date | string;
  endDate: Date | string;
  submissionDeadline?: Date | string | null;
}

type SemesterPeriodResult =
  | {
    ok: true;
    startDate: Date;
    endDate: Date;
    submissionDeadline: Date | null;
  }
  | { ok: false; error: string };

export function validateSemesterPeriod(
  input: SemesterPeriodInput,
): SemesterPeriodResult {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  const submissionDeadline = input.submissionDeadline
    ? new Date(input.submissionDeadline)
    : null;

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { ok: false, error: 'Tanggal semester tidak valid' };
  }

  if (endDate <= startDate) {
    return { ok: false, error: 'Tanggal selesai harus setelah tanggal mulai' };
  }

  if (submissionDeadline && Number.isNaN(submissionDeadline.getTime())) {
    return { ok: false, error: 'Batas submission tidak valid' };
  }

  if (
    submissionDeadline &&
    (submissionDeadline < startDate || submissionDeadline > endDate)
  ) {
    return {
      ok: false,
      error: 'Batas submission harus berada dalam periode semester',
    };
  }

  return { ok: true, startDate, endDate, submissionDeadline };
}

interface ProjectSemesterIdentity {
  semester: string;
  tahunAkademik: string;
}

interface SemesterDeadlineCandidate {
  name: string;
  tahunAkademik: string;
  isActive: boolean;
  submissionDeadline: Date | null;
}

export function resolveProjectSubmissionDeadline(
  project: ProjectSemesterIdentity,
  semesters: SemesterDeadlineCandidate[],
): Date | null {
  const semesterName = project.semester.trim().toLocaleLowerCase('id-ID');
  const match = semesters.find(
    (semester) =>
      semester.isActive &&
      semester.tahunAkademik === project.tahunAkademik &&
      semester.name.toLocaleLowerCase('id-ID').includes(semesterName),
  );

  return match?.submissionDeadline ?? null;
}
