import requests

from lib.base import BaseAPIWrapper

from naoka.anime.models import Anime, AnimeGenre, Episode, Studio
from naoka.people.models import Person, PersonRelationship
from naoka.characters.models import Character, CharacterRelationship


def _get_query(name: str) -> str:
    with open(f"./queries/{name}.graphql", "r") as f:
        return f.read()


class AnilistWrapper(BaseAPIWrapper):
    site_code = "anilist"

    def _get_anime_from_response(self, response: dict):
        anime = Anime.objects.get_or_create()

    def list_anime(self, page: int):
        query = _get_query("list-anime")

        response = requests.post(
            "https://graphql.anilist.co",
            json={
                "query": query,
                "variables": {
                    "page": page,
                }
            }
        )

        for anime in response.json()["data"]["Page"]["media"]:
            yield self._get_anime_from_response(anime)
