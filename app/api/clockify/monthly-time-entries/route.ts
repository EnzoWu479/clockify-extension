import { NextRequest, NextResponse } from "next/server";
import { decryptApiKey, isEncrypted } from "@/infra/crypto/decryption";

const CLOCKIFY_API_BASE_URL =
  process.env.CLOCKIFY_API_BASE_URL ?? "https://api.clockify.me/api/v1";

type ClockifyUser = {
  id: string;
  activeWorkspace?: string;
  defaultWorkspace?: string;
  memberships?: { workspaceId: string }[];
};

type ClockifyTimeInterval = {
  start: string;
  end: string | null;
  duration: string | null;
};

type ClockifyTimeEntry = {
  id: string;
  description: string;
  projectId?: string;
  timeInterval: ClockifyTimeInterval;
};

type ClockifyProject = {
  id: string;
  name: string;
};

type AppTimeEntry = {
  id: string;
  description: string;
  projectId?: string;
  projectName?: string;
  timeInterval: ClockifyTimeInterval;
};

type MonthlyTimeEntriesResponse = {
  /** Keys are YYYY-MM-DD date strings */
  byDate: Record<string, AppTimeEntry[]>;
};

const CACHE_TTL_MS = 120_000;

type CacheEntry = {
  expiresAt: number;
  payload: MonthlyTimeEntriesResponse;
};

const monthlyCache = new Map<string, CacheEntry>();

function getWorkspaceIdFromUser(user: ClockifyUser): string | null {
  return (
    user.activeWorkspace ??
    user.defaultWorkspace ??
    user.memberships?.[0]?.workspaceId ??
    null
  );
}

export async function GET(request: NextRequest) {
  const encryptedApiKey = request.headers.get("x-clockify-api-key");

  if (!encryptedApiKey) {
    return NextResponse.json(
      { error: "API key do Clockify não informada." },
      { status: 401 },
    );
  }

  let apiKey: string;
  try {
    if (isEncrypted(encryptedApiKey)) {
      apiKey = decryptApiKey(encryptedApiKey);
    } else {
      apiKey = encryptedApiKey;
    }
  } catch (error) {
    console.error("Erro ao descriptografar API key:", error);
    return NextResponse.json(
      { error: "Chave da API inválida ou corrompida." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  if (!yearParam || !monthParam) {
    return NextResponse.json(
      { error: "Parâmetros 'year' e 'month' são obrigatórios." },
      { status: 400 },
    );
  }

  const year = parseInt(yearParam, 10);
  const month = parseInt(monthParam, 10); // 1-based

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Parâmetros 'year' e 'month' inválidos." },
      { status: 400 },
    );
  }

  // Build full-month date range
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);

  const cacheKey = `${encryptedApiKey}:${year}-${month}`;
  const now = Date.now();
  const cached = monthlyCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.payload);
  }

  try {
    const userResponse = await fetch(`${CLOCKIFY_API_BASE_URL}/user`, {
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      const text = await userResponse.text();
      return NextResponse.json(
        { error: "Erro ao obter usuário do Clockify.", details: text },
        { status: userResponse.status },
      );
    }

    const user = (await userResponse.json()) as ClockifyUser;
    const workspaceId = getWorkspaceIdFromUser(user);

    if (!workspaceId) {
      return NextResponse.json(
        {
          error:
            "Não foi possível determinar o workspace do usuário no Clockify.",
        },
        { status: 500 },
      );
    }

    const entriesResponse = await fetch(
      `${CLOCKIFY_API_BASE_URL}/workspaces/${workspaceId}/user/${user.id}/time-entries?start=${encodeURIComponent(
        start.toISOString(),
      )}&end=${encodeURIComponent(end.toISOString())}&page-size=5000`,
      {
        headers: {
          "X-Api-Key": apiKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (!entriesResponse.ok) {
      const text = await entriesResponse.text();
      return NextResponse.json(
        { error: "Erro ao buscar time entries no Clockify.", details: text },
        { status: entriesResponse.status },
      );
    }

    const entries = (await entriesResponse.json()) as ClockifyTimeEntry[];

    // Resolve project names with a single batch of requests (one per unique project)
    const projectIds = Array.from(
      new Set(
        entries
          .map((e) => e.projectId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const projectsById = new Map<string, string>();

    if (projectIds.length > 0) {
      const projectResponses = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const res = await fetch(
              `${CLOCKIFY_API_BASE_URL}/workspaces/${workspaceId}/projects/${projectId}`,
              {
                headers: {
                  "X-Api-Key": apiKey,
                  "Content-Type": "application/json",
                },
              },
            );
            if (!res.ok) return null;
            return (await res.json()) as ClockifyProject;
          } catch {
            return null;
          }
        }),
      );

      for (const project of projectResponses) {
        if (project) {
          projectsById.set(project.id, project.name);
        }
      }
    }

    // Group entries by local date (YYYY-MM-DD) based on the entry's start time
    const byDate: Record<string, AppTimeEntry[]> = {};

    for (const entry of entries) {
      const entryStart = new Date(entry.timeInterval.start);
      // Convert to local date string YYYY-MM-DD
      const dateKey = `${entryStart.getFullYear()}-${String(entryStart.getMonth() + 1).padStart(2, "0")}-${String(entryStart.getDate()).padStart(2, "0")}`;

      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }

      byDate[dateKey].push({
        id: entry.id,
        description: entry.description,
        projectId: entry.projectId,
        projectName:
          entry.projectId != null
            ? (projectsById.get(entry.projectId) ?? undefined)
            : undefined,
        timeInterval: entry.timeInterval,
      });
    }

    const payload: MonthlyTimeEntriesResponse = { byDate };

    monthlyCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Erro ao consultar Clockify (monthly):", error);
    return NextResponse.json(
      { error: "Erro inesperado ao consultar o Clockify." },
      { status: 500 },
    );
  }
}
