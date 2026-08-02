"use client";

import {
  AlertTriangle,
  Check,
  Crown,
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Moon,
  Monitor,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppIcon } from "@/components/app-icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconPicker } from "@/components/icon-picker";
import { PageHeader } from "@/components/page-header";
import { PremiumBadge, PremiumGate } from "@/components/premium";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { buildDemoData } from "@/lib/demo";
import { exportCSV, exportExcel, exportJSON, exportPDF, parseImportedJSON } from "@/lib/export";
import { useFeature } from "@/lib/features";
import { ACCENTS, CURRENCIES } from "@/lib/presets";
import { getPersistedSnapshot, useBudgetStore, useCurrentMonth } from "@/lib/store";
import { BUDGET_TEMPLATES } from "@/lib/templates";
import type { CurrencyCode, Lang, ProfileMeta, Theme } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { t } = useI18n();
  const settings = useBudgetStore((s) => s.settings);
  const updateSettings = useBudgetStore((s) => s.updateSettings);
  const importData = useBudgetStore((s) => s.importData);
  const resetAll = useBudgetStore((s) => s.resetAll);
  const plan = useBudgetStore((s) => s.plan);
  const setPlan = useBudgetStore((s) => s.setPlan);
  const profiles = useBudgetStore((s) => s.profiles);
  const activeProfileId = useBudgetStore((s) => s.activeProfileId);
  const createProfile = useBudgetStore((s) => s.createProfile);
  const switchProfile = useBudgetStore((s) => s.switchProfile);
  const deleteProfile = useBudgetStore((s) => s.deleteProfile);
  const canMultiProfile = useFeature("multipleProfiles");
  const month = useCurrentMonth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [deletingProfile, setDeletingProfile] = useState<ProfileMeta | null>(null);

  // New profile dialog state (reset on open — event-driven)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileIcon, setProfileIcon] = useState("users");
  const [templateId, setTemplateId] = useState<string>("blank");

  const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: "light", label: t("settings.light"), icon: Sun },
    { id: "dark", label: t("settings.dark"), icon: Moon },
    { id: "system", label: t("settings.system"), icon: Monitor },
  ];

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = parseImportedJSON(String(reader.result));
      if (data) {
        importData(data);
        toast.success(t("settings.importSuccess"));
      } else {
        toast.error(t("settings.importError"));
      }
    };
    reader.readAsText(file);
  };

  const openProfileDialog = () => {
    if (!canMultiProfile && profiles.length >= 1) {
      toast.error(t("profiles.limit"));
      return;
    }
    setProfileName("");
    setProfileIcon("users");
    setTemplateId("blank");
    setProfileDialogOpen(true);
  };

  const submitProfile = () => {
    if (!profileName.trim()) return;
    const template = BUDGET_TEMPLATES.find((tpl) => tpl.id === templateId) ?? null;
    createProfile(profileName, profileIcon, template);
    setProfileDialogOpen(false);
    toast.success(t("toast.saved"));
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Plan */}
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-wrap items-center gap-4">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                plan === "premium"
                  ? "bg-premium/15 text-premium"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Crown className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold">
                {t("premium.plan")}
                <Badge variant={plan === "premium" ? "default" : "secondary"}>
                  {plan === "premium" ? t("premium.premiumName") : t("premium.free")}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground">
                {plan === "premium" ? t("premium.demoHint") : t("premium.desc")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="plan-switch" className="text-sm">
                {t("premium.enable")}
              </Label>
              <Switch
                id="plan-switch"
                checked={plan === "premium"}
                onCheckedChange={(v) => setPlan(v ? "premium" : "free")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget profiles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              <Users className="size-4" aria-hidden />
              {t("profiles.title")}
              {!canMultiProfile && <PremiumBadge />}
              <Button size="sm" className="ml-auto gap-2" onClick={openProfileDialog}>
                <Plus className="size-3.5" aria-hidden />
                {t("profiles.new")}
              </Button>
            </CardTitle>
            <CardDescription>{t("profiles.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {profiles.map((profile) => {
              const active = profile.id === activeProfileId;
              return (
                <div
                  key={profile.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3",
                    active && "border-primary bg-primary/5"
                  )}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <AppIcon name={profile.icon} className="size-4.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{profile.name}</p>
                    {active && (
                      <p className="flex items-center gap-1 text-xs text-primary">
                        <Check className="size-3" aria-hidden />
                        {t("profiles.active")}
                      </p>
                    )}
                  </div>
                  {!active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => switchProfile(profile.id)}
                    >
                      {t("profiles.activate")}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("common.delete")}
                    disabled={profiles.length <= 1}
                    onClick={() => setDeletingProfile(profile)}
                  >
                    <Trash2 className="size-4 text-negative" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Profile (display name) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("settings.profile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Label htmlFor="user-name">{t("settings.userName")}</Label>
              <Input
                id="user-name"
                value={settings.userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                placeholder={t("settings.userNamePlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & currency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("settings.regional")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t("settings.language")}</Label>
              <Select
                value={settings.language}
                onValueChange={(v) =>
                  v !== null && updateSettings({ language: v as Lang })
                }
                items={{ fr: "🇫🇷 Français", en: "🇬🇧 English" }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.currency")}</Label>
              <Select
                value={settings.currency}
                onValueChange={(v) =>
                  v !== null && updateSettings({ currency: v as CurrencyCode })
                }
                items={Object.fromEntries(
                  CURRENCIES.map((c) => [c.code, c.label])
                )}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("settings.appearance")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>{t("settings.theme")}</Label>
              <div
                className="grid grid-cols-3 gap-2"
                role="radiogroup"
                aria-label={t("settings.theme")}
              >
                {themes.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={settings.theme === id}
                    onClick={() => updateSettings({ theme: id })}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-sm font-medium transition-colors",
                      settings.theme === id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40"
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.accent")}</Label>
              <div
                className="flex flex-wrap gap-3"
                role="radiogroup"
                aria-label={t("settings.accent")}
              >
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={settings.accent === a.id}
                    aria-label={a.label}
                    onClick={() => updateSettings({ accent: a.id })}
                    className="flex size-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: a.value }}
                  >
                    {settings.accent === a.id && (
                      <Check className="size-4 text-white" aria-hidden />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {t("settings.data")}
              <PremiumBadge />
            </CardTitle>
            <CardDescription>{t("settings.export")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <PremiumGate feature="exports">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!month}
                  onClick={() =>
                    month &&
                    exportPDF(month, settings.currency, settings.language).catch(
                      () => toast.error("Erreur d'export")
                    )
                  }
                >
                  <FileText className="size-4 text-negative" aria-hidden />
                  {t("settings.exportPDF")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!month}
                  onClick={() => month && exportCSV(month)}
                >
                  <Download className="size-4 text-blue-500" aria-hidden />
                  {t("settings.exportCSV")}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!month}
                  onClick={() =>
                    month &&
                    exportExcel(month).catch(() => toast.error("Erreur d'export"))
                  }
                >
                  <FileSpreadsheet className="size-4 text-positive" aria-hidden />
                  {t("settings.exportExcel")}
                </Button>
              </div>
            </PremiumGate>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => exportJSON(getPersistedSnapshot())}
            >
              <FileJson className="size-4 text-premium" aria-hidden />
              {t("settings.exportJSON")}
            </Button>

            <div className="rounded-lg border border-dashed p-4">
              <p className="text-sm font-medium">{t("settings.import")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.importDesc")}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 gap-2"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-4" aria-hidden />
                {t("settings.import")}
              </Button>
            </div>

            <Button
              variant="outline"
              className="justify-start gap-2"
              onClick={() => setDemoOpen(true)}
            >
              <Sparkles className="size-4 text-primary" aria-hidden />
              <span>
                {t("settings.demo")}
                <span className="block text-xs font-normal text-muted-foreground">
                  {t("settings.demoDesc")}
                </span>
              </span>
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-negative/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-negative">
              <AlertTriangle className="size-4" aria-hidden />
              {t("settings.dangerZone")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setResetOpen(true)}
              className="gap-2"
            >
              <AlertTriangle className="size-4" aria-hidden />
              {t("settings.reset")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* New profile dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profiles.new")}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitProfile();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="profile-name">{t("profiles.name")}</Label>
              <Input
                id="profile-name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={t("profiles.namePlaceholder")}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("common.icon")}</Label>
              <IconPicker value={profileIcon} onChange={setProfileIcon} />
            </div>
            <div className="grid gap-2">
              <Label>{t("profiles.template")}</Label>
              <div
                className="grid max-h-56 gap-2 overflow-y-auto rounded-lg border p-2"
                role="radiogroup"
                aria-label={t("profiles.template")}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={templateId === "blank"}
                  onClick={() => setTemplateId("blank")}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                    templateId === "blank"
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/40"
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Sparkles className="size-4 text-primary" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {t("profiles.blank")}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {t("profiles.blankDesc")}
                    </span>
                  </span>
                </button>
                {BUDGET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    role="radio"
                    aria-checked={templateId === tpl.id}
                    onClick={() => setTemplateId(tpl.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                      templateId === tpl.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/40"
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <AppIcon name={tpl.icon} className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {t(tpl.titleKey)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t(tpl.descKey)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setProfileDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={!profileName.trim()}>
                {t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deletingProfile !== null}
        onOpenChange={(open) => !open && setDeletingProfile(null)}
        title={t("common.confirmDelete")}
        description={
          deletingProfile
            ? `${deletingProfile.name} — ${t("profiles.deleteWarning")}`
            : undefined
        }
        onConfirm={() => {
          if (deletingProfile) {
            deleteProfile(deletingProfile.id);
            toast.success(t("toast.deleted"));
          }
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t("settings.reset")}
        description={t("settings.resetConfirm")}
        onConfirm={() => {
          resetAll();
          toast.success(t("toast.deleted"));
        }}
      />
      <ConfirmDialog
        open={demoOpen}
        onOpenChange={setDemoOpen}
        title={t("settings.demo")}
        description={t("settings.demoDesc")}
        onConfirm={() => {
          importData(buildDemoData(settings));
          toast.success(t("settings.importSuccess"));
        }}
      />
    </div>
  );
}
