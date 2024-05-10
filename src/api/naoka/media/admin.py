from django.contrib import admin

from naoka.media.models import Media, Mappings


admin.site.site_header = "Naoka API"
admin.site.site_title = "Naoka API Administration"
admin.site.index_title = "API Administration"


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = [
        "type",
        "title",
        "format",
        "status",
        "rating",
        "is_adult",
        "mapping",
        "created_at",
        "updated_at",
    ]
    list_display_links = ["title"]
    list_filter = ["type", "rating", "is_adult", "status", "format"]
    search_fields = [
        "title_en__icontains",
        "title_na__icontains",
        "title_ro__icontains",
        "title_es__icontains",
        "description__icontains",
        "mapping__icontains",
    ]
    readonly_fields = ["created_at", "updated_at"]

    @admin.display
    def title(self, obj: Media) -> str:
        return obj.title_en or obj.title_ro or obj.title_na or obj.title_es
