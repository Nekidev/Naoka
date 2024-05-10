"""
Provider: MyAnimeList
Docs: https://docs.api.jikan.moe/
      https://myanimelist.net/apiconfig/references/api/v2
"""

from typing import Iterator

from datetime import datetime

from naoka.utils import parse_time
from naoka.media.models import Media
from naoka.media.providers.base import BaseProvider

import requests


class MyAnimeListProvider(BaseProvider):
    code = "MyAnimeList"

    _base_url = "https://api.jikan.moe/v4"

    def init(self) -> Iterator[Media]:
        # Anime fetching
        page = 1

        while True:
            r = requests.get(f"{self._base_url}/anime?page={page}")
            r.raise_for_status()

            data = r.json()

            for anime in data["data"]:
                yield self._anime_to_media(anime)

            if not data["pagination"]["has_next_page"]:
                break

            page += 1

        # Manga fetching
        page = 1

        while True:
            r = requests.get(f"{self._base_url}/manga?page={page}")
            r.raise_for_status()

            data = r.json()

            for anime in data["data"]:
                yield self._manga_to_media(anime)

            if not data["pagination"]["has_next_page"]:
                break

            page += 1

    def update(self) -> Iterator[Media]:
        pass

    def _anime_to_media(self, data: dict) -> Media:
        """Converts the raw jikan API anime data to an internal Media instance.

        Args:
            data (dict): The raw jikan API anime data.

        Returns:
            Media: The parsed Media instance.
        """

        return Media(
            mapping=f"anime:myanimelist:{data["mal_id"]}",
            type=Media.Type.ANIME,
            title_ro=data["title"],
            title_en=data["title_english"],
            title_es=next(
                map(lambda t: t["title"], filter(lambda t: t["type"] == "Spanish", data["titles"])), None
            ),
            title_na=data["title_japanese"],
            description=data["synopsis"],
            image_large=data["images"]["webp"]["large_image_url"]
            or data["images"]["jpg"]["large_image_url"],
            image_small=data["images"]["webp"]["small_image_url"]
            or data["images"]["jpg"]["small_image_url"],
            episodes=data["episodes"],
            duration=parse_time(data["duration"]) if data["duration"] else None,
            status=self._normalize_status(data["status"]),
            date_start=(
                datetime.fromisoformat(data["aired"]["from"]).date()
                if data["aired"]["from"]
                else None
            ),
            date_finish=(
                datetime.fromisoformat(data["aired"]["to"]).date()
                if data["aired"]["to"]
                else None
            ),
            genres=list(
                filter(
                    lambda i: i,
                    map(
                        lambda i: self._normalize_genre(i),
                        [genre["name"] for genre in data["genres"]],
                    ),
                )
            ) + list(
                filter(
                    lambda i: i,
                    map(
                        lambda i: self._normalize_genre(i),
                        [genre["name"] for genre in data["explicit_genres"]],
                    ),
                )
            ),
            format=self._normalize_format(data["type"]) if data["type"] else None,
            rating=self._normalize_rating(data["rating"]) if data["rating"] else None,
            links=[f"https://myanimelist.net/anime/{data["mal_id"]}"]
        )

    def _manga_to_media(self, data: dict) -> Media:
        """Converts the raw jikan API manga data to an internal Media instance.

        Args:
            data (dict): The raw jikan API manga data.

        Returns:
            Media: The parsed Media instance.
        """

        return Media(
            mapping=f"manga:myanimelist:{data["mal_id"]}",
            type=Media.Type.MANGA,
            title_ro=data["title"],
            title_en=data["title_english"],
            title_es=next(
                map(lambda t: t["title"], filter(lambda t: t["type"] == "Spanish", data["titles"])), None
            ),
            title_na=data["title_japanese"],
            description=data["synopsis"],
            image_large=data["images"]["webp"]["large_image_url"]
            or data["images"]["jpg"]["large_image_url"],
            image_small=data["images"]["webp"]["small_image_url"]
            or data["images"]["jpg"]["small_image_url"],
            chapters=data["chapters"],
            volumes=data["volumes"],
            status=self._normalize_status(data["status"]),
            date_start=(
                datetime.fromisoformat(data["published"]["from"]).date()
                if data["published"]["from"]
                else None
            ),
            date_finish=(
                datetime.fromisoformat(data["published"]["to"]).date()
                if data["published"]["to"]
                else None
            ),
            genres=list(
                filter(
                    lambda i: i,
                    map(
                        lambda i: self._normalize_genre(i),
                        [genre["name"] for genre in data["genres"]],
                    ),
                )
            ) + list(
                filter(
                    lambda i: i,
                    map(
                        lambda i: self._normalize_genre(i),
                        [genre["name"] for genre in data["explicit_genres"]],
                    ),
                )
            ),
            format=self._normalize_format(data["type"]) if data["type"] else None,
            links=[f"https://myanimelist.net/anime/{data["mal_id"]}"]
        )

    def _normalize_genre(self, genre: str) -> Media.Genre | None:
        """Converts the MAL genres to Media.Genre.

        Args:
            genre (str): The raw MAL genre name.

        Returns:
            Media.Genre | None: The corresponding Media.Genre, or None if invalid.
        """

        return {
            "action": Media.Genre.ACTION,
            "adventure": Media.Genre.ADVENTURE,
            "avant garde": Media.Genre.AVANT_GARDE,
            "award winning": Media.Genre.AWARD_WINNING,
            "boys love": Media.Genre.YAOI,
            "comedy": Media.Genre.COMEDY,
            "drama": Media.Genre.DRAMA,
            "fantasy": Media.Genre.FANTASY,
            "girls love": Media.Genre.YURI,
            "gourmet": Media.Genre.GOURMET,
            "horror": Media.Genre.HORROR,
            "mistery": Media.Genre.MISTERY,
            "romance": Media.Genre.ROMANCE,
            "sci-fi": Media.Genre.SCI_FI,
            "slice of life": Media.Genre.SLICE_OF_LIFE,
            "sports": Media.Genre.SPORTS,
            "supernatural": Media.Genre.SUPERNATURAL,
            "suspense": Media.Genre.SUSPENSE,
        }.get(genre.lower())

    def _normalize_format(self, format: str) -> Media.Format | None:
        """Converts the MAL media format to Media.Format.

        Args:
            format (str): The raw MAL media format.

        Returns:
            Media.Format | None: The corresponding Media.Format, or None if invalid.
        """

        format = format.replace(" ", "_").replace("-", "_")

        return Media.Format[format.upper()] if format.lower() in Media.Format else None

    def _normalize_rating(self, rating: str) -> Media.Rating | None:
        """Converts the Jikan API age rating to Media.Rating.

        Args:
            rating (str): The raw Jikan API rating.

        Returns:
            Media.Rating | None: The corresponding Media.Rating, or None if invalid.
        """

        return {
            "g - all ages": Media.Rating.G,
            "pg - children": Media.Rating.PG,
            "pg-13 - teens 13 or older": Media.Rating.PG_13,
            "r - 17+ (violence & profanity)": Media.Rating.R,
            "r+ - mild nudity": Media.Rating.R_PLUS,
            "rx - hentai": Media.Rating.RX,
        }.get(rating.lower())

    def _normalize_status(self, status: str) -> Media.Status:
        """Converts the Jikan API status to Media.Status.

        Args:
            status (str): The raw Jikan API status.

        Returns:
            Media.Status: The corresponding Media.Status.
        """

        return {
            "finished airing": Media.Status.FINISHED,
            "finished": Media.Status.FINISHED,
            "on hiatus": Media.Status.HIATUS,
            "discontinued": Media.Status.CANCELLED
        }.get(status.lower(), Media.Status.AUTO)
