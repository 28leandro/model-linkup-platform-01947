import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialValue?: string;
  onSubmit: (q: string) => void;
}

const MobileSearchDialog = ({ open, onOpenChange, initialValue = "", onSubmit }: Props) => {
  const { t } = useLanguage();
  const [q, setQ] = useState(initialValue);
  useEffect(() => { if (open) setQ(initialValue); }, [open, initialValue]);

  const submit = () => {
    onSubmit(q.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] translate-y-0 max-w-[92vw] sm:max-w-md p-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{t("nav.search")}</h2>
          <Input
            autoFocus
            placeholder={t("search.placeholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="h-11 text-base"
          />
          <Button onClick={submit} className="h-11">
            <Search className="w-4 h-4 mr-2" />
            {t("search.button")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileSearchDialog;
