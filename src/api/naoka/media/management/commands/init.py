import time

from django.core.management.base import BaseCommand, CommandError

from naoka.media.models import Media
from naoka.media.providers import registry


class Command(BaseCommand):
    """
    Initializes the database and imports all media from a specific provider.
    """

    def add_arguments(self, parser) -> None:
        parser.add_argument(
            "provider_code",
            type=str,
            help="The name/code of the provider to initialize.",
        )

        parser.add_argument(
            "--commit-every",
            type=int,
            help="Commit changes to DB every x media.",
            default=25,
        )
        parser.add_argument(
            "--conflict",
            action="store_true",
            help="Stop initialization if there's a conflict during the committing to the DB.",
        )
        parser.add_argument(
            "--offset",
            type=int,
            help="Skip the first x media for initialization.",
        )
        parser.add_argument(
            "--resume",
            action="store_true",
            help="Skip the same amount of media as media from the provider already in the DB.",
        )

    def handle(
        self,
        provider_code: str,
        commit_every: int = 25,
        conflict: bool = False,
        offset: int = 0,
        resume: bool = False,
        *args,
        **kwargs,
    ) -> None:
        provider = next(
            filter(lambda p: p.code.lower() == provider_code.lower(), registry), None
        )

        if provider is None:
            raise CommandError(f'"{provider_code}" is not a valid provider.')

        media = []
        i = 0

        try:
            for media_type in provider.media_types:
                for m in provider().init(
                    media_type=media_type,
                    offset=(
                        offset
                        if offset
                        else (
                            Media.objects.filter(
                                mapping__iregex=f":{provider.code}:"
                            ).count()
                            if resume
                            else 0
                        )
                    ),
                ):
                    m.full_clean(validate_unique=False)
                    media.append(m)
                    i += 1

                    self.stdout.write(
                        f"Adding {media_type} ({i}): {m.mapping}", ending="\r"
                    )

                    if commit_every and i % commit_every == 0:
                        Media.objects.bulk_create(media, ignore_conflicts=not conflict)
                        media = []

                Media.objects.bulk_create(media, ignore_conflicts=not conflict)
                media = []

                self.stdout.write("\n")

        except Exception as e:
            self.stderr.write(
                f'Stopping import because of "{e}". All imported media up to now ({i}) will be added to the database.'
            )

        Media.objects.bulk_create(media, ignore_conflicts=not conflict)

        self.stdout.write(f"{i} new media were added to the database.")
