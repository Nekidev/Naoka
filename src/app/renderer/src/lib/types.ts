import { providers } from "./api";

export type MediaType = "anime" | "manga";

export type LibraryStatus =
    | "not_started"
    | "planned"
    | "in_progress"
    | "paused"
    | "dropped"
    | "completed";

export type APIProvider = keyof typeof providers;

// Provider:MediaType:ID
export type Mapping = `${APIProvider}:${MediaType}:${string}`;
