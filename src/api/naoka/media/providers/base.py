"""
A provider is the source of where the DB data is taken from. AniList, MyAnimeList, and
Kitsu are some examples of providers.
"""

from typing import Iterator, List, Literal

from naoka.utils.types import media_types
from naoka.media.models import Media


class BaseProvider:
    code: str
    media_types: List[media_types]

    def init(self, media_type: media_types, offset: int = 0) -> Iterator[Media]:
        """Initializes this provider in the database. Imports all the media.

        Args:
            media_type ("anime" | "manga" | "visual_novel"): The type of the media to
                initialize.
            offset (int): The amount of items to skip during initialization. Useful to
                continue previous failed runs.

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
