"""
A provider is the source of where the DB data is taken from. AniList, MyAnimeList, and
Kitsu are some examples of providers.
"""

from typing import Iterator

from naoka.media.models import Media


class BaseProvider:
    code: str

    def init(self) -> Iterator[Media]:
        """Initializes this provider in the database. Imports all the media.

        Returns:
            List[Media]: The updated media objects.
        """
        raise NotImplementedError()

    def update(self) -> Iterator[Media]:
        """Updates DB with all the data that has been updated in the provider.

        Returns:
            List[Media]: The updated media objects.
        """
        raise NotImplementedError()
