import { providers } from "./providers";

export type MediaType = "anime" | "manga";

export type LibraryStatus =
    | "not_started"
    | "planned"
    | "in_progress"
    | "paused"
    | "dropped"
    | "completed";

export type Provider = keyof typeof providers;

// Provider:MediaType:ID
export type Mapping = `${Provider}:${MediaType}:${string}`;
