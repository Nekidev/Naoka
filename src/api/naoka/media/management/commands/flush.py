from django.core.management.base import BaseCommand

from naoka.media.models import Media, Mappings


class Command(BaseCommand):
    """
    Deletes all Media and Mapping objects in the DB.
    """

    def handle(self, *args, **kwargs) -> None:
        media_count, _ = Media.objects.all().delete()
        mappings_count, _ = Mappings.objects.all().delete()

        self.stdout.write(
            f"Successfully flushed DB.\nDeleted Media: {media_count}\nDeleted Mappings: {mappings_count}"
        )
