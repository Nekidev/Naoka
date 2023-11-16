"""
Command to update anime data from third-party APIs.

The flow is the following:
1. Import all anime (and episode) data WITHOUT RELATIONSHIPS from the
   third-party API.
2. Import all studio data from the third-party API and link it to their
   respective animes.
3. Import all character data from the third-party API and link it to their
   respective animes.
4. Import all staff data from the third-party API and link it to their
   respective animes.
"""
