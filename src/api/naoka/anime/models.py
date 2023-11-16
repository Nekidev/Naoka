from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey


class Anime(models.Model):
    class Type(models.TextChoices):
        TV = "tv"
        OVA = "ova"
        ONA = "ona"
        MOVIE = "movie"
        MUSIC = "music"
        SPECIAL = "special"

    class Status(models.TextChoices):
        UPCOMING = "upcoming"
        ONGOING = "ongoing"
        HIATUS = "hiatus"
        CANCELLED = "cancelled"
        FINISHED = "finished"

    class Source(models.TextChoices):
        ORIGINAL = "original"
        ANIME = "anime"
        MANGA = "manga"
        NOVEL = "novel"
        WEB_NOVEL = "web_novel"
        LIGHT_NOVEL = "light_novel"
        VISUAL_NOVEL = "visual_novel"
        VIDEO_GAME = "video_game"
        DOUJINSHI = "doujinshi"
        LIVE_ACTION = "live_action"
        GAME = "game"
        COMIC = "comic"
        PICTURE_BOOK = "picture_book"
        MULITMEDIA_PROJECT = "multimedia_project"
        OTHER = "other"

    class Rating(models.TextChoices):
        G = "g"
        PG = "pg"
        PG_13 = "pg_13"
        R = "r"
        R_PLUS = "r_plus"
        RX = "rx"

    titles = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=False,
        help_text="An array of arrays containing two items each, being the first one the language code and the second one the title for that language.",
    )
    descriptions = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=True,
        help_text="An array of arrays containing two items each, being the first one the language code and the second one the description for that language.",
    )

    image_cover_small = models.URLField(null=True, blank=True)
    image_cover_medium = models.URLField(null=True, blank=True)
    image_cover_large = models.URLField(null=True, blank=True)
    image_banner = models.URLField(null=True, blank=True)

    type = models.CharField(max_length=7, choices=Type.choices, default=Type.TV)
    status = models.CharField(
        max_length=9, choices=Status.choices, default=Status.FINISHED
    )
    source = models.CharField(
        max_length=18, choices=Source.choices, default=Source.OTHER
    )
    rating = models.CharField(max_length=6, choices=Rating.choices, default=Rating.G)

    genres = models.ManyToManyField("anime.AnimeGenre", blank=True, related_name="anime")
    demographics = ArrayField(models.TextField(), blank=True)

    broadcast_start = models.DateField(null=True, blank=True)
    broadcast_end = models.DateField(null=True, blank=True)
    broadcast_when = ArrayField(
        ArrayField(models.PositiveSmallIntegerField()), blank=True
    )

    episodes_count = models.PositiveIntegerField(null=True, blank=True)
    episodes_duration = models.PositiveSmallIntegerField(null=True, blank=True)

    studios = models.ManyToManyField("anime.Studio", blank=True, related_name="anime")
    related_anime = models.ManyToManyField(
        "anime.AnimeRelationship", blank=True, related_name="anime"
    )

    characters = models.ManyToManyField(
        "characters.CharacterRelationship", blank=True, related_name="anime"
    )
    staff = models.ManyToManyField("people.PersonRelationship", blank=True, related_name="anime")

    music = models.ManyToManyField(
        "anime.SongRelationship", blank=True, related_name="anime"
    )

    links = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=2,
        help_text="An array of arrays containing two items each, being the first one the site name and the second one the URL.",
    )
    streaming = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=2,
        help_text="An array of arrays containing two items each, being the first one the site name and the second one the URL to stream the anime/the site URL.",
    )
    videos = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=2,
        help_text="An array of arrays containing two items each, being the first one the video title and the second one the Youtube ID.",
    )


class AnimeRelationship(models.Model):
    class Type(models.TextChoices):
        ADAPTATION = "adaptation"
        PREQUEL = "prequel"
        SEQUEL = "sequel"
        PARENT = "parent"
        SIDE_STORY = "side_story"
        CHARACTER = "character"
        SUMMARY = "summary"
        ALTERNATIVE = "alternative"
        SPIN_OFF = "spin_off"
        OTHER = "other"
        SOURCE = "source"
        COMPILATION = "compilation"
        CONTAINS = "contains"

    type = models.CharField(max_length=11, choices=Type.choices, default=Type.OTHER)
    node = models.ForeignKey(
        "anime.Anime", on_delete=models.CASCADE, related_name="relationships"
    )


class AnimeGenre(models.Model):
    name = models.TextField()
    mappings = ArrayField(models.JSONField(), blank=True)


class Episode(models.Model):
    anime = models.ForeignKey(
        "anime.Anime",
        on_delete=models.CASCADE,
        related_name="episodes",
    )

    titles = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=False,
        help_text="An array of arrays containing two items each, being the first one the language code and the second one the title for that language.",
    )
    descriptions = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=True,
        help_text="An array of arrays containing two items each, being the first one the language code and the second one the description for that language.",
    )

    number = models.PositiveIntegerField()
    season = models.SmallPositiveIntegerField(default=1)

    duration = models.PositiveIntegerField(null=True, blank=True)

    thumbnail_small = models.URLField(null=True, blank=True)
    thumbnail_medium = models.URLField(null=True, blank=True)
    thumbnail_large = models.URLField(null=True, blank=True)

    mappings = ArrayField(models.JSONField(), blank=True)


class Studio(models.Model):
    name = models.TextField()
    mappings = ArrayField(models.JSONField(), blank=True)


class Song(models.Model):
    name = models.TextField()
    artists = ArrayField(models.TextField(), blank=True)


class SongRelationship(models.Model):
    class Type(models.TextChoices):
        OPENING = "opening"
        ENDING = "ending"

    type = models.CharField(max_length=7, choices=Type.choices, default=Type.OPENING)
    node = models.ForeignKey(
        "anime.Song",
    )
