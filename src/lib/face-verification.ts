import 'server-only';

/**
 * Verifikasi foto bersama pengguna memakai model HuggingFace.
 *
 * Strategi: panggil HuggingFace Inference API (object detection) untuk
 * mendeteksi orang/wajah di foto. Foto dianggap VERIFIED jika terdeteksi
 * minimal 2 orang (mahasiswa + pengguna). Model bisa diganti lewat env
 * HF_FACE_MODEL (default: facebook/detr-resnet-50).
 *
 * Env:
 * - HUGGINGFACE_API_KEY : API token HuggingFace (wajib agar verifikasi jalan)
 * - HF_FACE_MODEL       : model object/face detection (opsional)
 * - HF_MIN_PERSONS      : minimal orang terdeteksi (opsional, default 2)
 */

const HF_API_BASE =
  process.env.HF_API_BASE ||
  'https://router.huggingface.co/hf-inference/models';
const DEFAULT_MODEL = 'facebook/detr-resnet-50';
const DEFAULT_MIN_PERSONS = 2;
const MIN_CONFIDENCE = 0.7;

export type FaceVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface FaceVerificationOutcome {
  status: FaceVerificationStatus;
  result: {
    model: string;
    personCount?: number;
    minPersons?: number;
    detections?: Array<{ label: string; score: number }>;
    note?: string;
    error?: string;
    verifiedAt: string;
  };
}

interface HFDetection {
  label: string;
  score: number;
  box?: { xmin: number; ymin: number; xmax: number; ymax: number };
}

export function isFaceVerificationConfigured(): boolean {
  return !!process.env.HUGGINGFACE_API_KEY;
}

export async function verifyUserPhoto(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<FaceVerificationOutcome> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HF_FACE_MODEL || DEFAULT_MODEL;
  const minPersons = Number(process.env.HF_MIN_PERSONS) || DEFAULT_MIN_PERSONS;
  const verifiedAt = new Date().toISOString();

  if (!apiKey) {
    return {
      status: 'PENDING',
      result: {
        model,
        note: 'HUGGINGFACE_API_KEY belum dikonfigurasi — verifikasi ditunda.',
        verifiedAt,
      },
    };
  }

  try {
    const response = await fetch(`${HF_API_BASE}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': mimeType,
        'x-wait-for-model': 'true',
      },
      body: new Uint8Array(imageBuffer),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return {
        status: 'PENDING',
        result: {
          model,
          note: 'Model HuggingFace tidak merespons — verifikasi ditunda, coba ulang nanti.',
          error: `HTTP ${response.status}: ${text.slice(0, 300)}`,
          verifiedAt,
        },
      };
    }

    const detections = (await response.json()) as HFDetection[];
    if (!Array.isArray(detections)) {
      return {
        status: 'PENDING',
        result: {
          model,
          note: 'Output model tidak dikenali — verifikasi ditunda.',
          error: JSON.stringify(detections).slice(0, 300),
          verifiedAt,
        },
      };
    }

    // Hitung orang/wajah dengan confidence memadai
    const persons = detections.filter(
      (d) =>
        d.score >= MIN_CONFIDENCE &&
        ['person', 'face', 'human face'].includes(d.label.toLowerCase()),
    );

    return {
      status: persons.length >= minPersons ? 'VERIFIED' : 'REJECTED',
      result: {
        model,
        personCount: persons.length,
        minPersons,
        detections: detections
          .filter((d) => d.score >= 0.5)
          .map((d) => ({ label: d.label, score: Number(d.score.toFixed(3)) })),
        note:
          persons.length >= minPersons
            ? `Terdeteksi ${persons.length} orang di foto — memenuhi syarat foto bersama pengguna.`
            : `Hanya terdeteksi ${persons.length} orang (minimal ${minPersons}). Pastikan mahasiswa dan pengguna terlihat jelas di foto.`,
        verifiedAt,
      },
    };
  } catch (error) {
    return {
      status: 'PENDING',
      result: {
        model,
        note: 'Gagal menghubungi HuggingFace — verifikasi ditunda, coba ulang nanti.',
        error: error instanceof Error ? error.message : String(error),
        verifiedAt,
      },
    };
  }
}
