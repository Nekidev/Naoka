from datetime import time


def parse_time(text: str) -> time:
    """Parses a string like "1 hr 25 mins 30 secs" to a python time object.

    Args:
        text (str): The string to parse.

    Returns:
        datetime.time: The time object parsed from the string.
    """

    hours = 0
    minutes = 0
    seconds = 0

    parts = text.split()

    for i in range(len(parts)):
        if parts[i] == "hr" or parts[i] == "hrs":
            hours = int(parts[i - 1])

        elif parts[i] == "min" or parts[i] == "mins":
            minutes = int(parts[i - 1])

        elif parts[i] == "sec" or parts[i] == "secs":
            seconds = int(parts[i - 1])

    return time(hour=hours, minute=minutes, second=seconds)
