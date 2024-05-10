from django.core.management.base import BaseCommand

from naoka.media.models import Media
from naoka.media.providers import registry


class Command(BaseCommand):
    """
    Outputs a list of all provider codes.
    """

    def handle(self, *args, **kwargs) -> None:
        self.stdout.write("Currently available providers are:")

        i = 1
        for provider in registry:
            self.stdout.write(f"{i}. {provider.code} ({Media.objects.filter(mapping__iregex=f":{provider.code}:").count()})")
            i += 1
