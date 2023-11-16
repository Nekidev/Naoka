from django.db import models

# Create your models here.


class Character(models.Model):
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

    descriptions = ArrayField(
        ArrayField(models.TextField(), size=2),
        blank=True,
        help_text="An array of arrays containing two items each, being the first one the language code and the second one the description for that language.",
    )

    image_small = models.URLField(null=True)
    image_medium = models.URLField(null=True)
    image_large = models.URLField(null=True)

    mappings = ArrayField(models.JSONField())


class CharacterRelationship(models.Model):
    class Role(models.Model):
        MAIN = "main"
        SUPPORTING = "supporting"

    role = models.CharField(max_length=10, choices=Role.choices, default=Role.MAIN)
    node = models.ForeignKey(
        "characters.Character", on_delete=models.CASCADE, related_name="relationships"
    )
