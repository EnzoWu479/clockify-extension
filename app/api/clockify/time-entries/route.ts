import { NextRequest, NextResponse } from "next/server";

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

type TimeEntriesResponse = {
  items: AppTimeEntry[];
};

const CACHE_TTL_MS = 120_000;

type CacheEntry = {
  expiresAt: number;
  payload: TimeEntriesResponse;
};

const timeEntriesCache = new Map<string, CacheEntry>();

function buildCacheKey(apiKey: string, date: string): string {
  return `${apiKey}:${date}`;
}

function getWorkspaceIdFromUser(user: ClockifyUser): string | null {
  return (
    user.activeWorkspace ??
    user.defaultWorkspace ??
    user.memberships?.[0]?.workspaceId ??
    null
  );
}

function buildDateRange(date: string) {
  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59.999`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Data inválida");
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-clockify-api-key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key do Clockify não informada." },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Parâmetro de data (YYYY-MM-DD) é obrigatório." },
      { status: 400 },
    );
  }

  let range: { start: string; end: string };

  try {
    range = buildDateRange(date);
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Data inválida.";

    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }

  const cacheKey = buildCacheKey(apiKey, date);
  const now = Date.now();
  const cached = timeEntriesCache.get(cacheKey);
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
        {
          error: "Erro ao obter usuário do Clockify.",
          details: text,
        },
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
        range.start,
      )}&end=${encodeURIComponent(range.end)}&page-size=5000`,
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
        {
          error: "Erro ao buscar time entries no Clockify.",
          details: text,
        },
        { status: entriesResponse.status },
      );
    }

    const entries = (await entriesResponse.json()) as ClockifyTimeEntry[];

    const projectIds = Array.from(
      new Set(
        entries
          .map((entry) => entry.projectId)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    const projectsById = new Map<string, string>();

    if (projectIds.length > 0) {
      const projectResponses = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            const projectRes = await fetch(
              `${CLOCKIFY_API_BASE_URL}/workspaces/${workspaceId}/projects/${projectId}`,
              {
                headers: {
                  "X-Api-Key": apiKey,
                  "Content-Type": "application/json",
                },
              },
            );

            if (!projectRes.ok) {
              return null;
            }

            const project = (await projectRes.json()) as ClockifyProject;
            return project;
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

    const payload: TimeEntriesResponse = {
      items: entries.map((entry) => ({
        id: entry.id,
        description: entry.description,
        projectId: entry.projectId,
        projectName:
          entry.projectId != null
            ? projectsById.get(entry.projectId) ?? undefined
            : undefined,
        timeInterval: entry.timeInterval,
      })),
    };

    timeEntriesCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Erro ao consultar Clockify:", error);

    return NextResponse.json(
      { error: "Erro inesperado ao consultar o Clockify." },
      { status: 500 },
    );
  }
}
