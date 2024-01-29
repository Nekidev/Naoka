# Naoka

Naoka is a desktop app for anime and manga tracking.

## Glossary

Here are some terms that this document and the app in general uses that you'll need to know to understand this document.

| Term     | Definition |
| -------- | ---------- |
| Provider | An external site that provides DB data to Naoka. It may also allow library syncing. |
| Media    | An anime or manga |
| Mapping  | A unique identifier that links a unique media to it's resource in a provider. It's format is `{media type}:{provider code}:{ID}`, where `{media type}` is either anime or manga, `{provider code}` is a unique code that identifies a provider in Naoka (i.e. `anilist` for AniList and `myanimelist` for MyAnimeList), and `{ID}` is the ID of the resource in the provider (i.e. AniList media ID or MAL anime/manga ID |

## How Does it Work?

Naoka does all the work in the app. Your library is 100% tracked in the app and it only syncs with external providers for backup purposes and for you to be able to update your library from other clients (i.e. any mobile client).

The main difference with any other tracking app is that Naoka's purpose is not to be a client for another tracking site, but rather being the tracker itself. That's why you aren't required to log in to any site to use the app, and I'm even working on an offline provider not to depend on an external site to track your library and so that users are able to track their library offline.

### Syncing

The main problem that I've encountered when planning how to build Naoka's backend (that runs in the frontend, but you get the point) was how to keep things synced in many accounts at the same time. The same media may be in one provider but not in another, and they'll almost always have different IDs in different providers.

To keep all resources linked between sites, I've created what's called the mappings table. It uses any piece of information possible to link the same media on different providers together.

> [!INFO]
> In case you don't know how DBs work, imagine them like an excel file, where each page is a table and each row in the table is a DB entry (aka "row").

Each row in the mappings table contains a list of mappings, all belonging to the same media on different sites. E.g. all AoButa mappings will be in the same row.

> [!INFO]
> An API is what the app uses to communicate with providers and get information from them. That's how Naoka gets all the media details from MAL or AniList or any other provider.

Whenever the app has to use a provider's API, it'll extract any mappings from the data received and use it to update the mappings table. Usually, the data returned doesn't contain only one mapping, but multiple. For example, if an anime fetched from MyAnimeList has a link to AniList's page, Naoka will use that link to create a mapping to AniList and the MyAnimeList information gotten to create a mapping to MAL's resource. Since both mappings belong to the same anime, the app will check if any of these is in the table and update it accordingly.

In case it finds two rows (with different mappings, but the recently fetched data has mappings in both rows) with mappings that appear in the recently fetched resource, it'll merge them to link everything together and improve the table.

#### But why?

Imagine you want to import your lists from MAL and AniList at the same time. If the app didn't have this system working in the background, you'd end with duplicate library entries in case that you have tracked the same media in both accounts. The mappings table helps to prevent this and it'd be extremely rare for this to happen (it may happen when media haven't got much information in the providers for the app to be able to link them together).

The other use case is when you want to sync your library with external accounts. It may happen that you import your list from AL but want to sync it with MAL, in which case the app would need to know what's the media ID of each AL media in your library in MAL. The mappings table does this job, since it can link separate resources together. That's how the app can sync your lists and transfer them between accounts.

### Importing and Exporting