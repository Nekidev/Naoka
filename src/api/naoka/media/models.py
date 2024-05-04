from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

from naoka.constants import media_types


def validate_mapping(value: str) -> None:
    """Validates a mapping. Mappings use the following format:
    `MediaType:Provider:ID`

    Args:
        value (str): The mapping value.

    Raises:
        ValidationError: The mapping doesn't have enough sections.
        ValidationError: Mapping sections must not be empty.
        ValidationError: The media type of the mapping is invalid.

    TODO: Add validation for provider codes.
    """

    sections = value.split(":", 2)

    if len(sections) != 3:
        raise ValidationError(_("The mapping doesn't have enough sections."))

    media_type, media_provider, media_id = sections

    if not all(sections):
        raise ValidationError(_("Mapping sections must not be empty."))

    if media_type.lower() not in media_types:
        raise ValidationError(
            _(f"The media type must be one of the following: {media_types.join(", ")}.")
        )


class Media(models.Model):
    """
    Stores the media's data. It may be either an anime, a manga, or a visual novel.
    """

    class Type(models.TextChoices):
        ANIME = "anime"
        MANGA = "manga"
        VISUAL_NOVEL = "visual_novel"

    class Format(models.TextChoices):
        TV = "tv"
        TV_SHORT = "tv_short"
        MOVIE = "movie"
        SPECIAL = "special"
        OVA = "ova"
        ONA = "ona"
        MUSIC = "music"
        MANGA = "manga"
        NOVEL = "novel"
        LIGHT_NOVEL = "light_novel"
        ONE_SHOT = "one_shot"
        DOUJINSHI = "doujinshi"
        MANHWA = "manhwa"
        MANHUA = "manhua"
        OEL = "oel"

    class Status(models.TextChoices):
        # Relay on `date_start` and `date_finish` to determine the status. This is so
        # that the app doesn't need to update the data from the API nor the server
        # needs to constantly check the status to update it.
        AUTO = "auto"

        HIATUS = "hiatus"
        CANCELLED = "cancelled"

    class Rating(models.TextChoices):
        G = "g"
        PG = "pg"
        PG_13 = "pg_13"
        R = "r"
        R_PLUS = "r_plus"
        RX = "rx"

    type = models.CharField(choices=Type.choices, max_length=12)

    title_ro = models.TextField("Title (Romaji)", blank=True, null=True)
    title_en = models.TextField("Title (English)", blank=True, null=True)
    title_es = models.TextField("Title (Spanish)", blank=True, null=True)
    title_na = models.TextField("Title (Native)", blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    image_large = models.URLField(null=True, blank=True)
    image_small = models.URLField(null=True, blank=True)
    banner = models.URLField(null=True, blank=True)

    episodes = models.PositiveIntegerField(null=True, blank=True)
    chapters = models.PositiveIntegerField(null=True, blank=True)
    volumes = models.PositiveIntegerField(null=True, blank=True)
    duration = models.TimeField(
        null=True, blank=True, help_text=_("The average duration of each episode.")
    )

    status = models.CharField(choices=Status.choices, default=Status.AUTO, max_length=9)
    date_start = models.DateField("Start date", null=True, blank=True)
    date_finish = models.DateField("Date finish", null=True, blank=True)

    genres = models.JSONField()

    format = models.CharField(
        choices=Format.choices, max_length=11, null=True, blank=True
    )
    rating = models.CharField(
        choices=Rating.choices, max_length=6, null=True, blank=True
    )
    is_adult = models.BooleanField(default=False)

    mapping = models.CharField(
        max_length=32, db_index=True, validators=[validate_mapping], help_text=_("Format: MediaType:Provider:ID")
    )

    created_at = models.DateTimeField(auto_now_add=True, editable=False)
    updated_at = models.DateTimeField(auto_now=True, editable=False)

    def link(self) -> None:
        """Creates and links necessary Mappings.
        """

    def clean(self) -> None:
        """Validates instance of Media.

        Raises:
            ValidationError: At least one of the titles must have a value.
            ValidationError: At least one cover image must be provided.
            ValidationError: Genres must be an array of strings.
        """

        if not all([self.title_ro, self.title_en, self.title_es, self.title_na]):
            raise ValidationError(_("At least one of the titles must have a value."))

        if not any([self.image_large, self.image_small]):
            raise ValidationError(_("At least one cover image must be provided."))

        if not (
            isinstance(self.genres, list)
            and all(map(lambda i: isinstance(i, str) and i != "", self.genres))
        ):
            raise ValidationError({"genres": _("Genres must be an array of strings.")})


class Mappings(models.Model):
    mappings = models.JSONField()

    @property
    def media(self):
        return Media.objects.filter(mapping__in=self.mappings)

    def clean(self) -> None:
        """Validates instance of Mappings.

        Raises:
            ValidationError: Mappings must be an array of strings.
            ValidationError: Any of the errors thrown by `validate_mapping`.
        """

        if not (
            isinstance(self.mappings, list)
            and all(map(lambda i: isinstance(i, str) and i != "", self.mappings))
        ):
            raise ValidationError(
                {"mappings": _("Mappings must be an array of strings.")}
            )

        try:
            map(lambda i: validate_mapping(i), self.mappings)
        except ValidationError as e:
            # Reraise the error, but as an error for the `mappings` property.
            raise ValidationError({"mappings": e.message})
