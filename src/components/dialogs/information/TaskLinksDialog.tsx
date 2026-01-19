import React from 'react';
import { BaseDialog, BaseDialogProps } from '../base/SimpleBaseDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { useDialogValidation } from '../hooks/useDialogValidation';

export interface TaskLink {
  id: string;
  taskId: string;
  taskName: string;
  linkType: 'hyperlink' | 'document' | 'webpage' | 'email';
  url: string;
  description: string;
  lastModified: string;
}

export interface AvailableTask {
  id: string;
  name: string;
  wbs: string;
}

export interface TaskLinksDialogProps extends Omit<BaseDialogProps, 'children'> {
  currentTaskId?: string;
  currentTaskName?: string;
  links?: TaskLink[];
  availableTasks?: AvailableTask[];
  onSave?: (link: Omit<TaskLink, 'id'>) => void;
  onUpdate?: (link: TaskLink) => void;
  onDelete?: (linkId: string) => void;
}

const LINK_TYPES = [
  { value: 'hyperlink', label: 'Hyperlink', description: 'Link to website or external resource' },
  { value: 'document', label: 'Document', description: 'Link to project document or file' },
  { value: 'webpage', label: 'Web Page', description: 'Link to internal web page' },
  { value: 'email', label: 'Email', description: 'Link to email address' }
];

