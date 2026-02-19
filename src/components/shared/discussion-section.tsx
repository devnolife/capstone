'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Textarea,
  Avatar,
  Spinner,
  Chip,
  Divider,
  addToast,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Reply,
  MoreVertical,
  Edit3,
  Trash2,
  Clock,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getSimakPhotoUrl } from '@/lib/utils';

interface Author {
  id: string;
  name: string;
  username: string;
  role: string;
  image: string | null;
  nim: string | null;
}

interface Discussion {
  id: string;
  projectId: string;
  authorId: string;
  parentId: string | null;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: Author;
  replies: Discussion[];
}

interface DiscussionSectionProps {
  projectId: string;
  currentUserId: string;
}

const roleConfig: Record<string, { label: string; color: 'primary' | 'warning' | 'danger' | 'success'; icon: typeof GraduationCap }> = {
  MAHASISWA: { label: 'Mahasiswa', color: 'primary', icon: GraduationCap },
  DOSEN_PENGUJI: { label: 'Dosen', color: 'warning', icon: UserCheck },
  ADMIN: { label: 'Admin', color: 'danger', icon: ShieldCheck },
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function DiscussionMessage({
  discussion,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}: {
  discussion: Discussion;
  currentUserId: string;
  onReply: (parentId: string) => void;
  onEdit: (discussion: Discussion) => void;
  onDelete: (id: string) => void;
  isReply?: boolean;
}) {
  const [showReplies, setShowReplies] = useState(true);
  const roleCfg = roleConfig[discussion.author.role] || roleConfig.MAHASISWA;
  const RoleIcon = roleCfg.icon;
  const isAuthor = discussion.authorId === currentUserId;

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700' : ''}`}>
      <div className="group py-3">
        <div className="flex items-start gap-3">
          <Avatar
            src={discussion.author.image ? getSimakPhotoUrl(discussion.author.image) : undefined}
            name={discussion.author.name}
            size="sm"
            className="shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{discussion.author.name}</span>
              <Chip
                size="sm"
                color={roleCfg.color}
                variant="flat"
                startContent={<RoleIcon size={10} />}
                className="h-5 text-[10px]"
              >
                {roleCfg.label}
              </Chip>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                <Clock size={10} />
                {timeAgo(discussion.createdAt)}
                {discussion.isEdited && <span className="italic">(diedit)</span>}
              </span>
            </div>
            <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words">
              {discussion.content}
            </div>
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isReply && (
                <Button
                  size="sm"
                  variant="light"
                  startContent={<Reply size={12} />}
                  className="h-6 text-xs text-zinc-500"
                  onPress={() => onReply(discussion.id)}
                >
                  Balas
                </Button>
              )}
              {isAuthor && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      size="sm"
                      variant="light"
                      isIconOnly
                      className="h-6 w-6 min-w-0"
                    >
                      <MoreVertical size={12} />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Aksi diskusi">
                    <DropdownItem
                      key="edit"
                      startContent={<Edit3 size={14} />}
                      onPress={() => onEdit(discussion)}
                    >
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      startContent={<Trash2 size={14} />}
                      className="text-danger"
                      color="danger"
                      onPress={() => onDelete(discussion.id)}
                    >
                      Hapus
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Replies */}
      {!isReply && discussion.replies.length > 0 && (
        <div>
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs text-primary hover:underline ml-11 mb-1"
          >
            {showReplies ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {discussion.replies.length} balasan
          </button>
          <AnimatePresence>
            {showReplies && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {discussion.replies.map(reply => (
                  <DiscussionMessage
                    key={reply.id}
                    discussion={reply}
                    currentUserId={currentUserId}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isReply
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function DiscussionSection({ projectId, currentUserId }: DiscussionSectionProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchDiscussions = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/discussions`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDiscussions();
    // Poll every 15 seconds
    const interval = setInterval(fetchDiscussions, 15000);
    return () => clearInterval(interval);
  }, [fetchDiscussions]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || content.length < 2) return;

    setIsSending(true);
    try {
      if (editingDiscussion) {
        // Edit mode
        const res = await fetch(`/api/discussions/${editingDiscussion.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        });

        if (res.ok) {
          addToast({
            title: 'Pesan diperbarui',
            color: 'success',
          });
          setEditingDiscussion(null);
          setNewMessage('');
          fetchDiscussions();
        } else {
          const data = await res.json();
          addToast({ title: 'Gagal', description: data.error, color: 'danger' });
        }
      } else {
        // Create mode
        const res = await fetch(`/api/projects/${projectId}/discussions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            parentId: replyingTo,
          }),
        });

        if (res.ok) {
          setNewMessage('');
          setReplyingTo(null);
          fetchDiscussions();
        } else {
          const data = await res.json();
          addToast({ title: 'Gagal', description: data.error, color: 'danger' });
        }
      }
    } catch {
      addToast({ title: 'Error', description: 'Terjadi kesalahan jaringan', color: 'danger' });
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    setEditingDiscussion(null);
    // Find the parent discussion author name for UX
    textareaRef.current?.focus();
  };

  const handleEdit = (discussion: Discussion) => {
    setEditingDiscussion(discussion);
    setNewMessage(discussion.content);
    setReplyingTo(null);
    textareaRef.current?.focus();
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/discussions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast({ title: 'Pesan dihapus', color: 'success' });
        fetchDiscussions();
      } else {
        const data = await res.json();
        addToast({ title: 'Gagal', description: data.error, color: 'danger' });
      }
    } catch {
      addToast({ title: 'Error', description: 'Terjadi kesalahan jaringan', color: 'danger' });
    }
  };

  const cancelAction = () => {
    setReplyingTo(null);
    setEditingDiscussion(null);
    setNewMessage('');
  };

  // Find the parent discussion for replying
  const replyingToDiscussion = replyingTo
    ? discussions.find(d => d.id === replyingTo)
    : null;

  const totalMessages = discussions.reduce((sum, d) => sum + 1 + d.replies.length, 0);

  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Diskusi Project</h3>
            <p className="text-xs text-zinc-500">
              {totalMessages} pesan
            </p>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner size="md" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={40} className="mx-auto mb-3 text-zinc-300" />
            <p className="text-sm text-zinc-500">Belum ada diskusi</p>
            <p className="text-xs text-zinc-400 mt-1">Mulai diskusi dengan menulis pesan di bawah</p>
          </div>
        ) : (
          <div className="px-6 divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[500px] overflow-y-auto">
            {discussions.map(discussion => (
              <DiscussionMessage
                key={discussion.id}
                discussion={discussion}
                currentUserId={currentUserId}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Compose area */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          {/* Reply/Edit indicator */}
          <AnimatePresence>
            {(replyingTo || editingDiscussion) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs">
                  <div className="flex items-center gap-2">
                    {editingDiscussion ? (
                      <>
                        <Edit3 size={12} className="text-primary" />
                        <span className="text-zinc-500">Mengedit pesan</span>
                      </>
                    ) : (
                      <>
                        <Reply size={12} className="text-primary" />
                        <span className="text-zinc-500">
                          Membalas <strong>{replyingToDiscussion?.author.name}</strong>
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="light"
                    className="h-5 text-xs min-w-0 px-2"
                    onPress={cancelAction}
                  >
                    Batal
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              placeholder={
                editingDiscussion
                  ? 'Edit pesan...'
                  : replyingTo
                    ? 'Tulis balasan...'
                    : 'Tulis pesan diskusi...'
              }
              value={newMessage}
              onValueChange={setNewMessage}
              minRows={1}
              maxRows={5}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              isIconOnly
              color="primary"
              isLoading={isSending}
              isDisabled={newMessage.trim().length < 2}
              onPress={handleSend}
              className="shrink-0"
            >
              <Send size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">
            Tekan Enter untuk kirim, Shift+Enter untuk baris baru
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
