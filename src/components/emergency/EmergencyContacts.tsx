import { memo, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Edit2, Trash2, Plus, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: 'primary' | 'secondary';
}

interface EmergencyContactsProps {
  contacts: EmergencyContact[];
  onAdd: (contact: EmergencyContact) => void;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (id: string) => void;
}

const avatarColors = [
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-teal-100 text-teal-700 border-teal-200',
];

const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const EmergencyContacts = memo(function EmergencyContacts({
  contacts,
  onAdd,
  onEdit,
  onDelete,
}: EmergencyContactsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    priority: 'secondary' as 'primary' | 'secondary',
  });

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      if (a.priority === 'primary' && b.priority !== 'primary') return -1;
      if (a.priority !== 'primary' && b.priority === 'primary') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [contacts]);

  const handleOpenAdd = () => {
    setEditMode(false);
    setEditId(null);
    setForm({ name: '', relationship: '', phone: '', email: '', priority: 'secondary' });
    setDialogOpen(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setEditMode(true);
    setEditId(contact.id);
    setForm({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || '',
      priority: contact.priority,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) return;

    const contactData: EmergencyContact = {
      id: editId || `contact-${Date.now()}`,
      name: form.name.trim(),
      relationship: form.relationship.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      priority: form.priority,
    };

    if (editMode) {
      onEdit(contactData);
    } else {
      onAdd(contactData);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    // TODO: Backend integration for contact deletion
    onDelete(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Emergency Contacts</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenAdd}
          className="h-8 text-xs font-bold rounded-lg"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Contact
        </Button>
      </div>

      {sortedContacts.length === 0 ? (
        <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Phone className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-900">No Emergency Contacts</p>
            <p className="text-xs text-slate-500 mt-1">Add contacts for emergency situations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedContacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="rounded-2xl border border-slate-200/80 shadow-sm bg-white hover:shadow-card-hover transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(index)}`}
                    >
                      {getInitials(contact.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {contact.name}
                        </h4>
                        {contact.priority === 'primary' && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{contact.relationship}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-xs text-rose-700 font-medium flex items-center gap-1 hover:underline"
                        >
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(contact)}
                        className="h-8 w-8 text-slate-500 hover:text-slate-700"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(contact.id)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-slate-200 p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900 font-heading">
              {editMode ? 'Edit Contact' : 'Add Emergency Contact'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {editMode ? 'Update emergency contact details' : 'Add a new emergency contact'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Name *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Relationship *
              </Label>
              <Input
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                placeholder="e.g. Spouse, Parent, Friend"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone *
              </Label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +1 234 567 8900"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. john@example.com"
                className="h-10 text-xs rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Priority
              </Label>
              <Select value={form.priority} onValueChange={(value: 'primary' | 'secondary') => setForm({ ...form, priority: value })}>
                <SelectTrigger className="h-10 text-xs rounded-xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="primary">Primary (First Contact)</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 h-10 text-xs font-bold rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="flex-1 h-10 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg"
              >
                {editMode ? 'Update' : 'Add Contact'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
