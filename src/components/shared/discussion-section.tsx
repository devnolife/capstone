'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addToast } from '@/lib/toast';
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
  Loader2,
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

const roleConfig: Record<string, { label: string; className: string; icon: typeof GraduationCap }> = {
  MAHASISWA: { label: 'Mahasiswa', className: 'bg-primary/10 text-primary', icon: GraduationCap },
  DOSEN_PENGUJI: { label: 'Dosen', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', icon: UserCheck },
  ADMIN: { label: 'Admin', className: 'bg-destructive/10 text-destructive', icon: ShieldCheck },
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
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-border' : ''}`}>
      <div className="group py-3">
        <div className="flex items-start gap-3">
          <Avatar size="sm" className="shrink-0 mt-0.5">
            {discussion.author.image && (
              <AvatarImage
                src={getSimakPhotoUrl(discussion.author.image)}
                alt={discussion.author.name}
              />
            )}
            <AvatarFallback>
              {discussion.author.name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{discussion.author.name}</span>
              <Badge
                variant="secondary"
                className={`h-5 text-[10px] ${roleCfg.className}`}
              >
                <RoleIcon size={10} />
                {roleCfg.label}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-app-teritary-invert">
                <Clock size={10} />
                {timeAgo(discussion.createdAt)}
                {discussion.isEdited && <span className="italic">(diedit)</span>}
              </span>
            </div>
            <div className="mt-1 text-sm text-foreground whitespace-pre-wrap break-words">
              {discussion.content}
            </div>
            <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isReply && (
                <Button
                  size="xs"
                  variant="ghost"
                  className="h-6 text-xs text-app-teritary-invert"
                  onClick={() => onReply(discussion.id)}
                >
                  <Reply size={12} />
                  Balas
                </Button>
              )}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button size="icon-xs" variant="ghost" className="h-6 w-6" />
                    }
                  >
                    <MoreVertical size={12} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(discussion)}>
                      <Edit3 size={14} />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(discussion.id)}
                    >
                      <Trash2 size={14} />
                      Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
    <Card className="border border-border shadow-none">
      <CardHeader className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Diskusi Project</h3>
            <p className="text-xs text-app-teritary-invert">
              {totalMessages} pesan
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Spinner className="size-6" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle size={40} className="mx-auto mb-3 text-app-quaternary-invert" />
            <p className="text-sm text-app-teritary-invert">Belum ada diskusi</p>
            <p className="text-xs text-app-teritary-invert mt-1">Mulai diskusi dengan menulis pesan di bawah</p>
          </div>
        ) : (
          <div className="px-6 divide-y divide-border max-h-[500px] overflow-y-auto">
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
        <div className="border-t border-border p-4">
          {/* Reply/Edit indicator */}
          <AnimatePresence>
            {(replyingTo || editingDiscussion) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-app-quaternary text-xs">
                  <div className="flex items-center gap-2">
                    {editingDiscussion ? (
                      <>
                        <Edit3 size={12} className="text-primary" />
                        <span className="text-app-teritary-invert">Mengedit pesan</span>
                      </>
                    ) : (
                      <>
                        <Reply size={12} className="text-primary" />
                        <span className="text-app-teritary-invert">
                          Membalas <strong>{replyingToDiscussion?.author.name}</strong>
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="h-5 text-xs px-2"
                    onClick={cancelAction}
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
              onChange={(e) => setNewMessage(e.target.value)}
              rows={1}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              size="icon"
              disabled={isSending || newMessage.trim().length < 2}
              onClick={handleSend}
              className="shrink-0"
            >
              {isSending ? <Loader2 className="animate-spin" /> : <Send size={16} />}
            </Button>
          </div>
          <p className="text-[10px] text-app-teritary-invert mt-1">
            Tekan Enter untuk kirim, Shift+Enter untuk baris baru
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