export const TaskLinksDialog: React.FC<TaskLinksDialogProps> = ({
  currentTaskId,
  currentTaskName = '',
  links = [],
  availableTasks = [],
  onSave,
  onUpdate,
  onDelete,
  onClose,
  ...props
}) => {
  const [mode, setMode] = React.useState<'view' | 'add' | 'edit'>('view');
  const [selectedLink, setSelectedLink] = React.useState<TaskLink | null>(null);
  const [linkData, setLinkData] = React.useState({
    taskId: currentTaskId || '',
    taskName: currentTaskName,
    linkType: 'hyperlink' as const,
    url: '',
    description: ''
  });

  const { validate, errors, isValid } = useDialogValidation({
    url: {
      required: true,
      validate: (value) => {
        if (!value.trim()) return 'URL is required';
        
        // Basic URL validation
        try {
          if (linkData.linkType === 'email') {
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? null : 'Invalid email format';
          } else {
            // URL validation
            new URL(value);
            return null;
          }
        } catch {
          return 'Invalid URL format';
        }
      }
    },
    description: {
      required: true,
      minLength: 1,
      validate: (value) => value.trim() ? null : 'Description is required'
    }
  });

  React.useEffect(() => {
    Object.keys(linkData).forEach(key => {
      validate(key, linkData[key as keyof typeof linkData]);
    });
  }, [linkData]);

  const handleFieldChange = (field: keyof typeof linkData, value: any) => {
    setLinkData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLink = () => {
    if (isValid()) {
      onSave?.({
        ...linkData,
        lastModified: new Date().toISOString()
      });
      
      // Reset form
      setLinkData({
        taskId: currentTaskId || '',
        taskName: currentTaskName,
        linkType: 'hyperlink',
        url: '',
        description: ''
      });
      setMode('view');
    }
  };

  const handleEditLink = (link: TaskLink) => {
    setSelectedLink(link);
    setLinkData({
      taskId: link.taskId,
      taskName: link.taskName,
      linkType: link.linkType,
      url: link.url,
      description: link.description
    });
    setMode('edit');
  };

  const handleUpdateLink = () => {
    if (isValid() && selectedLink) {
      onUpdate?.({
        ...selectedLink,
        ...linkData,
        lastModified: new Date().toISOString()
      });
      setMode('view');
      setSelectedLink(null);
    }
  };

  const handleDeleteLink = (linkId: string) => {
    onDelete?.(linkId);
  };

  const canSave = isValid();
  const getTypeDescription = (type: string) => {
    return LINK_TYPES.find(t => t.value === type)?.description || '';
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'hyperlink': return '🔗';
      case 'document': return '📄';
      case 'webpage': return '🌐';
      case 'email': return '📧';
      default: return '🔗';
    }
  };

  return (
    <BaseDialog
      title={`Task Links - ${currentTaskName}`}
      size="fullscreen"
      {...props}
      onClose={onClose}
      footer={
        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {links.length} link(s) total
          </div>
          <div className="flex space-x-2">
            {mode !== 'view' && (
              <Button variant="outline" onClick={() => setMode('view')}>
                Cancel
              </Button>
            )}
            <Button onClick={() => setMode('add')} disabled={mode === 'add'}>
              Add Link
            </Button>
            {mode === 'add' && (
              <Button onClick={handleAddLink} disabled={!canSave}>
                Save Link
              </Button>
            )}
            {mode === 'edit' && (
              <Button onClick={handleUpdateLink} disabled={!canSave}>
                Update Link
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Link Form */}
        {(mode === 'add' || mode === 'edit') && (
          <div className="border rounded-lg p-4 bg-primary/10">
            <Label className="text-sm font-medium mb-3">
              {mode === 'add' ? 'Add New Link' : 'Edit Link'}
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkType">Link Type</Label>
                <Select
                  value={linkData.linkType}
                  onValueChange={(value) => handleFieldChange('linkType', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINK_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {type.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">
                  {linkData.linkType === 'email' ? 'Email Address' : 'URL'} *
                </Label>
                <Input
                  id="url"
                  value={linkData.url}
                  onChange={(e) => handleFieldChange('url', e.target.value)}
                  placeholder={
                    linkData.linkType === 'email' 
                      ? 'email@example.com' 
                      : 'https://example.com'
                  }
                  className={errors.url ? 'border-red-500' : ''}
                />
                {errors.url && (
                  <div className="text-sm text-red-500">{errors.url}</div>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={linkData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Enter link description..."
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <div className="text-sm text-red-500">{errors.description}</div>
                )}
              </div>
            </div>

            {/* Preview */}
            {linkData.url && linkData.description && (
              <div className="mt-4 p-3 border rounded bg-white">
                <Label className="text-sm font-medium mb-2">Preview</Label>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-lg mr-2">{getLinkIcon(linkData.linkType)}</span>
                    <strong>{linkData.description}</strong>
                  </div>
                  <div className="text-muted-foreground">
                    Type: {linkData.linkType} - {getTypeDescription(linkData.linkType)}
                  </div>
                  <div className="text-primary truncate">
                    {linkData.linkType === 'email' 
                      ? `mailto:${linkData.url}`
                      : linkData.url
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links List */}
        {mode === 'view' && links.length > 0 && (
          <div className="space-y-3">
            <Label>All Links</Label>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Link</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map(link => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getLinkIcon(link.linkType)}</span>
                          <span className="font-medium">{link.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {link.linkType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-primary truncate max-w-xs">
                          {link.linkType === 'email' 
                            ? `mailto:${link.url}`
                            : link.url
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(link.lastModified).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditLink(link)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {mode === 'view' && links.length === 0 && (
          <div className="text-center py-8 border rounded-lg bg-muted/30">
            <div className="text-lg font-medium text-muted-foreground mb-2">
              No links yet
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Add links to related documents, websites, or other resources.
            </div>
            <Button onClick={() => setMode('add')}>
              Add First Link
            </Button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold">{links.length}</div>
            <div className="text-sm text-muted-foreground">Total Links</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {links.filter(l => l.linkType === 'hyperlink').length}
            </div>
            <div className="text-sm text-muted-foreground">Hyperlinks</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {links.filter(l => l.linkType === 'document').length}
            </div>
            <div className="text-sm text-muted-foreground">Documents</div>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {links.filter(l => l.linkType === 'webpage').length}
            </div>
            <div className="text-sm text-muted-foreground">Web Pages</div>
          </div>
        </div>
      </div>
    </BaseDialog>
  );
};

