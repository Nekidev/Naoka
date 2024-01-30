# Naoka

Naoka is a desktop app for anime and manga tracking.

## Glossary

Here are some terms that this document and the app in general uses that you'll need to know to understand this document.

| Term     | Definition |
| -------- | ---------- |
| Provider | An external site that provides DB data to Naoka. It may also allow library syncing. |
| Media    | An anime or manga |
| Mapping  | A unique identifier that links a unique media to it's resource in a provider. It's format is `{media type}:{provider code}:{ID}`, where `{media type}` is either anime or manga, `{provider code}` is a unique code that identifies a provider in Naoka (i.e. `anilist` for AniList and `myanimelist` for MyAnimeList), and `{ID}` is the ID of the resource in the provider (i.e. AniList media ID or MAL anime/manga ID |
| Resource field | A piece of named data (the data was assigned a name, e.g. "overall score" in a review) |

## How Does it Work?

Naoka does all the work in the app. Your library is 100% tracked in the app and it only syncs with external providers for backup purposes and for you to be able to update your library from other clients (i.e. any mobile client).

The main difference with any other tracking app is that Naoka's purpose is not to be a client for another tracking site, but rather being the tracker itself. That's why you aren't required to log in to any site to use the app, and I'm even working on an offline provider not to depend on an external site to track your library and so that users are able to track their library offline.

### Syncing

The main problem that I've encountered when planning how to build Naoka's backend (that runs in the frontend, but you get the point) was how to keep things synced in many accounts at the same time. The same media may be in one provider but not in another, and they'll almost always have different IDs in different providers.

To keep all resources linked between sites, I've created what's called the mappings table. It uses any piece of information possible to link the same media on different providers together.

> [!NOTE]
> In case you don't know how DBs work, imagine them like an excel file, where each page is a table and each row in the table is a DB entry (aka "row").

Each row in the mappings table contains a list of mappings, all belonging to the same media on different sites. E.g. all AoButa mappings will be in the same row.

> [!NOTE]
> An API is what the app uses to communicate with providers and get information from them. That's how Naoka gets all the media details from MAL or AniList or any other provider.

Whenever the app has to use a provider's API, it'll extract any mappings from the data received and use it to update the mappings table. Usually, the data returned doesn't contain only one mapping, but multiple. For example, if an anime fetched from MyAnimeList has a link to AniList's page, Naoka will use that link to create a mapping to AniList and the MyAnimeList information gotten to create a mapping to MAL's resource. Since both mappings belong to the same anime, the app will check if any of these is in the table and update it accordingly.

In case it finds two rows (with different mappings, but the recently fetched data has mappings in both rows) with mappings that appear in the recently fetched resource, it'll merge them to link everything together and improve the table.

#### But why?

Imagine you want to import your lists from MAL and AniList at the same time. If the app didn't have this system working in the background, you'd end with duplicate library entries in case that you have tracked the same media in both accounts. The mappings table helps to prevent this and it'd be extremely rare for this to happen (it may happen when media haven't got much information in the providers for the app to be able to link them together). This is still being worked on to reduce even more the possibility of not finding linked resources and ending up with duplicated library entries (see issue #52).

The other use case is when you want to sync your library with external accounts. It may happen that you import your list from AL but want to sync it with MAL, in which case the app would need to know what's the media ID of each AL media in your library in MAL. The mappings table does this job, since it can link separate resources together. That's how the app can sync your lists and transfer them between accounts.

### Importing and Exporting

Importing and exporting a user's library is not as easy as just making HTTP requests with the data the API requires. As explained above, different account's libraries are merged into a single one using the mappings table, which links the same media to different resources on different providers.

Syncing is real-time sync when the library is updated locally, but it takes some time to notice the changes when they're made on an external provider itself. This is because none of the current providers supports webhooks for this, and therefore the app cannot be notified whenever an update is made by the user in an external provider. However, the app will know when the user updates a library entry in the app so it can immediately notify all the external providers about this change so that they update accordingly.

The app makes a few assumptions when syncing the library:
1. The user is the same unique person for all accounts linked.
2. The user will not update the same library entry at the same time in the app and in an external provider itself (e.g. editing a library entry through MAL).

These assumptions are because, since the app cannot be notified of updates made on external providers, any updates made at the same time in an external account and in the app will collide and the app will make an automated decision on what parts of each updated library entry to keep and which not. While the selection of what parts of the update will be accurate as long as the user doesn't update the same field of the entry, if the same field is updated in two (or more) places at the same time, only one of these edits will be kept and the other updates will be lost without consulting the user. Issue #175 has a proposal for the improvement of this point, so you can check it out to see how it goes.

#### Importing

Once an account is connected to the app, there is an initial import that is needed to merge the new account's existing library with the app's local library. There are four ways (methods) of importing a library:

- `Keep`: If a new library entry conflicts with an existing entry, the existing entry will be kept and the new one will be discarded.
- `Override`: If a new library entry conflicts with an existing entry, the existing entry will be deleted and the new one will be kept.
- `Latest`: If a new library entry conflicts with an existing entry, the last updated entry will be kept.
- `Merge`: This is the recommended and default method for importing a library entry. It'll keep the last updated entry, but fill empty fields with the values of the other entries.

The initial import method is selected by the user to prevent any accidental permanent automatic data deletion. After that, the method will be `Merge` for all automatic imports to minimize data loss in extreme cases (as the one discussed above in the app assumptions part).

After the library is imported and merged into the current library, the external account's library will be overriden and updated with the recently merged library. That way, only one version of the library is mantained with entries from all connected account's libraries.

#### Exporting

Exporting the app's library is basically keeping external account's libraries up to date. Whenever a library entry is updated in the app, the app automatically notifies all synced external account's providers of this update and the library is synced everywhere. In case the notification fails (e.g. no internet connection) the failure is stored in the app, and will be infinitely retried until it succeeds. The infinite retrying waits some minutes between retries not to overload the provider's servers.

An issue I've encountered while building the sync system is that providers don't tell the app when a library entry has been removed. This is a problem because when syncing with multiple accounts with different libraries, the app doesn't know whether the entry existed and was removed, or never existed and needs to be created. To make this possible, the app keeps track of which entries are synced and in which specific accounts. That way, if the app knows an entry has been synced with a certain account but the provider says that entry doesn't exist, it means that it was deleted and the app proceeds to delete the entry everywhere.

The app deleting an entry everywhere if one of the providers marks it as not found can definetly be an issue if one of the app's wrappers around a provider's API has a bug or the API itself has one. To prevent this from leading to a catastrophic unintended library entry deletion, the app will store periodic backups of the library in a future version (see issue #113).
