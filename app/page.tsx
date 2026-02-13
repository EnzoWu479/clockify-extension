"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { useState } from "react";
import { useProjectMappings } from "@/hooks/useProjectMappings";
import { useClockifyApiKey } from "@/hooks/useClockifyApiKey";
import { useClockifyExportSettings } from "@/hooks/useClockifyExportSettings";
import { useClockifyTimeEntries } from "@/hooks/useClockifyTimeEntries";
import {
  formatMinutesToHM,
  useClockifyExportText,
} from "@/hooks/useClockifyExportText";
import { useClockifyRhExportText } from "@/hooks/useClockifyRhExportText";
import { useClockifyMonthlyRhExportText } from "@/hooks/useClockifyMonthlyRhExportText";
import { useToast } from "@/hooks/useToast";
import { useExportProfiles } from "@/hooks/useExportProfiles";
import { useActiveProfile } from "@/hooks/useActiveProfile";
import { useTourState } from "@/hooks/useTourState";
import { useHelpContent } from "@/hooks/useHelpContent";
import type { ProfileFormData } from "./components/ProfileForm";
import { ApiKeySection } from "./components/ApiKeySection";
import { DaySummaryHeader } from "./components/DaySummaryHeader";
import { DateControls } from "./components/DateControls";
import { EntriesList } from "./components/EntriesList";
import { ExportSettings } from "./components/ExportSettings";
import { TourOverlay } from "./components/TourOverlay";
import { HelpTooltip } from "./components/HelpTooltip";
import { HelpMenu } from "./components/HelpMenu";
import { FAQModal } from "./components/FAQModal";

