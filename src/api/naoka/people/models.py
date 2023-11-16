from django.db import models
from django.contrib.postgres.fields import ArrayField

# Create your models here.


class Person(models.Model):
    name_first = models.TextField(null=True)
    name_middle = models.TextField(null=True)
    name_last = models.TextField(null=True)

    @property
    def name_full(self):
        return " ".join(
            [
                name
                for name in [self.name_first, self.name_middle, self.name_last]
                if name is not None
            ]
        )

    image_small = models.URLField(null=True)
    image_medium = models.URLField(null=True)
    image_large = models.URLField(null=True)

    mappings = ArrayField(models.JSONField())


class PersonRelationship(models.Model):
    roles = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=False,
        help_text="An array of arrays containing two items each, being the first one the language code and the second one the role for that language.",
    )
    node = models.ForeignKey(
        "people.Person", on_delete=models.CASCADE, related_name="relationships"
    )
