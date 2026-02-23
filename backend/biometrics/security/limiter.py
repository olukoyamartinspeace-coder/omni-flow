<<<<<<< HEAD
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize without app, will be attached in app.py
limiter = Limiter(
    get_remote_address,
    default_limits=["1000 per day", "200 per hour"],
    storage_uri="memory://",
)
=======
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Initialize without app, will be attached in app.py
limiter = Limiter(
    get_remote_address,
    default_limits=["1000 per day", "200 per hour"],
    storage_uri="memory://",
)
>>>>>>> aa92d30cde5631469333d8d66770e30e9a9244ab
