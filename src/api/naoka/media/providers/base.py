"""
A provider is the source of where the DB data is taken from. AniList, MyAnimeList, and
Kitsu are some examples of providers.
"""

from typing import Iterator, List, Literal

from naoka.utils.types import MediaType
from naoka.media.models import Media


class BaseProvider:
    code: str
    media_types: List[MediaType]

    def init(self, media_type: MediaType, offset: int = 0) -> Iterator[Media]:
        """Initializes this provider in the database. Imports all the media.

        Args:
            media_type (MediaType): The type of the media to
                initialize.
            offset (int): The amount of items to skip during initialization. Useful to
                continue previous failed runs.

        Returns:
            List[Media]: The updated media objects.
        """
        raise NotImplementedError()

    def update(self, media_type: MediaType) -> Iterator[Media]:
        """Updates DB with all the data that has been updated in the provider.

        Args:
            media_type

        Returns:
            List[Media]: The updated media objects.
        """
        raise NotImplementedError()