function formatTime(iso: string | null): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default function Home() {
  const { apiKey, setApiKey, encryptedApiKey, hasKey, activateKey, clearKey } =
    useClockifyApiKey();

  const { hoursColumnIndex, showSettings, setShowSettings, updateHoursColumn } =
    useClockifyExportSettings();

  const {
    entries,
    selectedDate,
    setSelectedDate,
    isLoadingEntries,
    entriesError,
    groupedEntries,
    totalMinutes,
    uniqueProjectNames,
    changeDate,
    loadEntries,
    clearEntries,
  } = useClockifyTimeEntries({ apiKey: encryptedApiKey, hasKey });

  const { upsertMapping, getExcelValueForProjectName } = useProjectMappings();

  const {
    profiles,
    isLoading: isLoadingProfiles,
    error: profileError,
    createProfile,
    updateProfile,
    deleteProfile,
    clearError: clearProfileError,
  } = useExportProfiles();

  const { activeProfileId, setActiveProfile, getActiveProfile } =
    useActiveProfile();

  const activeProfile = getActiveProfile(profiles);

  const { exportText } = useClockifyExportText({
    groupedEntries,
    hoursColumnIndex: activeProfile?.hoursColumnIndex ?? hoursColumnIndex,
    getExcelValueForProjectName,
    allowedProjectNames: activeProfile?.projectNames,
  });

  const { rhText } = useClockifyRhExportText(entries);
  const { loadMonthlyRhText, isLoadingMonthly } =
    useClockifyMonthlyRhExportText({
      apiKey: encryptedApiKey,
      hasKey,
      selectedDate,
    });
  const { toast, showToast, clearToast } = useToast();
  const { shouldShowTour, state, nextStep, skipTour, resetTour } =
    useTourState();
  const { getContent } = useHelpContent();

  const [activeHelpId, setActiveHelpId] = useState<string | null>(null);
  const [helpAnchorEl, setHelpAnchorEl] = useState<HTMLElement | null>(null);
  const [isFAQOpen, setIsFAQOpen] = useState(false);

  async function handleUseKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await activateKey();
    } catch (error) {
      console.error("Erro ao ativar chave:", error);
      showToast("error", "Erro ao processar a chave da API");
    }
  }

  function handleClearKey() {
    clearKey();
    clearEntries();
    clearToast();
  }

  function handleChangeDate(offsetDays: number) {
    clearToast();
    changeDate(offsetDays);
  }

  async function handleLoadEntries() {
    clearToast();
    await loadEntries();
  }

  function handleHoursColumnChange(rawValue: number) {
    updateHoursColumn(rawValue);
  }

  async function copyTextToClipboard(text: string) {
    if (!text) return;
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      showToast("error", "Clipboard API indisponível");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "Copiado para a área de transferência.");
    } catch {
      showToast("error", "Não foi possível copiar automaticamente.");
    }
  }

  async function handleCopyProject() {
    await copyTextToClipboard(exportText);
  }

  async function handleCopyRh() {
    await copyTextToClipboard(rhText);
  }

  async function handleCopyMonthlyRh() {
    try {
      const monthlyText = await loadMonthlyRhText();
      await copyTextToClipboard(monthlyText);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar dados mensais";
      showToast("error", message);
    }
  }

  async function handleCreateProfile(data: ProfileFormData) {
    await createProfile(data);
  }

  async function handleUpdateProfile(id: string, data: ProfileFormData) {
    await updateProfile(id, data);
  }

  async function handleDeleteProfile(id: string) {
    const result = await deleteProfile(id);
    if (result.wasActive) {
      showToast("success", "Perfil excluído. Usando configuração padrão.");
    }
  }

  async function handleSetActiveProfile(profileId: string | null) {
    await setActiveProfile(profileId);
  }

  function handleShowHelp(
    helpId: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    setActiveHelpId(helpId);
    setHelpAnchorEl(event.currentTarget);
  }

  function handleCloseHelp() {
    setActiveHelpId(null);
    setHelpAnchorEl(null);
  }

  function handleOpenFAQ() {
    setIsFAQOpen(true);
  }

  function handleCloseFAQ() {
    setIsFAQOpen(false);
  }

  const activeHelpContent = activeHelpId ? getContent(activeHelpId) : undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <main className="relative w-full max-w-4xl rounded-3xl border border-slate-800/80 bg-slate-950/60 p-8 md:p-10 shadow-[0_0_80px_rgba(56,189,248,0.25)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-fuchsia-500/30 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-8">
          <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Image
                  src="/clockify-plus.svg"
                  alt="Clockify Plus"
                  width={170}
                  height={30}
                  priority
                />
                <HelpMenu onRestartTour={resetTour} onOpenFAQ={handleOpenFAQ} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-50">
                  Clockify Tasks
                </h1>
                <p className="mt-2 text-sm text-slate-400 max-w-md">
                  Visualize suas tarefas diárias do Clockify e copie o dia em um
                  formato pronto para colar no Excel.
                </p>
              </div>
            </div>
            <ApiKeySection
              apiKey={apiKey}
              hasKey={hasKey}
              onApiKeyChange={setApiKey}
              onSubmit={handleUseKey}
              onClear={handleClearKey}
              onShowHelp={(e) => handleShowHelp("api-key", e)}
            />
          </header>

          <section className="grid">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
              <DaySummaryHeader
                totalLabel={formatMinutesToHM(totalMinutes)}
                dateLabel={formatDateLabel(selectedDate)}
                canCopyProject={Boolean(exportText)}
                onCopyProject={handleCopyProject}
                canCopyRh={Boolean(rhText)}
                onCopyRh={handleCopyRh}
                canCopyMonthlyRh={hasKey && !isLoadingMonthly}
                onCopyMonthlyRh={handleCopyMonthlyRh}
                isLoadingMonthlyRh={isLoadingMonthly}
                activeProfileName={activeProfile?.name}
              />
              <DateControls
                selectedDate={selectedDate}
                onSelectedDateChange={setSelectedDate}
                onChangeDate={handleChangeDate}
                onReload={handleLoadEntries}
                hasKey={hasKey}
                isLoading={isLoadingEntries}
              />
              <EntriesList
                hasKey={hasKey}
                isLoading={isLoadingEntries}
                error={entriesError}
                entries={groupedEntries.map((entry) => ({
                  id: entry.id,
                  description: entry.description,
                  projectName: entry.projectName,
                  durationLabel: formatMinutesToHM(entry.totalMinutes),
                  intervalLabel: `${formatTime(entry.firstStart)} - ${formatTime(entry.lastEnd)}`,
                }))}
              />
              <ExportSettings
                show={showSettings}
                onToggle={() => setShowSettings((prev) => !prev)}
                hoursColumnIndex={hoursColumnIndex}
                onHoursColumnChange={handleHoursColumnChange}
                projectNames={uniqueProjectNames}
                getExcelValueForProjectName={(name) =>
                  getExcelValueForProjectName(name) ?? undefined
                }
                onUpsertMapping={upsertMapping}
                profiles={profiles}
                activeProfileId={activeProfileId}
                isLoadingProfiles={isLoadingProfiles}
                profileError={profileError?.message ?? null}
                onCreateProfile={handleCreateProfile}
                onUpdateProfile={handleUpdateProfile}
                onDeleteProfile={handleDeleteProfile}
                onSetActiveProfile={handleSetActiveProfile}
                onClearProfileError={clearProfileError}
                onShowHelpProfiles={(e) => handleShowHelp("export-profiles", e)}
                onShowHelpMapping={(e) => handleShowHelp("project-mapping", e)}
                onShowHelpColumn={(e) => handleShowHelp("hours-column", e)}
              />
            </div>
          </section>

          {toast && (
            <div
              className={`fixed bottom-4 right-4 z-50 rounded-xl border bg-slate-900/95 px-4 py-2 text-xs shadow-[0_0_25px_rgba(34,211,238,0.25)] ${
                toast.variant === "success"
                  ? "border-emerald-400/70 text-emerald-100 shadow-[0_0_25px_rgba(16,185,129,0.6)]"
                  : "border-rose-400/70 text-rose-100 shadow-[0_0_25px_rgba(248,113,113,0.6)]"
              }`}
            >
              {toast.message}
            </div>
          )}

          <TourOverlay
            run={shouldShowTour}
            currentStep={state.currentStep}
            onNext={nextStep}
            onSkip={skipTour}
          />

          {activeHelpContent && (
            <HelpTooltip
              content={activeHelpContent}
              anchorEl={helpAnchorEl}
              onClose={handleCloseHelp}
            />
          )}

          <FAQModal isOpen={isFAQOpen} onClose={handleCloseFAQ} />
        </div>
      </main>
    </div>
  );
}
