'use client';

import { useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Select,
  SelectItem,
  Progress,
} from '@heroui/react';
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react';
import Link from 'next/link';
import { formatFileSize, getDocumentTypeLabel } from '@/lib/utils';

const documentTypes = [
  { key: 'PROPOSAL', label: 'Proposal' },
  { key: 'BAB_1', label: 'Bab 1 - Pendahuluan' },
  { key: 'BAB_2', label: 'Bab 2 - Tinjauan Pustaka' },
  { key: 'BAB_3', label: 'Bab 3 - Metodologi' },
  { key: 'BAB_4', label: 'Bab 4 - Hasil & Pembahasan' },
  { key: 'BAB_5', label: 'Bab 5 - Kesimpulan' },
  { key: 'FINAL_REPORT', label: 'Laporan Akhir' },
  { key: 'PRESENTATION', label: 'Presentasi' },
  { key: 'SOURCE_CODE', label: 'Source Code (ZIP)' },
  { key: 'OTHER', label: 'Lainnya' },
];

interface UploadedFile {
  file: File;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (newFiles: File[]) => {
    const uploadFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      type: 'OTHER',
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileType = (index: number, type: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, type } : f)));
  };

  const uploadFiles = async () => {
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const fileData = files[i];
      if (fileData.status === 'success') continue;

      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'uploading', progress: 0 } : f,
        ),
      );

      try {
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('type', fileData.type);
        formData.append('projectId', projectId);

        const xhr = new XMLHttpRequest();

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setFiles((prev) =>
                prev.map((f, idx) => (idx === i ? { ...f, progress } : f)),
              );
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setFiles((prev) =>
                prev.map((f, idx) =>
                  idx === i ? { ...f, status: 'success', progress: 100 } : f,
                ),
              );
              resolve();
            } else {
              const error =
                JSON.parse(xhr.responseText)?.error || 'Upload gagal';
              setFiles((prev) =>
                prev.map((f, idx) =>
                  idx === i ? { ...f, status: 'error', error } : f,
                ),
              );
              reject(new Error(error));
            }
          });

          xhr.addEventListener('error', () => {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i
                  ? { ...f, status: 'error', error: 'Koneksi error' }
                  : f,
              ),
            );
            reject(new Error('Connection error'));
          });

          xhr.open('POST', '/api/documents');
          xhr.send(formData);
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setIsUploading(false);

    // Check if all uploads successful
    const allSuccess = files.every((f) => f.status === 'success');
    if (allSuccess && files.length > 0) {
      setTimeout(() => {
        router.push(`/mahasiswa/projects/${projectId}`);
        router.refresh();
      }, 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          href={`/mahasiswa/projects/${projectId}`}
          variant="light"
          isIconOnly
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Upload Dokumen</h1>
          <p className="text-default-500">
            Upload laporan, presentasi, atau source code
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pilih File</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-default-300 hover:border-primary'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload
              size={48}
              className={`mx-auto mb-4 ${
                dragActive ? 'text-primary' : 'text-default-400'
              }`}
            />
            <p className="text-lg font-medium mb-2">Drag & drop file di sini</p>
            <p className="text-default-500 mb-4">
              atau klik tombol di bawah untuk memilih file
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
              onChange={handleFileInput}
              className="hidden"
              id="file-input"
            />
            <Button
              as="label"
              htmlFor="file-input"
              color="primary"
              variant="flat"
              className="cursor-pointer"
            >
              Pilih File
            </Button>
            <p className="text-xs text-default-400 mt-4">
              Format: PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR (Max 50MB)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">File yang akan diupload</h3>
              {files.map((fileData, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-default-50 rounded-lg"
                >
                  <FileText size={24} className="text-default-400 shrink-0" />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {fileData.file.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {fileData.status === 'success' && (
                          <Check size={18} className="text-success" />
                        )}
                        {fileData.status === 'error' && (
                          <span className="text-xs text-danger">
                            {fileData.error}
                          </span>
                        )}
                        {fileData.status === 'pending' && (
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => removeFile(index)}
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-sm text-default-500">
                        {formatFileSize(fileData.file.size)}
                      </p>

                      {fileData.status === 'pending' && (
                        <Select
                          size="sm"
                          placeholder="Pilih tipe"
                          selectedKeys={[fileData.type]}
                          onChange={(e) =>
                            updateFileType(index, e.target.value)
                          }
                          className="max-w-[200px]"
                        >
                          {documentTypes.map((type) => (
                            <SelectItem key={type.key}>{type.label}</SelectItem>
                          ))}
                        </Select>
                      )}

                      {fileData.status !== 'pending' && (
                        <span className="text-sm text-default-500">
                          {getDocumentTypeLabel(fileData.type)}
                        </span>
                      )}
                    </div>

                    {(fileData.status === 'uploading' ||
                      fileData.status === 'success') && (
                      <Progress
                        value={fileData.progress}
                        size="sm"
                        color={
                          fileData.status === 'success' ? 'success' : 'primary'
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {files.length > 0 && (
            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="flat"
                onPress={() => setFiles([])}
                isDisabled={isUploading}
              >
                Hapus Semua
              </Button>
              <Button
                color="primary"
                onPress={uploadFiles}
                isLoading={isUploading}
                isDisabled={files.every((f) => f.status === 'success')}
              >
                Upload {files.filter((f) => f.status !== 'success').length} File
              </Button>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
