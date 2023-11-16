from naoka.anime.models import Anime


class BaseAPIWrapper(object):
    site_code: str
    
    def list_anime(self, page: int) -> Anime:
        pass

    def get_anime(self, id: int) -> Anime:
        pass

    def update_anime(self, id: int) -> Anime:
        pass
