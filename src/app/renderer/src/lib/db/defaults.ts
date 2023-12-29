import { LibraryEntry, LibraryStatus } from "./types";

export const defaultLibraryEntry: LibraryEntry = {
    type: "anime",
    favorite: false,
    status: LibraryStatus.NotStarted,
    score: 0,
    episodeProgress: 0,
    chapterProgress: 0,
    volumeProgress: 0,
    restarts: 0,
    startDate: null,
    finishDate: null,
    notes: "",
    mapping: "myanimelist:anime:1",
    updatedAt: new Date(),
}
