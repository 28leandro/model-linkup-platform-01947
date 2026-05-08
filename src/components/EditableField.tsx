import { useState, useRef, useEffect } from "react";
import { Check, X, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  value: string | number | undefined;
  onSave: (newValue: string | number) => Promise<void> | void;
  type?: "text" | "number" | "textarea";
  validate?: (val: string) => string | null;
  display?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  canEdit?: boolean;
}

export const EditableField = ({
  value,
  onSave,
  type = "text",
  validate,
  display,
  className,
  inputClassName,
  placeholder,
  canEdit = true,
}: EditableFieldProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(value?.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setDraft(value?.toString() ?? "");
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleCancel = () => {
    setDraft(value?.toString() ?? "");
    setError(null);
    setEditing(false);
  };

  const handleSave = async () => {
    const errMsg = validate?.(draft) ?? null;
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const out = type === "number" ? Number(draft) : draft.trim();
      await onSave(out);
      setEditing(false);
    } catch (e: any) {
      setError(e?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div
        className={cn(
          "group relative inline-flex items-start gap-2",
          canEdit && "cursor-pointer rounded-md hover:bg-muted/50 px-1 -mx-1 transition-colors",
          className
        )}
        onClick={() => canEdit && setEditing(true)}
        role={canEdit ? "button" : undefined}
        tabIndex={canEdit ? 0 : undefined}
        onKeyDown={(e) => {
          if (canEdit && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setEditing(true);
          }
        }}
      >
        <span className="flex-1">{display ?? value ?? placeholder}</span>
        {canEdit && (
          <Pencil className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 mt-1.5 flex-shrink-0" />
        )}
      </div>
    );
  }

  const InputComp = type === "textarea" ? Textarea : Input;

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-start gap-2">
        <InputComp
          ref={inputRef as any}
          type={type === "number" ? "number" : "text"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleCancel();
            if (e.key === "Enter" && type !== "textarea") handleSave();
          }}
          disabled={saving}
          placeholder={placeholder}
          className={cn("flex-1", inputClassName)}
        />
        <div className="flex gap-1 flex-shrink-0">
          <Button
            size="icon"
            variant="default"
            onClick={handleSave}
            disabled={saving}
            className="h-9 w-9"
            aria-label="Salvar"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
            className="h-9 w-9"
            aria-label="Cancelar"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default EditableField;