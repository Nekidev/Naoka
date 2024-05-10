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
            "--cooldown",
            type=int,
            help="The time in seconds to wait between call to the API."
        )
        parser.add_argument(
            "--commit-every",
            type=int,
            help="Commit changes to DB every x media."
        )
        parser.add_argument(
            "--ignore-conflicts",
            action="store_true",
            help="Ignore DB conflicts."
        )

    def handle(self, provider_code: str, commit_every: int | None, ignore_conflicts: bool = False, *args, **kwargs) -> None:
        provider = next(
            filter(lambda p: p.code.lower() == provider_code.lower(), registry), None
        )

        if provider is None:
            raise CommandError(f'"{provider_code}" is not a valid provider.')

        media = []
        i = 0

        try:
            for m in provider().init():
                m.full_clean(validate_unique=False)
                media.append(m)
                i += 1

                self.stdout.write(f"Adding: ({i}) {m.mapping}", ending="\r")

                if commit_every and i % commit_every == 0:
                    Media.objects.bulk_create(media, ignore_conflicts=ignore_conflicts)
                    media = []

        except Exception as e:
            self.stderr.write(
                f'Stopping import because of "{e}". All imported media up to now ({i}) will be added to the database.'
            )

        Media.objects.bulk_create(media, ignore_conflicts=ignore_conflicts)

        self.stdout.write(f"{i} new media were added to the database.")
