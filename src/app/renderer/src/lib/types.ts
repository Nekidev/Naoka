export type MediaType = "anime" | "manga";

export type LibraryStatus =
    | "not_started"
    | "planned"
    | "in_progress"
    | "paused"
    | "dropped"
    | "completed";

export type APIProvider = "myanimelist";

// Provider:MediaType:ID
export type Mapping = `${APIProvider}:${MediaType}:${string}`;
